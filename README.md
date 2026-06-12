# FinVision-RL

Financial time-series forecasting using CNN-based chart pattern recognition and reinforcement learning. Converts raw OHLCV market data into candlestick or Gramian Angular Field (GAF) images, extracts visual features with a fine-tuned ResNet, then trains a PPO/DQN agent to make directional forecasts and simulate trading decisions.

> **Not financial advice.** All outputs are for research and informational purposes only. Past performance does not guarantee future results. No live trading is performed.

---

## Table of contents

- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Project layout](#project-layout)
- [Configuration](#configuration)
- [Performance targets](#performance-targets)
- [Key dependencies](#key-dependencies)
- [Experiment tracking](#experiment-tracking)
- [API and interfaces](#api-and-interfaces)
- [Known limitations](#known-limitations)
- [License](#license)

---

## How it works

The pipeline runs in seven sequential stages:

1. **Ingest** — pulls OHLCV data via `yfinance` or from a user-supplied CSV (equities, ETFs, crypto pairs supported)
2. **Preprocess** — forward-fill gaps, IQR-clip outliers, apply fractional differencing (`d=0.4`), min-max normalize per window
3. **Image generation** — renders each 30-period window as a 128×128 candlestick chart (`mplfinance`) or GAF image (`pyts`); images saved to `/data/images/{asset}/{method}/{window_id}.png`
4. **CNN training** — fine-tunes ResNet-18 on labeled images (ImageNet weights, differential learning rates); final FC layer replaced with a 512-d embedding layer; Grad-CAM supported for interpretability
5. **RL environment** — custom `gymnasium` env; state = 512-d CNN embedding + current OHLCV vector (~520 dims total); actions = `{0: sell/down, 1: hold/flat, 2: buy/up}`
6. **Agent training** — PPO (default) or DQN via `stable-baselines3`, 500k timesteps; reward = `0.4 × prediction_accuracy + 0.5 × simulated_return − 0.1 × transaction_cost`
7. **Evaluation** — backtests on chronological hold-out (last 20%); compares RMSE, MAE, directional accuracy, Sharpe ratio, and max drawdown against ARIMA, LSTM, and buy-and-hold baselines

---

## Quick start

### Docker (recommended)

```bash
git clone https://github.com/your-org/finvision-rl
cd finvision-rl
docker compose up --build
```

### Bare Python

```bash
pip install -r requirements.txt

# train on a ticker
python -m finvision_rl train --ticker SPY --start 2015-01-01 --end 2024-12-31

# run inference
python -m finvision_rl predict --ticker SPY --model models/ppo_spy.zip

# launch the Streamlit dashboard
streamlit run src/ui/app.py
```

### REST API

```bash
curl -X POST http://localhost:8000/api/v1/forecast \
  -H "Content-Type: application/json" \
  -d '{"ticker": "SPY", "start": "2023-01-01", "end": "2024-01-01", "image_type": "candlestick"}'
```

---

## Requirements

**Hardware (training)**
- NVIDIA GPU — RTX 3080 or better, 8 GB VRAM minimum
- 16 GB system RAM
- 500 GB free disk (for a full 10-year / 10-asset run including image files and checkpoints)

**Hardware (inference)**
- GPU preferred; CPU-only supported with increased latency
- 8 GB RAM minimum

**Software**
- Python 3.10+
- CUDA 11.8+
- Ubuntu 20.04 LTS or higher (primary); Windows 10/11 via WSL2 (supported); macOS (community support)

---

## Project layout

```
finvision-rl/
├── src/
│   ├── ingestion/       # data download, validation, preprocessing
│   ├── images/          # candlestick + GAF image generation
│   ├── cnn/             # ResNet fine-tuning, embedding extraction, Grad-CAM
│   ├── rl/              # MarketEnv (gymnasium), PPO/DQN training
│   ├── evaluation/      # backtesting, metrics, report generation
│   └── ui/              # Streamlit dashboard
├── data/                # raw OHLCV data + generated images
├── models/              # saved model checkpoints (.zip)
├── experiments/         # MLflow / W&B experiment logs
├── tests/               # pytest unit + integration tests
├── notebooks/           # exploratory Jupyter notebooks
├── docs/                # user guide + API reference
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## Configuration

Key parameters can be set via CLI flags or a YAML config file. Defaults:

```yaml
# config.yaml
window_size:     30          # periods per image
step_size:       1           # sliding window stride
image_type:      candlestick # candlestick | gaf
image_resolution: 128        # pixels (64 or 128)
cnn_backbone:    resnet18    # resnet18 | resnet50
embedding_dim:   512
rl_algorithm:    ppo         # ppo | dqn
timesteps:       500000
discount_gamma:  0.99
reward_alpha:    0.4         # prediction accuracy weight
reward_beta:     0.5         # simulated return weight
reward_gamma:    0.1         # transaction cost penalty
test_split:      0.20        # chronological hold-out fraction
```

All API keys (Yahoo Finance, cloud providers) must be set as environment variables — never hard-coded.

---

## Performance targets

| Metric | Target | Baseline |
|---|---|---|
| RMSE (normalized) | < 0.020 | 0.025 (ARIMA) |
| MAE (normalized) | < 0.015 | 0.019 (ARIMA) |
| Directional accuracy | > 58% | 50% (random) |
| Sharpe ratio | > 1.50 | ~1.10 (buy-and-hold) |
| Max drawdown | < 15% | ~20% (buy-and-hold) |
| Win rate | > 52% | 50% (random) |
| Inference latency (GPU) | < 5s | — |
| Inference latency (CPU) | < 15s | — |
| Training time (1 asset, 10yr daily, RTX 3080) | < 4h | — |

---

## Key dependencies

```
torch>=2.0              torchvision             pytorch-grad-cam
stable-baselines3>=2.0  gymnasium>=0.26
yfinance>=0.2           pandas>=2.0
mplfinance>=0.12        pyts>=0.12              Pillow
plotly>=5.0             streamlit>=1.30
statsmodels             scikit-learn
quantstats              pyfolio
mlflow                  pytest                  pytest-cov
```

Full pinned versions in `requirements.txt`.

---

## Experiment tracking

All runs log hyperparameters, reward curves, and model artifacts. Set `MLFLOW_TRACKING_URI` to point at a remote server, or leave it unset to log locally under `experiments/`. Weights & Biases is also supported — set `WANDB_API_KEY` and pass `--tracker wandb`.

---

## API and interfaces

**REST**
```
POST /api/v1/forecast
```
Accepts JSON with `ticker`, `start`, `end`, and optional config overrides. Returns directional forecast, confidence score, and simulated portfolio metrics.

**CLI**
```bash
python -m finvision_rl train   --ticker SPY --start 2015-01-01 --end 2024-12-31
python -m finvision_rl predict --ticker SPY --model models/ppo_spy.zip
python -m finvision_rl backtest --ticker SPY --model models/ppo_spy.zip
```

**Web UI**
Streamlit dashboard at `http://localhost:8501` — no coding required. Supports ticker input, CSV upload, parameter configuration, training progress visualization, interactive forecast charts, and downloadable PDF reports.

---

## Known limitations

- **Technicals only** — no earnings data, macro indicators, or news sentiment. The modular architecture supports adding these as additional state features.
- **No black swan handling** — model behavior during extraordinary market events (2008, March 2020) is unreliable. Walk-forward validation is strongly recommended.
- **RL convergence is not guaranteed** — check episode reward curves before using a checkpoint for inference. Some assets or date ranges may not converge within 500k timesteps.
- **Backtest optimism** — reported metrics are on a strict chronological hold-out. Hyperparameter search was done on the validation split only. Live performance will differ.
- **GPU required for practical training** — CPU-only training on 10 years of daily data is possible but takes significantly longer.

---
