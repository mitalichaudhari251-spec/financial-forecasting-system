"""Tests for OHLCV data validator."""
import numpy as np
import pandas as pd
import pytest
from src.ingestion.validator import validate_ohlcv


def test_valid_dataframe(sample_ohlcv):
    warnings = validate_ohlcv(sample_ohlcv, "test")
    assert isinstance(warnings, list)


def test_missing_column_raises(sample_ohlcv):
    bad = sample_ohlcv.drop(columns=["Volume"])
    with pytest.raises(ValueError, match="Missing columns"):
        validate_ohlcv(bad, "test")


def test_non_datetime_index_raises(sample_ohlcv):
    bad = sample_ohlcv.reset_index(drop=True)
    with pytest.raises(ValueError, match="DatetimeIndex"):
        validate_ohlcv(bad, "test")


def test_high_lt_low_warning(sample_ohlcv):
    df = sample_ohlcv.copy()
    df.iloc[0, df.columns.get_loc("High")] = 0.01  # High < Low
    warnings = validate_ohlcv(df, "test")
    assert any("High < Low" in w for w in warnings)