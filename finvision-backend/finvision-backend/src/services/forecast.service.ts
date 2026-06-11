import axios from 'axios';
import { supabase } from '../config/supabase';
import { OHLCVRow, CNNPrediction, RLPrediction, ForecastResult, ForecastRequest } from '../types';
import { saveForecast, listForecasts as listStoredForecasts } from './forecast-store.service';

const AI_URL     = process.env.AI_BACKEND_URL || 'http://localhost:8000';
const WINDOW_SIZE = 50;

// ── Step 1: Fetch Yahoo Finance OHLCV ────────────────────────────────────────
export async function fetchYahooData(symbol: string, days: number = 365): Promise<OHLCVRow[]> {
  const range =
    days <= 30  ? '1mo'  :
    days <= 90  ? '3mo'  :
    days <= 180 ? '6mo'  :
    days <= 365 ? '1y'   : '2y';

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;

  const { data: json } = await axios.get(url, { timeout: 15000 });
  const result = json?.chart?.result?.[0];

  if (!result) throw new Error(`No Yahoo Finance data for symbol "${symbol}"`);

  const timestamps: number[] = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0] ?? {};

  const rows: OHLCVRow[] = timestamps
    .map((ts: number, i: number) => ({
      date:   new Date(ts * 1000).toISOString().slice(0, 10),
      open:   parseFloat((q.open?.[i]   ?? 0).toFixed(4)),
      high:   parseFloat((q.high?.[i]   ?? 0).toFixed(4)),
      low:    parseFloat((q.low?.[i]    ?? 0).toFixed(4)),
      close:  parseFloat((q.close?.[i]  ?? 0).toFixed(4)),
      volume: Math.round(q.volume?.[i]  ?? 0),
    }))
    .filter(
      (r: OHLCVRow) =>
        r.close > 0 &&
        r.open > 0 &&
        r.high >= r.low &&
        Number.isFinite(r.volume)
    );

  if (rows.length < WINDOW_SIZE) {
    throw new Error(`Not enough data for "${symbol}" — got ${rows.length} rows, need ${WINDOW_SIZE}`);
  }

  return rows;
}

// ── Step 2: Call CNN endpoint ─────────────────────────────────────────────────
async function callCNN(ticker: string, rows: OHLCVRow[]): Promise<CNNPrediction> {
  const window = rows.slice(-WINDOW_SIZE).map(r => [r.open, r.high, r.low, r.close, r.volume]);

  const { data } = await axios.post<CNNPrediction>(
    `${AI_URL}/predict/cnn`,
    { ticker, window },
    { timeout: 60000 }
  );
  return data;
}

// ── Step 3: Call RL endpoint ──────────────────────────────────────────────────
async function callRL(ticker: string, rows: OHLCVRow[]): Promise<RLPrediction> {
  const lastRow    = rows[rows.length - 1];
  const ohlcv_last = [lastRow.open, lastRow.high, lastRow.low, lastRow.close, lastRow.volume];

  // Build 512-dim embedding from price momentum
  const priceChanges = rows.slice(-512).map((r, i, arr) => {
    if (i === 0) return 0;
    const prev = arr[i - 1].close;
    return prev > 0 ? (r.close - prev) / prev : 0;
  });
  const embedding = Array.from({ length: 512 }, (_, i) =>
    i < priceChanges.length ? priceChanges[i] : 0
  );

  const { data } = await axios.post<RLPrediction>(
    `${AI_URL}/predict/rl`,
    { ticker, embedding, ohlcv_last },
    { timeout: 60000 }
  );
  return data;
}

// ── Step 4: Compute Sharpe ratio ──────────────────────────────────────────────
function computeSharpe(rows: OHLCVRow[], lookback = 30): number {
  const recent  = rows.slice(-lookback);
  const returns = recent.slice(1).map((r, i) => {
    const prev = recent[i].close;
    return prev > 0 ? (r.close - prev) / prev : 0;
  });
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std  = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length);
  return std > 0 ? parseFloat(((mean / std) * Math.sqrt(252)).toFixed(2)) : 0;
}

// ── Map helpers ───────────────────────────────────────────────────────────────
function mapDirection(dir: string): 'bullish' | 'bearish' | 'neutral' {
  if (dir === 'UP')   return 'bullish';
  if (dir === 'DOWN') return 'bearish';
  return 'neutral';
}

function mapAction(action: number): 'buy' | 'hold' | 'sell' {
  if (action === 1) return 'buy';
  if (action === 0) return 'sell';
  return 'hold';
}

// ── Main Forecast Function ────────────────────────────────────────────────────
export async function runForecast(
  req: ForecastRequest,
  userId: string
): Promise<ForecastResult> {
  const { ticker, horizon = '7d', algorithm = 'PPO' } = req;
  const days = horizon === '1d' ? 90 : horizon === '7d' ? 365 : 730;

  // 1. Fetch data from Yahoo
  const rows    = await fetchYahooData(ticker, days);
  const lastRow = rows[rows.length - 1];

  // 2. Call CNN
  const cnn = await callCNN(ticker, rows);

  // 3. Call RL
  const rl = await callRL(ticker, rows);

  // 4. Build result
  const direction   = mapDirection(cnn.direction);
  const confidence  = parseFloat((cnn.confidence * 100).toFixed(2));
  const rl_action   = mapAction(rl.action);
  const sharpe      = computeSharpe(rows);
  const bullishP    = cnn.probabilities.UP    ?? 0;
  const bearishP    = cnn.probabilities.DOWN  ?? 0;
  const neutralP    = Math.max(0, parseFloat((1 - bullishP - bearishP).toFixed(4)));

  const rationale =
    `CNN (ResNet-18) analyzed ${WINDOW_SIZE} candlestick windows for ${ticker} and detected ` +
    `a ${direction} signal with ${confidence.toFixed(1)}% confidence. ` +
    `${algorithm} agent recommends ${rl_action.toUpperCase()}. ` +
    `30-day Sharpe Ratio: ${sharpe}. Last close: ${lastRow.close.toFixed(2)} on ${lastRow.date}.`;

  const forecastResult: ForecastResult = {
    id:           `fc-${ticker}-${Date.now()}`,
    ticker,
    direction,
    confidence,
    probabilities: { bullish: bullishP, bearish: bearishP, neutral: neutralP },
    rl_action,
    rl_direction:  rl.direction,
    sharpe_ratio:  sharpe,
    rationale,
    model_version: 'v2.0-hybrid',
    algorithm,
    data_rows:     rows.length,
    last_close:    lastRow.close,
    last_date:     lastRow.date,
    created_at:    new Date().toISOString(),
    disclaimer:    cnn.disclaimer,
  };

  saveForecast(userId, forecastResult);

  // 5. Save to Supabase (optional — do not fail forecast if DB is unavailable)
  try {
    await supabase.from('forecasts').insert({
      ...forecastResult,
      user_id: userId,
    });
  } catch (err) {
    console.warn('Forecast saved locally only (Supabase unavailable):', err);
  }

  return forecastResult;
}
// ── Forecast from uploaded CSV data (Data Ingestion wali file) ───────────────
export async function runForecastFromBars(
  bars: OHLCVRow[],
  ticker: string,
  req: ForecastRequest,
  userId: string
): Promise<ForecastResult> {
  const { horizon = '7d', algorithm = 'PPO' } = req;

  if (bars.length < WINDOW_SIZE) {
    throw new Error(`Not enough data — got ${bars.length} rows, need ${WINDOW_SIZE}`);
  }

  const lastRow = bars[bars.length - 1];

  // Call CNN with uploaded bars
  const cnn = await callCNN(ticker, bars);

  // Call RL with uploaded bars
  const rl = await callRL(ticker, bars);

  const direction  = mapDirection(cnn.direction);
  const confidence = parseFloat((cnn.confidence * 100).toFixed(2));
  const rl_action  = mapAction(rl.action);
  const sharpe     = computeSharpe(bars);
  const bullishP   = cnn.probabilities.UP   ?? 0;
  const bearishP   = cnn.probabilities.DOWN ?? 0;
  const neutralP   = Math.max(0, parseFloat((1 - bullishP - bearishP).toFixed(4)));

  const rationale =
    `CNN (ResNet-18) analyzed ${WINDOW_SIZE} candlestick windows from uploaded CSV for ${ticker} and detected ` +
    `a ${direction} signal with ${confidence.toFixed(1)}% confidence. ` +
    `${algorithm} agent recommends ${rl_action.toUpperCase()}. ` +
    `30-day Sharpe Ratio: ${sharpe}. Last close: ${lastRow.close.toFixed(2)} on ${lastRow.date}.`;

  const forecastResult: ForecastResult = {
    id:            `fc-${ticker}-csv-${Date.now()}`,
    ticker,
    direction,
    confidence,
    probabilities: { bullish: bullishP, bearish: bearishP, neutral: neutralP },
    rl_action,
    rl_direction:  rl.direction,
    sharpe_ratio:  sharpe,
    rationale,
    model_version: 'v2.0-hybrid',
    algorithm,
    data_rows:     bars.length,
    last_close:    lastRow.close,
    last_date:     lastRow.date,
    created_at:    new Date().toISOString(),
    disclaimer:    cnn.disclaimer,
    data_source:   'csv',
  };

  saveForecast(userId, forecastResult);

  try {
    await supabase.from('forecasts').insert({ ...forecastResult, user_id: userId });
  } catch (err) {
    console.warn('Forecast saved locally only:', err);
  }

  return forecastResult;
}
// ── Get forecast history for a user ──────────────────────────────────────────
export async function getUserForecasts(userId: string, limit = 20): Promise<ForecastResult[]> {
  const stored = listStoredForecasts(userId, limit);
  if (stored.length > 0) return stored;

  try {
    const { data, error } = await supabase
      .from('forecasts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as ForecastResult[];
  } catch {
    return stored;
  }
}
