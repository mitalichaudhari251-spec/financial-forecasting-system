"""
Report generator — creates a structured evaluation report dict/JSON
that can be rendered in the Streamlit UI or saved as JSON.
"""
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime
from src.config.settings import FINANCIAL_DISCLAIMER
from src.utils.file_utils import save_json
from src.utils.logger import log


def generate_report(
    metrics: dict,
    asset: str,
    algorithm: str,
    backbone: str,
    test_period: tuple[str, str],
    output_path: Path | None = None,
) -> dict:
    """
    Build a structured evaluation report.

    Returns:
        Report dict with sections: summary, metrics, targets, disclaimer
    """
    targets = {
        "rmse": {"target": 0.020, "met": metrics.get("rmse", 1.0) < 0.020},
        "mae": {"target": 0.015, "met": metrics.get("mae", 1.0) < 0.015},
        "directional_accuracy": {"target": 0.58, "met": metrics.get("directional_accuracy", 0.0) >= 0.58},
        "sharpe_ratio": {"target": 1.50, "met": metrics.get("sharpe_ratio", 0.0) >= 1.50},
        "max_drawdown": {"target": 0.15, "met": metrics.get("max_drawdown", 1.0) < 0.15},
    }

    targets_met = sum(1 for v in targets.values() if v["met"])

    report = {
        "report_title": "FinVision-RL Evaluation Report",
        "generated_at": datetime.utcnow().isoformat(),
        "asset": asset,
        "algorithm": algorithm,
        "cnn_backbone": backbone,
        "test_period": {"start": test_period[0], "end": test_period[1]},
        "summary": {
            "targets_met": f"{targets_met}/{len(targets)}",
            "overall_status": "PASS" if targets_met >= 3 else "PARTIAL",
        },
        "metrics": metrics,
        "targets": targets,
        "disclaimer": FINANCIAL_DISCLAIMER,
    }

    if output_path:
        save_json(report, output_path)
        log.info(f"Report saved: {output_path}")

    return report