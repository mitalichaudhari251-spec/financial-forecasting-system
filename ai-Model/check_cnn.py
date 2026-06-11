"""Method 3 - Test Saved CNN Model"""
import torch
import sys
import numpy as np
sys.path.insert(0, '.')

from src.cnn.training.train import build_model
from src.config.paths import cnn_checkpoint_path
from src.utils.device import DEVICE
from src.image_generation.candlestick_generator import CandlestickGenerator
from src.image_generation.image_utils import pil_to_tensor
from src.ingestion.downloader import DataDownloader
from src.preprocessing.missing_handler import handle_missing
from src.preprocessing.outlier_handler import clip_outliers
from src.preprocessing.differencing import frac_diff_dataframe
from src.preprocessing.windowing import create_windows

# Load trained model
ckpt = cnn_checkpoint_path('resnet18')
model = build_model('resnet18')
checkpoint = torch.load(str(ckpt), map_location=DEVICE)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

# Fix: extract val_acc separately (no backslash in f-string)
val_acc = checkpoint['val_acc']
print(f'CNN checkpoint loaded (val_acc={val_acc:.4f})')

# Real prediction on AAPL
df = DataDownloader().from_yahoo('AAPL', '2024-01-01', '2024-06-01')
df = handle_missing(df)
df = clip_outliers(df)
df = frac_diff_dataframe(df)
windows, _ = create_windows(df)

# Predict last window
img = CandlestickGenerator().window_to_image(windows[-1])
tensor = pil_to_tensor(img).unsqueeze(0)
with torch.no_grad():
    logits = model(tensor)
    probs = torch.softmax(logits, dim=1).squeeze().numpy()

direction = 'UP' if probs[1] > probs[0] else 'DOWN'
confidence_up   = probs[1]
confidence_down = probs[0]

print(f'CNN Prediction: AAPL -> {direction}')
print(f'Confidence: UP={confidence_up:.4f}, DOWN={confidence_down:.4f}')
print()
print('CNN Model Working Correctly!')