"""
High-level downloader that combines YahooLoader and CSVLoader.
"""
from __future__ import annotations
from pathlib import Path
import pandas as pd
from src.ingestion.yahoo_loader import YahooLoader
from src.ingestion.csv_loader import CSVLoader
from src.ingestion.validator import validate_ohlcv
from src.utils.logger import log


# Tickers that need asset_type overrides regardless of CLI argument
_CRYPTO_TICKERS  = {"BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "DOGE-USD"}
_FOREX_TICKERS   = {"EURUSD=X", "GBPUSD=X", "USDJPY=X"}


def _infer_asset_type(ticker: str, default: str = "stocks") -> str:
    """Infer asset_type from ticker symbol so cache path is correct."""
    if ticker in _CRYPTO_TICKERS or ticker.endswith("-USD"):
        return "crypto"
    if ticker.endswith("=X"):
        return "forex"
    return default


class DataDownloader:
    """Unified data acquisition interface."""

    def __init__(self):
        self._yahoo = YahooLoader()
        self._csv   = CSVLoader()

    def from_yahoo(
        self,
        ticker: str,
        start: str,
        end: str,
        interval: str = "1d",
        asset_type: str = "stocks",
    ) -> pd.DataFrame:
        # Auto-correct asset_type for crypto/forex tickers
        asset_type = _infer_asset_type(ticker, default=asset_type)
        df = self._yahoo.download(ticker, start, end, interval, asset_type)
        validate_ohlcv(df, ticker)
        return df

    def from_csv(self, path: str | Path) -> pd.DataFrame:
        df = self._csv.load(path)
        validate_ohlcv(df, str(path))
        return df

    def download_multiple(
        self,
        tickers: list[str],
        start: str,
        end: str,
        asset_type: str = "stocks",
        **kwargs,
    ) -> dict[str, pd.DataFrame]:
        """
        Download multiple tickers, skipping failed ones.
        asset_type is auto-inferred per ticker so crypto/forex
        land in the correct cache subdirectory.
        """
        results = {}
        for ticker in tickers:
            try:
                results[ticker] = self.from_yahoo(
                    ticker, start, end,
                    asset_type=_infer_asset_type(ticker, default=asset_type),
                    **kwargs,
                )
                log.info(f"Downloaded {ticker}: {len(results[ticker])} rows")
            except Exception as e:
                log.error(f"Failed to download {ticker}: {e}")

        log.info(
            f"Downloaded {len(results)}/{len(tickers)} tickers successfully. "
            f"Failed: {set(tickers) - set(results.keys()) or 'none'}"
        )
        return results