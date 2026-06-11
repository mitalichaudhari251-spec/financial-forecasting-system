"""CSV file loader for user-supplied OHLCV data."""
from __future__ import annotations
import pandas as pd
from pathlib import Path
from src.utils.logger import log
from src.utils.constants import OHLCV_COLUMNS
from src.config.hyperparameters import MIN_DATA_PERIODS, MAX_MISSING_RATIO


class CSVLoader:
    """Loads and validates OHLCV data from CSV files."""

    REQUIRED_COLUMNS = {"open", "high", "low", "close", "volume"}

    def load(self, path: str | Path) -> pd.DataFrame:
        """
        Load OHLCV CSV file.

        Args:
            path: Path to CSV file with columns Date, Open, High, Low, Close, Volume

        Returns:
            Validated OHLCV DataFrame with DatetimeIndex
        """
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"CSV file not found: {path}")

        df = pd.read_csv(path)
        df = self._normalize_columns(df)
        df = self._set_datetime_index(df)
        df = df[OHLCV_COLUMNS]
        df = self._cast_numeric(df)
        self._validate(df, str(path))
        log.info(f"CSV loaded: {path} ({len(df)} rows)")
        return df

    def _normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalise column names (case-insensitive, strip whitespace)."""
        df.columns = [c.strip().title() for c in df.columns]
        return df

    def _set_datetime_index(self, df: pd.DataFrame) -> pd.DataFrame:
        date_cols = [c for c in df.columns if c.lower() in ("date", "datetime", "time", "timestamp")]
        if date_cols:
            df[date_cols[0]] = pd.to_datetime(df[date_cols[0]])
            df = df.set_index(date_cols[0])
        else:
            raise ValueError("CSV must contain a Date/Datetime column.")
        df.index.name = "Date"
        return df

    def _cast_numeric(self, df: pd.DataFrame) -> pd.DataFrame:
        for col in OHLCV_COLUMNS:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        return df

    def _validate(self, df: pd.DataFrame, name: str) -> None:
        if len(df) < MIN_DATA_PERIODS:
            raise ValueError(f"{name}: Only {len(df)} rows, need ≥ {MIN_DATA_PERIODS}.")
        missing_ratio = df.isnull().mean().max()
        if missing_ratio > MAX_MISSING_RATIO:
            raise ValueError(f"{name}: {missing_ratio:.1%} missing exceeds {MAX_MISSING_RATIO:.0%}.")