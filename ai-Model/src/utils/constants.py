"""Global constants for FinVision-RL."""

OHLCV_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]
DIRECTION_UP = 1
DIRECTION_DOWN = 0
DIRECTION_FLAT = 2  # Used in 3-class RL action space

# RL action mapping
ACTION_SELL = 0
ACTION_HOLD = 1
ACTION_BUY = 2
ACTION_NAMES = {ACTION_SELL: "Sell/Down", ACTION_HOLD: "Hold/Flat", ACTION_BUY: "Buy/Up"}

# Image type constants
IMAGE_CANDLESTICK = "candlestick"
IMAGE_GAF = "gaf"
GAF_SUMMATION = "summation"
GAF_DIFFERENCE = "difference"

# Asset types
ASSET_STOCKS = "stocks"
ASSET_CRYPTO = "crypto"
ASSET_FOREX = "forex"