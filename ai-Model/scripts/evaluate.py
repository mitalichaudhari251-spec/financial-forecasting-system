"""
Standalone evaluation script — runs inference on test set and prints metrics.
Usage: python scripts/evaluate.py --ticker AAPL
"""
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import json
from src.ingestion.downloader import DataDownloader
from src.preprocessing.missing_handler import handle_missing
from src.preprocessing.outlier_handler import clip_outliers
from src.preprocessing.differencing import frac_diff_dataframe
from src.preprocessing.windowing import create_windows
from src.labeling.direction_label import generate_direction_labels, align_windows_labels
from src.image_generation.candlestick_generator import CandlestickGenerator
from src.image_generation.image_saver import save_images
from src.datasets.image_dataset import ImageDataset
from src.cnn.training.train import build_model
from src.cnn.inference.embeddings import extract_embeddings
from src.rl.agents.ppo_agent import PPOAgent
from src.rl.agents.dqn_agent import DQNAgent
from src.rl.env.market_env import MarketEnv
from src.rl.inference.forecast import run_inference
from src.evaluation.backtesting import Backtester
from src.evaluation.metrics import compute_all_metrics
from src.evaluation.benchmark import compare_benchmarks
from src.visualization.report_generator import generate_report
from src.config.hyperparameters import CNN_BACKBONE, RL_ALGORITHM, TRAIN_RATIO, VAL_RATIO
from src.config.paths import cnn_checkpoint_path, rl_checkpoint_path
from src.config.settings import IMAGES_DIR
from src.utils.device import DEVICE
from src.utils.logger import log
import torch


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", default="AAPL")
    parser.add_argument("--start", default="2015-01-01")
    parser.add_argument("--end", default="2024-12-31")
    parser.add_argument("--backbone", default=CNN_BACKBONE)
    parser.add_argument("--algorithm", default=RL_ALGORITHM)
    args = parser.parse_args()

    log.info(f"Evaluation: {args.ticker}")

    # Data pipeline
    downloader = DataDownloader()
    df = downloader.from_yahoo(args.ticker, args.start, args.end)
    df = handle_missing(df)
    df = clip_outliers(df)
    raw_prices = df["Close"].values.copy()
    df = frac_diff_dataframe(df)

    windows, timestamps = create_windows(df)
    labels = generate_direction_labels(df)
    windows, labels = align_windows_labels(windows, labels, timestamps)
    n = len(windows)
    ohlcv = df.values[-n:].astype(np.float32)
    prices = raw_prices[-n:]

    # Test split
    n_train = int(n * TRAIN_RATIO)
    n_val = int(n * VAL_RATIO)
    test_windows = windows[n_train + n_val:]
    test_labels = labels[n_train + n_val:]
    test_prices = prices[n_train + n_val:]
    test_ohlcv = ohlcv[n_train + n_val:]

    # CNN embeddings
    ckpt = cnn_checkpoint_path(args.backbone)
    model = build_model(args.backbone)
    if ckpt.exists():
        checkpoint = torch.load(str(ckpt), map_location=DEVICE)
        model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    img_dir = IMAGES_DIR / "candlestick" / "eval"
    images = CandlestickGenerator().batch_to_images(test_windows)
    metadata = save_images(images, test_labels, img_dir, args.ticker)
    dataset = ImageDataset(metadata, train=False)
    embeddings = extract_embeddings(model, dataset)

    # Load RL agent
    rl_ckpt = rl_checkpoint_path(args.algorithm)
    env_fn = lambda: MarketEnv(embeddings, test_ohlcv, test_labels, test_prices)
    agent = PPOAgent(env_fn=env_fn) if args.algorithm == "PPO" else DQNAgent(env_fn=env_fn)
    agent.load(rl_ckpt)

    # Inference
    result = run_inference(agent, embeddings, test_ohlcv, test_labels, test_prices)

    # Backtesting
    backtester = Backtester()
    backtest_df = backtester.run(test_prices, result["actions"])
    bnh = backtester.buy_and_hold(test_prices)

    # Metrics
    metrics = compute_all_metrics(
        y_true=test_prices / (test_prices[0] + 1e-8),
        y_pred=backtest_df["portfolio_value"].values / backtest_df["portfolio_value"].iloc[0],
        directions_true=test_labels[:len(result["actions"])],
        directions_pred=result["actions"],
        portfolio_values=backtest_df["portfolio_value"].values,
    )

    report = generate_report(
        metrics=metrics,
        asset=args.ticker,
        algorithm=args.algorithm,
        backbone=args.backbone,
        test_period=(str(timestamps[n_train + n_val]), str(timestamps[-1])),
    )

    print("\n" + "="*50)
    print("FINVISION-RL EVALUATION REPORT")
    print("="*50)
    for k, v in metrics.items():
        print(f"  {k:<28}: {v:.4f}" if isinstance(v, float) else f"  {k:<28}: {v}")
    print(f"\n  Targets Met: {report['summary']['targets_met']}")
    print(f"  Status     : {report['summary']['overall_status']}")
    print("="*50)


if __name__ == "__main__":
    main()