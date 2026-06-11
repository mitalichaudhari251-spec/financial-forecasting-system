"""
FinVision-RL Global Settings
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
EXPERIMENTS_DIR = BASE_DIR / "experiments"

# Data subdirectories
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
WINDOWS_DIR = DATA_DIR / "windows"
LABELS_DIR = DATA_DIR / "labels"
IMAGES_DIR = DATA_DIR / "images"
CANDLESTICK_DIR = IMAGES_DIR / "candlestick"
GAF_DIR = IMAGES_DIR / "gaf"

# Model subdirectories
CNN_MODELS_DIR = MODELS_DIR / "cnn"
RL_MODELS_DIR = MODELS_DIR / "rl"
EMBEDDINGS_DIR = MODELS_DIR / "embeddings"

# Create dirs if they don't exist
for d in [
    DATA_DIR, RAW_DIR, PROCESSED_DIR, WINDOWS_DIR, LABELS_DIR,
    IMAGES_DIR, CANDLESTICK_DIR, GAF_DIR,
    MODELS_DIR, CNN_MODELS_DIR, RL_MODELS_DIR, EMBEDDINGS_DIR,
    EXPERIMENTS_DIR,
]:
    d.mkdir(parents=True, exist_ok=True)

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# MLflow
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", str(EXPERIMENTS_DIR / "mlruns"))

# API
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# Disclaimer
FINANCIAL_DISCLAIMER = (
    "FinVision-RL outputs are for research and informational purposes only. "
    "They do not constitute financial advice. "
    "Past performance does not guarantee future results."
)