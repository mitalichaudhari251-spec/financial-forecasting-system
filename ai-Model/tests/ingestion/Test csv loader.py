"""Tests for CSV loader."""
import pandas as pd
import pytest
import tempfile
import os
from src.ingestion.csv_loader import CSVLoader


def make_csv(n: int = 600) -> str:
    """Write a temp CSV and return its path."""
    import numpy as np
    dates = pd.date_range("2018-01-01", periods=n, freq="B")
    close = 100 + np.cumsum(np.random.randn(n) * 0.5)
    df = pd.DataFrame({
        "Date": dates,
        "Open": close + 0.1,
        "High": close + 0.5,
        "Low": close - 0.5,
        "Close": close,
        "Volume": 500_000,
    })
    tmp = tempfile.NamedTemporaryFile(suffix=".csv", delete=False, mode="w")
    df.to_csv(tmp.name, index=False)
    return tmp.name


def test_load_valid_csv():
    path = make_csv(600)
    try:
        loader = CSVLoader()
        df = loader.load(path)
        assert "Close" in df.columns
        assert len(df) == 600
    finally:
        os.unlink(path)


def test_load_too_short_raises():
    path = make_csv(100)
    try:
        with pytest.raises(ValueError):
            CSVLoader().load(path)
    finally:
        os.unlink(path)


def test_missing_date_column_raises():
    import tempfile
    import pandas as pd
    df = pd.DataFrame({"Open": [1], "High": [2], "Low": [0.5], "Close": [1.5], "Volume": [100]})
    tmp = tempfile.NamedTemporaryFile(suffix=".csv", delete=False, mode="w")
    df.to_csv(tmp.name, index=False)
    try:
        with pytest.raises(ValueError, match="Date"):
            CSVLoader().load(tmp.name)
    finally:
        os.unlink(tmp.name)