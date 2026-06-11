"""
CNN Trainer — handles train/validation loop with early stopping and checkpointing.
"""
from __future__ import annotations
import torch
import torch.nn as nn
from pathlib import Path
from tqdm import tqdm
from src.utils.logger import log
from src.utils.device import DEVICE


class CNNTrainer:
    """Encapsulates CNN training and validation logic."""

    def __init__(
        self,
        model: nn.Module,
        optimizer,
        criterion: nn.Module,
        scheduler=None,
        checkpoint_path: Path | None = None,
        patience: int = 15,
    ):
        self.model           = model.to(DEVICE)
        self.optimizer       = optimizer
        self.criterion       = criterion
        self.scheduler       = scheduler
        self.checkpoint_path = checkpoint_path
        self.patience        = patience

        self.history = {
            "train_loss": [], "val_loss": [],
            "train_acc":  [], "val_acc":  [],
        }
        self._best_val_acc    = 0.0
        self._patience_counter = 0

    def train_epoch(self, loader) -> tuple[float, float]:
        self.model.train()
        total_loss, correct, total = 0.0, 0, 0

        for imgs, labels in tqdm(loader, desc="Train", leave=False):
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            self.optimizer.zero_grad()
            logits = self.model(imgs)
            loss   = self.criterion(logits, labels)
            loss.backward()
            nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()

            total_loss += loss.item() * len(labels)
            correct    += (logits.argmax(1) == labels).sum().item()
            total      += len(labels)

        return total_loss / total, correct / total

    @torch.no_grad()
    def val_epoch(self, loader) -> tuple[float, float]:
        self.model.eval()
        total_loss, correct, total = 0.0, 0, 0

        for imgs, labels in tqdm(loader, desc="Val", leave=False):
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            logits = self.model(imgs)
            loss   = self.criterion(logits, labels)

            total_loss += loss.item() * len(labels)
            correct    += (logits.argmax(1) == labels).sum().item()
            total      += len(labels)

        return total_loss / total, correct / total

    def fit(self, train_loader, val_loader, epochs: int) -> dict:
        """Full training loop with early stopping.

        FIX: reset patience counter at the start of every fit() call so
        Phase 2 doesn't inherit Phase 1's accumulated counter and stop
        at epoch 1.
        """
        # FIX: reset per-phase state so Phase 2 gets a clean start
        self._patience_counter = 0
        # Keep _best_val_acc across phases so we never save a worse model

        log.info(f"Training CNN for {epochs} epochs on {DEVICE}")

        for epoch in range(1, epochs + 1):
            tr_loss, tr_acc = self.train_epoch(train_loader)
            val_loss, val_acc = self.val_epoch(val_loader)

            self.history["train_loss"].append(tr_loss)
            self.history["val_loss"].append(val_loss)
            self.history["train_acc"].append(tr_acc)
            self.history["val_acc"].append(val_acc)

            log.info(
                f"Epoch {epoch}/{epochs} | "
                f"train_loss={tr_loss:.4f} train_acc={tr_acc:.4f} | "
                f"val_loss={val_loss:.4f} val_acc={val_acc:.4f}"
            )

            # ── JSON log save karo (frontend ke liye) ──────────────────
            try:
                import json
                from pathlib import Path
                log_path = Path("logs/cnn_training_log.json")
                log_path.parent.mkdir(parents=True, exist_ok=True)
                # Poori history har epoch pe overwrite karo
                log_data = [
                    {
                        "epoch":        i + 1,
                        "train_loss":   round(self.history["train_loss"][i], 6),
                        "val_loss":     round(self.history["val_loss"][i], 6),
                        "train_acc":    round(self.history["train_acc"][i], 6),
                        "val_accuracy": round(self.history["val_acc"][i], 6),
                        "total_epochs": epochs,
                    }
                    for i in range(len(self.history["train_loss"]))
                ]
                with open(log_path, "w") as f:
                    json.dump(log_data, f, indent=2)
            except Exception as _log_err:
                log.warning(f"Could not save training log: {_log_err}")
            # ───────────────────────────────────────────────────────────

            if self.scheduler is not None:
                if isinstance(
                    self.scheduler,
                    torch.optim.lr_scheduler.ReduceLROnPlateau
                ):
                    self.scheduler.step(val_acc)
                else:
                    self.scheduler.step()

            if val_acc > self._best_val_acc:
                self._best_val_acc    = val_acc
                self._patience_counter = 0
                if self.checkpoint_path:
                    self._save_checkpoint(epoch, val_acc)
            else:
                self._patience_counter += 1
                if self._patience_counter >= self.patience:
                    log.info(
                        f"Early stopping at epoch {epoch} "
                        f"(patience={self.patience})"
                    )
                    break

        log.info(f"Training complete. Best val_acc={self._best_val_acc:.4f}")
        return self.history

    def _save_checkpoint(self, epoch: int, val_acc: float) -> None:
        path = Path(self.checkpoint_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            "epoch":               epoch,
            "model_state_dict":    self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "val_acc":             val_acc,
        }, str(path))
        log.info(f"Checkpoint saved: {path} (val_acc={val_acc:.4f})")

    def load_best(self) -> None:
        if self.checkpoint_path and Path(self.checkpoint_path).exists():
            ckpt = torch.load(
                str(self.checkpoint_path), map_location=DEVICE
            )
            self.model.load_state_dict(ckpt["model_state_dict"])
            log.info(
                f"Loaded checkpoint from epoch {ckpt['epoch']} "
                f"(val_acc={ckpt['val_acc']:.4f})"
            )