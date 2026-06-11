"""File I/O utilities."""
import json
import pickle
from pathlib import Path
import numpy as np
import pandas as pd
from src.utils.logger import log


def save_dataframe(df: pd.DataFrame, path: Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path, index=True)
    log.debug(f"DataFrame saved → {path}")


def load_dataframe(path: Path) -> pd.DataFrame:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"DataFrame not found: {path}")
    return pd.read_parquet(path)


def save_numpy(data: dict, path: Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(str(path), **data)
    log.debug(f"Numpy arrays saved → {path}")


def load_numpy(path: Path) -> dict:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Numpy file not found: {path}")
    data = np.load(str(path), allow_pickle=True)
    return {k: data[k] for k in data.files}


def save_json(obj: dict, path: Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, default=str)
    log.debug(f"JSON saved → {path}")


def load_json(path: Path) -> dict:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"JSON not found: {path}")
    with open(path) as f:
        return json.load(f)