"""
Centralised logging for FinVision-RL using loguru.
"""
import sys
from pathlib import Path
from loguru import logger
from src.config.settings import LOG_LEVEL, LOG_DIR


def setup_logger(name: str = "finvision") -> "logger":
    """Configure and return a loguru logger instance."""
    log_file = LOG_DIR / f"{name}.log"

    logger.remove()  # Remove default handler

    # Console handler
    logger.add(
        sys.stdout,
        level=LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
               "<level>{message}</level>",
        colorize=True,
    )

    # File handler
    logger.add(
        str(log_file),
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
    )

    return logger


# Module-level logger
log = setup_logger()