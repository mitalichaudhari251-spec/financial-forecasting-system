"""
Standalone RL training script.
Usage: python scripts/train_rl.py --ticker AAPL --algorithm PPO
"""
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
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
from src.rl.training.train_rl import train_rl_agent
from src.config.hyperparameters import CNN_BACKBONE, RL_ALGORITHM
from src.config.paths import cnn_checkpoint_path
from src.config.settings import IMAGES_DIR
from src.utils.seed import set_seed
from src.utils.logger import log
from src.utils.device import DEVICE
import torch


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", default="AAPL")
    parser.add_argument("--start", default="2015-01-01")
    parser.add_argument("--end", default="2024-12-31")
    parser.add_argument("--algorithm", default=RL_ALGORITHM, choices=["PPO", "DQN"])
    parser.add_argument("--backbone", default=CNN_BACKBONE)
    parser.add_argument("--timesteps", type=int, default=500_000)
    args = parser.parse_args()

    set_seed()
    log.info(f"RL Training Script: {args.ticker} | {args.algorithm}")

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

    # Load pretrained CNN
    ckpt = cnn_checkpoint_path(args.backbone)
    model = build_model(args.backbone)
    if ckpt.exists():
        checkpoint = torch.load(str(ckpt), map_location=DEVICE)
        model.load_state_dict(checkpoint["model_state_dict"])
        log.info("Loaded pretrained CNN.")
    else:
        log.warning("No CNN checkpoint found — using untrained CNN embeddings.")

    # Generate images & extract embeddings
    img_dir = IMAGES_DIR / "candlestick" / "rl"
    images = CandlestickGenerator().batch_to_images(windows)
    metadata = save_images(images, labels, img_dir, args.ticker)
    dataset = ImageDataset(metadata, train=False)
    embeddings = extract_embeddings(model, dataset)

    # Train RL
    agent = train_rl_agent(
        embeddings=embeddings,
        ohlcv=ohlcv,
        labels=labels,
        prices=prices,
        algorithm=args.algorithm,
        total_timesteps=args.timesteps,
    )
    log.info("RL training complete.")


if __name__ == "__main__":
    main()