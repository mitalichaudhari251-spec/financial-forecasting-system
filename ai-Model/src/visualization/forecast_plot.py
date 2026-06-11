"""Forecast visualization with actual vs predicted prices and confidence bands."""
from __future__ import annotations
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots


def plot_forecast(
    timestamps: np.ndarray,
    actual_prices: np.ndarray,
    forecast_directions: list[str],
    portfolio_values: np.ndarray,
    title: str = "FinVision-RL Forecast",
) -> go.Figure:
    """
    Interactive Plotly chart: actual prices + RL direction signals + portfolio curve.
    """
    fig = make_subplots(
        rows=2, cols=1,
        shared_xaxes=True,
        row_heights=[0.6, 0.4],
        subplot_titles=["Price + Direction Signals", "Portfolio Value"],
        vertical_spacing=0.08,
    )

    # Price line
    fig.add_trace(
        go.Scatter(x=timestamps, y=actual_prices, name="Close Price",
                   line=dict(color="royalblue", width=1.5)),
        row=1, col=1,
    )

    # Direction markers
    timestamps = np.asarray(timestamps)
    for i, (t, p, d) in enumerate(zip(timestamps, actual_prices, forecast_directions)):
        if d == "UP":
            fig.add_trace(
                go.Scatter(x=[t], y=[p], mode="markers",
                           marker=dict(symbol="triangle-up", size=10, color="green"),
                           name="Buy" if i == 0 else "", showlegend=(i == 0)),
                row=1, col=1,
            )
        elif d == "DOWN":
            fig.add_trace(
                go.Scatter(x=[t], y=[p], mode="markers",
                           marker=dict(symbol="triangle-down", size=10, color="red"),
                           name="Sell" if i == 0 else "", showlegend=(i == 0)),
                row=1, col=1,
            )

    # Portfolio curve
    fig.add_trace(
        go.Scatter(x=timestamps, y=portfolio_values, name="Portfolio Value",
                   line=dict(color="orange", width=2), fill="tozeroy",
                   fillcolor="rgba(255,165,0,0.1)"),
        row=2, col=1,
    )

    fig.update_layout(
        title=title,
        height=700,
        template="plotly_dark",
        hovermode="x unified",
        showlegend=True,
    )
    return fig