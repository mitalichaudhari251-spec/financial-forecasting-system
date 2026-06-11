import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { runBacktest, getBenchmark, getRiskMetrics, simulatePortfolio } from '../services/analytics.service';

export async function backtest(req: AuthRequest, res: Response): Promise<void> {
  const schema = z.object({
    asset: z.string().min(1),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    initialCapital: z.number().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
    return;
  }
  try {
    const result = await runBacktest(
      parsed.data.asset.toUpperCase(),
      365,
      parsed.data.initialCapital
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Backtest failed' });
  }
}

export async function benchmark(req: AuthRequest, res: Response): Promise<void> {
  const asset = String(req.query['asset'] || 'AAPL').toUpperCase();
  try {
    const data = await getBenchmark(asset);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Benchmark failed' });
  }
}

export async function risk(req: AuthRequest, res: Response): Promise<void> {
  const asset = String(req.query['asset'] || 'AAPL').toUpperCase();
  try {
    const data = await getRiskMetrics(asset);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Risk analysis failed' });
  }
}

export async function portfolio(req: AuthRequest, res: Response): Promise<void> {
  const schema = z.object({
    assets: z.array(z.string()).min(1),
    weights: z.array(z.number()),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid portfolio params' });
    return;
  }
  try {
    const data = await simulatePortfolio(
      parsed.data.assets.map((a) => a.toUpperCase()),
      parsed.data.weights
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Portfolio sim failed' });
  }
}
