"""
FinVision-RL — Full End-to-End Pipeline
Runs: Download → Preprocess → Generate Images → Train CNN → Extract Embeddings → Train RL → Evaluate
Supports multiple tickers via --tickers TSLA,BTC-USD,ETH-USD,NVDA
"""
import argparse
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.ingestion.downloader import DataDownloader
from src.preprocessing.missing_handler import handle_missing
from src.preprocessing.outlier_handler import clip_outliers
from src.preprocessing.differencing import frac_diff_dataframe
from src.preprocessing.windowing import create_windows
from src.labeling.direction_label import generate_direction_labels, align_windows_labels
from src.image_generation.candlestick_generator import CandlestickGenerator
from src.image_generation.gaf_generator import GAFGenerator
from src.image_generation.image_saver import save_images
from src.datasets.image_dataset import ImageDataset
from src.cnn.training.train import train_cnn
from src.cnn.inference.embeddings import extract_embeddings
from src.rl.training.train_rl import train_rl_agent
from src.rl.inference.forecast import run_inference
from src.evaluation.backtesting import Backtester
from src.evaluation.metrics import compute_all_metrics
from src.visualization.report_generator import generate_report
from src.config.hyperparameters import (
    CNN_BACKBONE, RL_ALGORITHM, WINDOW_SIZE, IMAGE_METHOD,
    TRAIN_RATIO, VAL_RATIO,
)
from src.config.settings import DATA_DIR
from src.utils.seed import set_seed
from src.utils.logger import log


N_AHEAD = 1
MIN_ROWS_AFTER_DIFF = WINDOW_SIZE + N_AHEAD + 10
MIN_WINDOWS         = 30

DEFAULT_TICKERS = ["TSLA", "BTC-USD", "ETH-USD", "NVDA"]


def parse_args():
    parser = argparse.ArgumentParser(description="FinVision-RL Pipeline")
    parser.add_argument(
        "--tickers", type=str, default=None,
        help="Comma-separated tickers e.g. TSLA,BTC-USD,ETH-USD,NVDA"
    )
    parser.add_argument(
        "--ticker", type=str, default=None,
        help="Single ticker (use --tickers for multi-ticker)"
    )
    parser.add_argument("--start",        type=str, default="2018-01-01")
    parser.add_argument("--end",          type=str, default="2024-12-31")
    parser.add_argument("--asset-type",   type=str, default="stocks",
                        choices=["stocks", "crypto", "forex"])
    parser.add_argument("--backbone",     type=str, default=CNN_BACKBONE,
                        choices=["resnet18", "resnet50", "custom"])
    parser.add_argument("--algorithm",    type=str, default=RL_ALGORITHM,
                        choices=["PPO", "DQN"])
    parser.add_argument("--image-method", type=str, default=IMAGE_METHOD,
                        choices=["candlestick", "gaf"])
    parser.add_argument("--skip-download", action="store_true")
    parser.add_argument("--skip-cnn",      action="store_true")
    parser.add_argument("--skip-rl",       action="store_true")
    return parser.parse_args()


def _validate_and_fix_prices(prices: np.ndarray, ticker: str) -> np.ndarray:
    """
    Ensure prices are positive and in a tradeable range.
    If near-zero (fractionally differenced leak), scale up or reconstruct.
    """
    prices = np.where(prices > 0, prices, np.nan)
    # Forward-fill any NaNs
    for i in range(1, len(prices)):
        if np.isnan(prices[i]):
            prices[i] = prices[i - 1]
    # If still NaN at start, fill with 1.0
    if np.isnan(prices[0]):
        prices[0] = 1.0
    for i in range(1, len(prices)):
        if np.isnan(prices[i]):
            prices[i] = prices[i - 1]

    median_price = float(np.median(np.abs(prices)))

    if median_price < 0.1:
        log.warning(
            f"  {ticker}: prices look fractionally differenced "
            f"(median={median_price:.6f}). Reconstructing from returns."
        )
        # Treat values as log-returns, reconstruct a price series from base 100
        clipped = np.clip(prices, -0.5, 0.5)
        prices  = np.cumprod(1.0 + clipped).astype(np.float32) * 100.0
        log.info(
            f"  {ticker}: reconstructed prices range "
            f"[{prices.min():.2f}, {prices.max():.2f}]"
        )
    elif median_price < 1.0:
        scale  = 100.0 / (median_price + 1e-8)
        prices = (prices * scale).astype(np.float32)
        log.info(
            f"  {ticker}: prices scaled {scale:.1f}x → "
            f"median now {float(np.median(prices)):.2f}"
        )

    return prices.astype(np.float32)


def process_ticker(
    ticker: str,
    df_raw,
    generator,
    img_dir: Path,
    n_train: int | None = None,
    n_val:   int | None = None,
) -> dict | None:
    """
    Run preprocessing → windowing → labeling → image generation
    for a single ticker.

    Returns splits dict, or None if ticker has too little data to be useful.
    """
    log.info(f"  Processing {ticker}: {len(df_raw)} rows")

    # Preprocess
    df            = handle_missing(df_raw)
    df            = clip_outliers(df)
    raw_close     = df["Close"].values.copy().astype(np.float64)
    df_stationary = frac_diff_dataframe(df)

    if len(df_stationary) < MIN_ROWS_AFTER_DIFF:
        log.warning(
            f"  {ticker}: only {len(df_stationary)} rows after frac_diff "
            f"(need >= {MIN_ROWS_AFTER_DIFF}). Skipping."
        )
        return None

    windows, timestamps, label_indices = create_windows(
        df_stationary, normalize=True, n_ahead=N_AHEAD
    )
    labels = generate_direction_labels(
        df, price_col="Close", n_ahead=N_AHEAD, flat_threshold=0.002
    )
    windows, labels, timestamps = align_windows_labels(
        windows, labels, timestamps, label_indices
    )

    if len(windows) < MIN_WINDOWS:
        log.warning(
            f"  {ticker}: only {len(windows)} windows after alignment "
            f"(need >= {MIN_WINDOWS}). Skipping."
        )
        return None

    n    = len(windows)
    up   = int((labels == 1).sum())
    down = int((labels == 0).sum())
    log.info(f"  {ticker}: {n} windows | UP={up} ({up/n:.1%}) DOWN={down} ({down/n:.1%})")

    if up / n > 0.85 or up / n < 0.15:
        log.warning(
            f"  {ticker} label imbalance: UP={up/n:.1%}. "
            f"This ticker may not add bearish diversity."
        )

    # ── Price alignment ───────────────────────────────────────────────────────
    # CRITICAL: always use raw_close (original prices), NOT stationary values.
    # df_stationary contains fractionally-differenced values (near-zero),
    # which cause portfolio bankruptcy at step 0 in MarketEnv.
    price_offset   = len(df_stationary) - n
    aligned_prices = raw_close[price_offset: price_offset + n].copy()

    # Validate & fix: guard against any near-zero or negative leakage
    aligned_prices = _validate_and_fix_prices(aligned_prices, ticker)

    log.info(
        f"  {ticker}: aligned_prices range "
        f"[{aligned_prices.min():.4f}, {aligned_prices.max():.4f}], "
        f"median={float(np.median(aligned_prices)):.4f}"
    )

    aligned_ohlcv = df_stationary.values[price_offset: price_offset + n].astype(np.float32)

    # ── Chronological split ───────────────────────────────────────────────────
    _n_train = n_train if n_train is not None else int(n * TRAIN_RATIO)
    _n_val   = n_val   if n_val   is not None else int(n * VAL_RATIO)
    _n_train = min(_n_train, n)
    _n_val   = min(_n_val,   n - _n_train)

    splits = {
        "train": {
            "windows": windows[:_n_train],
            "labels":  labels[:_n_train],
            "ohlcv":   aligned_ohlcv[:_n_train],
            "prices":  aligned_prices[:_n_train],
        },
        "val": {
            "windows": windows[_n_train:_n_train + _n_val],
            "labels":  labels[_n_train:_n_train + _n_val],
            "ohlcv":   aligned_ohlcv[_n_train:_n_train + _n_val],
            "prices":  aligned_prices[_n_train:_n_train + _n_val],
        },
        "test": {
            "windows":    windows[_n_train + _n_val:],
            "labels":     labels[_n_train + _n_val:],
            "ohlcv":      aligned_ohlcv[_n_train + _n_val:],
            "prices":     aligned_prices[_n_train + _n_val:],
            "timestamps": timestamps[_n_train + _n_val:],
        },
        "timestamps": timestamps,
        "n_train":    _n_train,
        "n_val":      _n_val,
    }

    # Generate images for each split
    for split in ("train", "val", "test"):
        images = generator.batch_to_images(splits[split]["windows"])
        meta   = save_images(
            images,
            splits[split]["labels"],
            img_dir / split / ticker,
            ticker,
        )
        splits[split]["meta"] = meta

    return splits


def merge_splits(*ticker_splits: dict, split: str) -> dict:
    """Concatenate a given split across all tickers."""
    merged = {
        "windows": np.concatenate([s[split]["windows"] for s in ticker_splits]),
        "labels":  np.concatenate([s[split]["labels"]  for s in ticker_splits]),
        "ohlcv":   np.concatenate([s[split]["ohlcv"]   for s in ticker_splits]),
        "prices":  np.concatenate([s[split]["prices"]  for s in ticker_splits]),
        "meta":    sum([s[split]["meta"] for s in ticker_splits], []),
    }
    if split == "test":
        merged["timestamps"] = np.concatenate(
            [s[split]["timestamps"] for s in ticker_splits]
        )
    up = int((merged["labels"] == 1).sum())
    down = int((merged["labels"] == 0).sum())
    n  = len(merged["labels"])
    log.info(
        f"Merged {split}: {n} samples | "
        f"UP={up} ({up/n:.1%}) DOWN={down} ({down/n:.1%})"
    )
    return merged


def main():
    args = parse_args()
    set_seed()

    # Resolve ticker list
    if args.tickers:
        tickers = [t.strip() for t in args.tickers.split(",") if t.strip()]
    elif args.ticker:
        tickers = [args.ticker]
    else:
        tickers = DEFAULT_TICKERS
        log.info(f"No tickers specified — using defaults: {tickers}")

    log.info(f"=== FinVision-RL Pipeline START: {tickers} ===")

    # ── Step 1: Data Download ────────────────────────────────────────────────
    log.info("Step 1/7: Downloading data...")
    downloader  = DataDownloader()
    ticker_data = downloader.download_multiple(
        tickers,
        start=args.start,
        end=args.end,
        asset_type=args.asset_type,
    )

    if not ticker_data:
        raise RuntimeError("No tickers downloaded successfully. Check network/tickers.")

    active_tickers = list(ticker_data.keys())
    log.info(f"Active tickers: {active_tickers}")

    # ── Steps 2–4: Per-ticker preprocessing + windowing + images ─────────────
    log.info("Steps 2–4: Preprocessing, windowing, labeling, image generation...")
    from src.config.settings import IMAGES_DIR
    img_dir = IMAGES_DIR / args.image_method

    generator = (
        CandlestickGenerator() if args.image_method == "candlestick"
        else GAFGenerator()
    )

    all_splits = {}
    for ticker in active_tickers:
        log.info(f"Processing {ticker}...")
        result = process_ticker(
            ticker=ticker,
            df_raw=ticker_data[ticker],
            generator=generator,
            img_dir=img_dir,
        )
        if result is None:
            log.warning(f"Skipping {ticker} — unusable after preprocessing.")
            continue
        all_splits[ticker] = result

    active_tickers = list(all_splits.keys())
    if not active_tickers:
        raise RuntimeError(
            "No tickers survived preprocessing. "
            "Check frac_diff settings or use tickers with more historical data."
        )
    log.info(f"Successfully processed: {active_tickers}")

    # ── Merge all tickers ────────────────────────────────────────────────────
    log.info("Merging all tickers...")
    ticker_split_list = list(all_splits.values())

    train_merged = merge_splits(*ticker_split_list, split="train")
    val_merged   = merge_splits(*ticker_split_list, split="val")
    test_merged  = merge_splits(*ticker_split_list, split="test")

    # Overall label balance check
    all_labels = np.concatenate([
        train_merged["labels"],
        val_merged["labels"],
        test_merged["labels"],
    ])
    up_ratio = (all_labels == 1).mean()
    log.info(
        f"Overall label balance: UP={up_ratio:.1%} DOWN={1-up_ratio:.1%} "
        f"({len(all_labels)} total samples)"
    )
    if up_ratio > 0.75 or up_ratio < 0.25:
        log.warning(
            f"Still imbalanced after merging ({up_ratio:.1%} UP). "
            f"Consider adding more bearish tickers."
        )

    # ── Step 5: CNN Training ─────────────────────────────────────────────────
    log.info("Step 5/7: Training CNN...")
    all_meta = train_merged["meta"] + val_merged["meta"]

    if not args.skip_cnn:
        cnn_model, cnn_history = train_cnn(all_meta, backbone=args.backbone)
        log.info("CNN training complete.")
    else:
        from src.cnn.training.train import build_model
        from src.config.paths import cnn_checkpoint_path
        import torch
        from src.utils.device import DEVICE
        cnn_model = build_model(args.backbone)
        ckpt = torch.load(
            str(cnn_checkpoint_path(args.backbone)), map_location=DEVICE
        )
        cnn_model.load_state_dict(ckpt["model_state_dict"])
        cnn_model.eval()
        log.info("Skipped CNN training — loaded saved model.")

    # ── Step 6: Extract Embeddings & Train RL ────────────────────────────────
    log.info("Step 6/7: Extracting embeddings & training RL...")

    test_dataset    = ImageDataset(test_merged["meta"], train=False)
    test_embeddings = extract_embeddings(cnn_model, test_dataset)

    if not args.skip_rl:
        train_val_meta       = train_merged["meta"] + val_merged["meta"]
        train_val_dataset    = ImageDataset(train_val_meta, train=False)
        train_val_embeddings = extract_embeddings(cnn_model, train_val_dataset)
        train_val_labels     = np.array([m["label"] for m in train_val_meta])
        train_val_ohlcv      = np.concatenate([
            train_merged["ohlcv"], val_merged["ohlcv"]
        ])
        train_val_prices     = np.concatenate([
            train_merged["prices"], val_merged["prices"]
        ])

        rl_agent = train_rl_agent(
            embeddings=train_val_embeddings,
            ohlcv=train_val_ohlcv,
            labels=train_val_labels,
            prices=train_val_prices,
            algorithm=args.algorithm,
        )
    else:
        from src.config.paths import rl_checkpoint_path
        from src.rl.env.market_env import MarketEnv

        dummy_emb    = np.zeros((10, 512), np.float32)
        dummy_ohlcv  = np.zeros((10, 5),   np.float32)
        dummy_labels = np.zeros(10, np.int64)
        dummy_prices = np.ones(10,  np.float32) * 100.0
        env_fn = lambda: MarketEnv(
            dummy_emb, dummy_ohlcv, dummy_labels, dummy_prices
        )

        if args.algorithm == "PPO":
            from src.rl.agents.ppo_agent import PPOAgent
            rl_agent = PPOAgent(env_fn=env_fn)
        else:
            from src.rl.agents.dqn_agent import DQNAgent
            rl_agent = DQNAgent(env_fn=env_fn)

        rl_agent.load(rl_checkpoint_path(args.algorithm))
        log.info("Skipped RL training — loaded saved agent.")

    # ── Step 7: Evaluation ───────────────────────────────────────────────────
    log.info("Step 7/7: Evaluating on test set...")

    inference_result = run_inference(
        agent=rl_agent,
        embeddings=test_embeddings,
        ohlcv=test_merged["ohlcv"],
        labels=test_merged["labels"],
        prices=test_merged["prices"],
    )

    backtester  = Backtester()
    backtest_df = backtester.run(
        prices=test_merged["prices"],
        actions=inference_result["actions"],
    )

    # Guard: ensure portfolio_value column has enough rows
    pv = backtest_df["portfolio_value"].values
    p0 = pv[0] if len(pv) > 0 else 1.0

    metrics = compute_all_metrics(
        y_true=test_merged["prices"] / (test_merged["prices"][0] + 1e-8),
        y_pred=pv / (p0 + 1e-8),
        directions_true=test_merged["labels"][:len(inference_result["actions"])],
        directions_pred=inference_result["actions"],
        portfolio_values=pv,
    )

    report = generate_report(
        metrics=metrics,
        asset="+".join(active_tickers),
        algorithm=args.algorithm,
        backbone=args.backbone,
        test_period=(
            str(test_merged["timestamps"][0]),
            str(test_merged["timestamps"][-1]),
        ),
        output_path=(
            DATA_DIR.parent / "experiments"
            / f"{'_'.join(active_tickers)}_report.json"
        ),
    )

    log.info("=== Pipeline Complete ===")
    log.info(f"Tickers              : {active_tickers}")
    log.info(f"Directional Accuracy : {metrics['directional_accuracy']:.4f}")
    log.info(f"Sharpe Ratio         : {metrics['sharpe_ratio']:.4f}")
    log.info(f"Max Drawdown         : {metrics['max_drawdown']:.4f}")
    log.info(f"Total Return         : {metrics['total_return']:.4f}")

    return report


if __name__ == "__main__":
    main()