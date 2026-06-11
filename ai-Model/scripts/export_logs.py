"""
finvision.log se CNN training history nikalta hai.
Run: python scripts/export_logs.py
"""
import re
import json
from pathlib import Path

LOG_FILE = Path("logs/finvision.log")
OUT_FILE = Path("logs/cnn_training_log.json")

pattern = re.compile(
    r"Epoch (\d+)/(\d+) \| train_loss=([\d.]+) train_acc=([\d.]+) \| val_loss=([\d.]+) val_acc=([\d.]+)"
)

all_epochs = []
with open(LOG_FILE, "r", encoding="utf-8") as f:
    for line in f:
        m = pattern.search(line)
        if m:
            all_epochs.append({
                "epoch":        int(m.group(1)),
                "total_epochs": int(m.group(2)),
                "train_loss":   round(float(m.group(3)), 6),
                "train_acc":    round(float(m.group(4)), 6),
                "val_loss":     round(float(m.group(5)), 6),
                "val_accuracy": round(float(m.group(6)), 6),
            })

# Last training run ka data nikaalo (last complete sequence)
if all_epochs:
    # Last epoch number ke hisaab se last run dhundho
    last_total = all_epochs[-1]["total_epochs"]
    last_run = [e for e in reversed(all_epochs) if e["total_epochs"] == last_total]
    last_run = list(reversed(last_run))

    with open(OUT_FILE, "w") as f:
        json.dump(last_run, f, indent=2)

    print(f"✅ CNN log saved: {OUT_FILE} ({len(last_run)} epochs)")
    print(f"   Epoch range: 1 → {last_run[-1]['epoch']}")
    print(f"   Val acc range: {last_run[0]['val_accuracy']} → {last_run[-1]['val_accuracy']}")
else:
    print("❌ No epoch data found in log file.")