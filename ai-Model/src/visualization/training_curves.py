"""Training curve plots for CNN and RL training."""
from __future__ import annotations
import plotly.graph_objects as go
from plotly.subplots import make_subplots


def plot_cnn_training(history: dict) -> go.Figure:
    """Plot CNN train/val loss and accuracy over epochs."""
    epochs = list(range(1, len(history["train_loss"]) + 1))

    fig = make_subplots(rows=1, cols=2, subplot_titles=["Loss", "Accuracy"])

    fig.add_trace(
        go.Scatter(x=epochs, y=history["train_loss"], name="Train Loss",
                   line=dict(color="royalblue")), row=1, col=1
    )
    fig.add_trace(
        go.Scatter(x=epochs, y=history["val_loss"], name="Val Loss",
                   line=dict(color="tomato")), row=1, col=1
    )
    fig.add_trace(
        go.Scatter(x=epochs, y=history["train_acc"], name="Train Acc",
                   line=dict(color="royalblue")), row=1, col=2
    )
    fig.add_trace(
        go.Scatter(x=epochs, y=history["val_acc"], name="Val Acc",
                   line=dict(color="tomato")), row=1, col=2
    )

    fig.update_layout(title="CNN Training Curves", template="plotly_dark", height=400)
    return fig


def plot_rl_rewards(episode_rewards: list[float]) -> go.Figure:
    """Plot RL episode reward curve with rolling average."""
    import numpy as np
    episodes = list(range(1, len(episode_rewards) + 1))
    rolling = [
        float(np.mean(episode_rewards[max(0, i - 50): i + 1]))
        for i in range(len(episode_rewards))
    ]

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=episodes, y=episode_rewards,
        name="Episode Reward", line=dict(color="lightblue", width=0.8), opacity=0.5
    ))
    fig.add_trace(go.Scatter(
        x=episodes, y=rolling,
        name="Rolling Mean (50)", line=dict(color="orange", width=2)
    ))
    fig.update_layout(
        title="RL Training — Episode Rewards",
        xaxis_title="Episode", yaxis_title="Total Reward",
        template="plotly_dark", height=400,
    )
    return fig