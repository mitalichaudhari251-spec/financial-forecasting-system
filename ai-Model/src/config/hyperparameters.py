"""
FinVision-RL Hyperparameters - Final Fixed Version
"""

# Data / Preprocessing
WINDOW_SIZE          = 50
WINDOW_STEP          = 1
MIN_DATA_PERIODS     = 500
MAX_MISSING_RATIO    = 0.20
FRAC_DIFF_ORDER      = 0.4
OUTLIER_STD_THRESHOLD = 3.0
FORWARD_FILL_LIMIT   = 3

# Image Generation
IMAGE_SIZE   = (128, 128)
IMAGE_METHOD = "candlestick"
GAF_METHOD   = "summation"

# CNN
CNN_BACKBONE     = "resnet18"
EMBEDDING_DIM    = 512
CNN_BATCH_SIZE   = 64
CNN_EPOCHS       = 30
CNN_LR_HEAD      = 1e-3
CNN_LR_BACKBONE  = 1e-5
CNN_DROPOUT      = 0.3
CNN_TRAIN_RATIO  = 0.80
CNN_NUM_WORKERS  = 0          # 0 = main process only (safer on Windows CPU)
CNN_WEIGHT_DECAY = 1e-4

# RL
RL_ALGORITHM          = "PPO"
RL_TOTAL_TIMESTEPS    = 500_000   # reduced - enough for small datasets on CPU
RL_GAMMA              = 0.99
RL_LEARNING_RATE      = 3e-4
RL_BATCH_SIZE         = 64
RL_N_STEPS            = 512       # reduced from 2048 - faster updates on small env
RL_N_EPOCHS           = 10
RL_CLIP_RANGE         = 0.2
RL_ENT_COEF           = 0.05      # higher entropy = more exploration = diverse actions
RL_VF_COEF            = 0.5
RL_BUFFER_SIZE        = 100_000
RL_LEARNING_STARTS    = 1_000
RL_EXPLORATION_FRACTION = 0.2

# Reward - balanced to encourage both accuracy and returns
REWARD_ALPHA     = 0.5    # prediction accuracy weight
REWARD_BETA      = 0.4    # return weight
REWARD_GAMMA     = 0.1    # transaction cost penalty
TRANSACTION_COST = 0.001  # 0.1% per trade

# Evaluation
TEST_RATIO            = 0.20
RISK_FREE_RATE        = 0.05
TRADING_DAYS_PER_YEAR = 252

# Data Splits - 70/10/20
TRAIN_RATIO = 0.70
VAL_RATIO   = 0.10

# Seeds
RANDOM_SEED = 42