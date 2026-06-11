"""PPO agent - FinVision-RL Final Fixed Version"""
from __future__ import annotations
from pathlib import Path
import numpy as np

from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import (
    EvalCallback,
    StopTrainingOnNoModelImprovement,
)
from stable_baselines3.common.vec_env import (
    DummyVecEnv,
    VecNormalize,
)

from src.rl.agents.base_agent import BaseAgent
from src.config.hyperparameters import (
    RL_LEARNING_RATE,
    RL_N_STEPS,
    RL_BATCH_SIZE,
    RL_N_EPOCHS,
    RL_GAMMA,
    RL_CLIP_RANGE,
    RL_ENT_COEF,
    RL_VF_COEF,
    RL_TOTAL_TIMESTEPS,
)
from src.utils.logger import log


class PPOAgent(BaseAgent):

    def __init__(self, env_fn, verbose: int = 1):

        vec_env = DummyVecEnv([env_fn])

        self.vec_env = VecNormalize(
            vec_env,
            norm_obs=True,
            norm_reward=True,
            clip_obs=10.0,
        )

        self.model = PPO(
            policy="MlpPolicy",
            env=self.vec_env,
            learning_rate=RL_LEARNING_RATE,
            n_steps=RL_N_STEPS,
            batch_size=RL_BATCH_SIZE,
            n_epochs=RL_N_EPOCHS,
            gamma=RL_GAMMA,
            clip_range=RL_CLIP_RANGE,
            ent_coef=RL_ENT_COEF,
            vf_coef=RL_VF_COEF,
            verbose=verbose,
            tensorboard_log=None,
        )

        log.info("PPO agent initialised")

    def train(
        self,
        env=None,
        total_timesteps: int = RL_TOTAL_TIMESTEPS,
        checkpoint_path: Path | None = None,
        **kwargs,
    ) -> None:

        callbacks = []

        if checkpoint_path:

            Path(checkpoint_path).parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            eval_callback = EvalCallback(
                self.vec_env,
                best_model_save_path=str(Path(checkpoint_path).parent),
                log_path=str(Path(checkpoint_path).parent / "logs"),
                eval_freq=5000,
                deterministic=True,
                render=False,
                callback_after_eval=StopTrainingOnNoModelImprovement(
                    max_no_improvement_evals=30,
                    min_evals=10,
                    verbose=1,
                ),
            )

            callbacks.append(eval_callback)

        log.info(
            f"PPO training started: {total_timesteps} timesteps"
        )

        self.model.learn(
            total_timesteps=total_timesteps,
            callback=callbacks if callbacks else None,
            progress_bar=True,
        )

        log.info("PPO training complete")

    def predict(
        self,
        observation: np.ndarray,
    ) -> tuple[int, dict]:

        expected_dim = self.vec_env.obs_rms.mean.shape[0]
        received_dim = observation.shape[0]

        log.info(
            f"PPO predict -> received_dim={received_dim}, expected_dim={expected_dim}"
        )

        if received_dim != expected_dim:
            raise ValueError(
                f"Observation dimension mismatch: "
                f"received={received_dim}, expected={expected_dim}"
            )

        obs = self.vec_env.normalize_obs(
            observation.reshape(1, -1)
        )

        action, _ = self.model.predict(
            obs,
            deterministic=True,
        )

        return int(action[0]), {}

    def save(self, path: Path) -> None:

        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.model.save(str(path))
        self.vec_env.save(
            str(path) + "_vecnorm.pkl"
        )

        log.info(
            f"PPO model saved: {path}"
        )

    def load(self, path: Path) -> None:

        path = Path(path)

        self.model = PPO.load(
            str(path),
            env=self.vec_env,
        )

        log.info(
            f"PPO model loaded: {path}"
        )