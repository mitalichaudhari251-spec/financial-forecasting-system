-- FinVision-RL Supabase Database Schema
-- Run this in Supabase → SQL Editor

-- ── Users table ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  full_name  TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'analyst', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Forecasts table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.forecasts (
  id            TEXT PRIMARY KEY,
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ticker        TEXT NOT NULL,
  direction     TEXT NOT NULL CHECK (direction IN ('bullish', 'bearish', 'neutral')),
  confidence    NUMERIC(5,2) NOT NULL,
  probabilities JSONB NOT NULL DEFAULT '{}',
  rl_action     TEXT NOT NULL CHECK (rl_action IN ('buy', 'hold', 'sell')),
  rl_direction  TEXT,
  sharpe_ratio  NUMERIC(8,4),
  rationale     TEXT,
  model_version TEXT DEFAULT 'v2.0-hybrid',
  algorithm     TEXT DEFAULT 'PPO',
  data_rows     INTEGER,
  last_close    NUMERIC(12,4),
  last_date     DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  disclaimer    TEXT
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can only see their own forecasts
CREATE POLICY "Users can view own forecasts"
  ON public.forecasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forecasts"
  ON public.forecasts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_forecasts_user_id   ON public.forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_ticker    ON public.forecasts(ticker);
CREATE INDEX IF NOT EXISTS idx_forecasts_created   ON public.forecasts(created_at DESC);
