"""
Standalone CNN training script.
Usage: python scripts/train_cnn.py --ticker AAPL --backbone resnet18
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
from src.image_generation.gaf_generator import GAFGenerator
from src.image_generation.image_saver import save_images
from src.cnn.training.train import train_cnn
from src.config.hyperparameters import CNN_BACKBONE, IMAGE_METHOD
from src.config.settings import IMAGES_DIR
from src.utils.seed import set_seed
from src.utils.logger import log


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", default="AAPL")
    parser.add_argument("--start", default="2015-01-01")
    parser.add_argument("--end", default="2024-12-31")
    parser.add_argument("--backbone", default=CNN_BACKBONE, choices=["resnet18", "resnet50", "custom"])
    parser.add_argument("--image-method", default=IMAGE_METHOD, choices=["candlestick", "gaf"])
    parser.add_argument("--epochs", type=int, default=20)
    args = parser.parse_args()

    set_seed()
    log.info(f"CNN Training Script: {args.ticker} | {args.backbone} | {args.image_method}")

    # Data
    downloader = DataDownloader()
    df = downloader.from_yahoo(args.ticker, args.start, args.end)
    df = handle_missing(df)
    df = clip_outliers(df)
    df = frac_diff_dataframe(df)

    windows, timestamps = create_windows(df)
    labels = generate_direction_labels(df)
    windows, labels = align_windows_labels(windows, labels, timestamps)

    # Images
    img_dir = IMAGES_DIR / args.image_method / "train"
    generator = CandlestickGenerator() if args.image_method == "candlestick" else GAFGenerator()
    images = generator.batch_to_images(windows)
    metadata = save_images(images, labels, img_dir, args.ticker)

    # Train
    model, history = train_cnn(metadata, backbone=args.backbone, epochs=args.epochs)
    log.info(f"Best val_acc: {max(history['val_acc']):.4f}")


if __name__ == "__main__":
    main()