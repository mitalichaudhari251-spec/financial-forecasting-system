// ── Auth Types ────────────────────────────────────────────────────────────────
export interface RegisterBody {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserProfile;
    access_token: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'analyst' | 'admin';
  created_at: string;
}

// ── JWT Payload ───────────────────────────────────────────────────────────────
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ── Forecast Types ────────────────────────────────────────────────────────────
export interface ForecastRequest {
  ticker: string;
  horizon?: '1d' | '7d' | '30d';
  algorithm?: 'PPO' | 'DQN';
}

export interface OHLCVRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CNNPrediction {
  ticker: string;
  direction: 'UP' | 'DOWN' | 'UNKNOWN';
  confidence: number;
  probabilities: { DOWN: number; UP: number };
  disclaimer: string;
}

export interface RLPrediction {
  ticker: string;
  action: number;
  direction: string;
  disclaimer: string;
}

export interface ForecastResult {
  id: string;
  ticker: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  probabilities: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  rl_action: 'buy' | 'hold' | 'sell';
  rl_direction: string;
  sharpe_ratio: number;
  rationale: string;
  model_version: string;
  algorithm: string;
  data_rows: number;
  last_close: number;
  last_date: string;
  created_at: string;
  disclaimer: string;
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ── Express Request with user ─────────────────────────────────────────────────
import { Request } from 'express';
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
