"""
Yahoo Finance data loader using yfinance.
"""
from __future__ import annotations
import pandas as pd
import yfinance as yf
from pathlib import Path
from src.utils.logger import log
from src.utils.constants import OHLCV_COLUMNS
from src.config.hyperparameters import MIN_DATA_PERIODS, MAX_MISSING_RATIO


class YahooLoader:
    """Downloads and caches OHLCV data from Yahoo Finance."""

    def __init__(self, cache_dir: Path | None = None):
        from src.config.settings import RAW_DIR
        self.cache_dir = Path(cache_dir) if cache_dir else RAW_DIR

    def download(
        self,
        ticker: str,
        start: str,
        end: str,
        interval: str = "1d",
        asset_type: str = "stocks",
        use_cache: bool = True,
    ) -> pd.DataFrame:
        """
        Download OHLCV data for a ticker.

        Args:
            ticker: e.g. 'AAPL', 'BTC-USD', 'EURUSD=X'
            start: Start date string 'YYYY-MM-DD'
            end: End date string 'YYYY-MM-DD'
            interval: '1d', '1h', '1wk'
            asset_type: 'stocks', 'crypto', 'forex'
            use_cache: Load from cache if available

        Returns:
            Validated OHLCV DataFrame
        """
        cache_path = self.cache_dir / asset_type / ticker / "ohlcv.parquet"
        cache_path.parent.mkdir(parents=True, exist_ok=True)

        if use_cache and cache_path.exists():
            log.info(f"Loading {ticker} from cache: {cache_path}")
            df = pd.read_parquet(cache_path)
        else:
            log.info(f"Downloading {ticker} from Yahoo Finance ({start} → {end})")
            raw = yf.download(ticker, start=start, end=end, interval=interval, progress=False)
            if raw.empty:
                raise ValueError(f"No data returned for {ticker}")
            # Flatten multi-level columns if present
            if isinstance(raw.columns, pd.MultiIndex):
                raw.columns = raw.columns.get_level_values(0)
            df = raw[OHLCV_COLUMNS].copy()
            df.index = pd.to_datetime(df.index)
            df.to_parquet(cache_path)
            log.info(f"Saved {ticker} to cache: {cache_path} ({len(df)} rows)")

        return self._validate(df, ticker)

    def _validate(self, df: pd.DataFrame, ticker: str) -> pd.DataFrame:
        """Validate OHLCV data quality."""
        if len(df) < MIN_DATA_PERIODS:
            raise ValueError(
                f"{ticker}: Only {len(df)} periods — minimum required is {MIN_DATA_PERIODS}."
            )
        missing_ratio = df.isnull().mean().max()
        if missing_ratio > MAX_MISSING_RATIO:
            raise ValueError(
                f"{ticker}: {missing_ratio:.1%} missing values exceed threshold "
                f"({MAX_MISSING_RATIO:.0%})."
            )
        log.info(f"{ticker}: Validated {len(df)} rows, {missing_ratio:.2%} missing.")
        return df