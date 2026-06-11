"""FinVision-RL package setup."""
from setuptools import setup, find_packages

setup(
    name="finvision-rl",
    version="2.0.0",
    description="Financial market direction forecasting using CNN + Reinforcement Learning",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "torch>=2.0.0",
        "torchvision>=0.15.0",
        "gymnasium>=0.29.0",
        "stable-baselines3>=2.1.0",
        "yfinance>=0.2.28",
        "mplfinance>=0.12.10b0",
        "statsmodels>=0.14.0",
        "scikit-learn>=1.3.0",
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0",
        "plotly>=5.17.0",
        "mlflow>=2.8.0",
        "loguru>=0.7.0",
        "python-dotenv>=1.0.0",
        "tqdm>=4.66.0",
    ],
    extras_require={
        "dev": ["pytest>=7.4.0", "pytest-cov>=4.1.0"],
        "viz": ["streamlit>=1.30.0", "pytorch-grad-cam>=1.4.8"],
    },
    entry_points={
        "console_scripts": [
            "finvision-train=scripts.run_pipeline:main",
            "finvision-api=src.api.main:app",
        ]
    },
)