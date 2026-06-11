"""Tests for all preprocessing steps."""
import numpy as np
import pandas as pd
import pytest
from src.preprocessing.missing_handler import handle_missing
from src.preprocessing.outlier_handler import clip_outliers
from src.preprocessing.normalization import normalize_window, normalize_windows_batch
from src.preprocessing.differencing import frac_diff_dataframe
from src.preprocessing.windowing import create_windows
from src.labeling.direction_label import generate_direction_labels, align_windows_labels


# ── Missing handler ────────────────────────────────────────────────────────────

def test_missing_handler_fills_gaps(sample_ohlcv):
    df = sample_ohlcv.copy()
    df.iloc[5:8, 3] = np.nan  # inject NaNs in Close
    result = handle_missing(df)
    assert result["Close"].isnull().sum() == 0


# ── Outlier handler ────────────────────────────────────────────────────────────

def test_outlier_handler_clips(sample_ohlcv):
    df = sample_ohlcv.copy()
    df.iloc[10, df.columns.get_loc("Close")] = 1_000_000  # extreme outlier
    result = clip_outliers(df, rolling_window=20)
    assert result["Close"].iloc[10] < 1_000_000


# ── Normalization ──────────────────────────────────────────────────────────────

def test_normalize_window_range():
    w = np.random.rand(30, 5).astype(np.float32) * 100
    normed = normalize_window(w)
    assert normed.min() >= 0.0 - 1e-6
    assert normed.max() <= 1.0 + 1e-6


def test_normalize_window_constant_column():
    w = np.ones((30, 5), dtype=np.float32)
    normed = normalize_window(w)
    assert not np.isnan(normed).any()


def test_normalize_windows_batch_shape():
    ws = np.random.rand(50, 30, 5).astype(np.float32)
    result = normalize_windows_batch(ws)
    assert result.shape == (50, 30, 5)


# ── Fractional differencing ────────────────────────────────────────────────────

def test_frac_diff_removes_nan_rows(sample_ohlcv):
    result = frac_diff_dataframe(sample_ohlcv)
    assert result.isnull().sum().sum() == 0
    assert len(result) < len(sample_ohlcv)  # Leading NaN rows dropped


def test_frac_diff_output_float(sample_ohlcv):
    result = frac_diff_dataframe(sample_ohlcv)
    assert result["Close"].dtype in [np.float32, np.float64]


# ── Windowing ──────────────────────────────────────────────────────────────────

def test_create_windows_shape(sample_ohlcv):
    windows, timestamps = create_windows(sample_ohlcv, window_size=30, step=1)
    expected_n = len(sample_ohlcv) - 30 + 1
    assert windows.shape == (expected_n, 30, sample_ohlcv.shape[1])
    assert len(timestamps) == expected_n


def test_create_windows_normalized(sample_ohlcv):
    windows, _ = create_windows(sample_ohlcv, window_size=30, normalize=True)
    assert windows.min() >= -1e-5
    assert windows.max() <= 1.0 + 1e-5


# ── Labeling ───────────────────────────────────────────────────────────────────

def test_direction_labels_binary(sample_ohlcv):
    labels = generate_direction_labels(sample_ohlcv)
    assert set(np.unique(labels)).issubset({0, 1})
    assert len(labels) == len(sample_ohlcv) - 1


def test_direction_labels_three_class(sample_ohlcv):
    labels = generate_direction_labels(sample_ohlcv, three_class=True)
    assert set(np.unique(labels)).issubset({0, 1, 2})


def test_align_windows_labels(sample_windows):
    windows, labels, timestamps = sample_windows
    assert len(windows) == len(labels)
    assert windows.shape[1] == 30