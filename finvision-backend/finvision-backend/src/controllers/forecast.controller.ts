import { Response } from 'express';
import { z } from 'zod';
import { runForecast, runForecastFromBars, getUserForecasts } from '../services/forecast.service';
import { getDataset } from '../services/data.service';
import { AuthRequest } from '../types';

const ForecastSchema = z.object({
  ticker:     z.string().min(1).max(20).transform(s => s.toUpperCase().trim()),
  horizon:    z.enum(['1d', '7d', '30d']).optional().default('7d'),
  algorithm:  z.enum(['PPO', 'DQN']).optional().default('PPO'),
  dataSource: z.enum(['yahoo', 'csv']).optional().default('yahoo'),
  datasetId:  z.string().optional(),
});

export async function forecast(req: AuthRequest, res: Response): Promise<void> {
  const parsed = ForecastSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    const { ticker, dataSource, datasetId, ...rest } = parsed.data;

    // CSV source — uploaded dataset use karo
    if (dataSource === 'csv') {
      if (!datasetId) {
        res.status(400).json({ success: false, error: 'datasetId required for CSV source' });
        return;
      }

      const dataset = getDataset(datasetId);
      if (!dataset) {
        res.status(404).json({ success: false, error: `Dataset "${datasetId}" not found — please re-upload` });
        return;
      }

      const result = await runForecastFromBars(
        dataset.bars,
        dataset.ticker || ticker,
        { ticker, ...rest },
        userId
      );
      res.status(200).json({ success: true, data: result, dataSource: 'csv' });
      return;
    }

    // Yahoo Finance source (default)
    const result = await runForecast({ ticker, ...rest }, userId);
    res.status(200).json({ success: true, data: result, dataSource: 'yahoo' });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Forecast failed';
    console.error('Forecast error:', message);
    res.status(500).json({ success: false, error: message });
  }
}

export async function history(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    const limit = parseInt(req.query['limit'] as string) || 20;
    const results = await getUserForecasts(userId, limit);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch history';
    res.status(500).json({ success: false, error: message });
  }
}

export async function aiHealth(req: AuthRequest, res: Response): Promise<void> {
  try {
    const axios = await import('axios');
    const { data } = await axios.default.get(
      `${process.env.AI_BACKEND_URL || 'http://localhost:8000'}/health`,
      { timeout: 4000 }
    );
    res.status(200).json({ success: true, data });
  } catch {
    res.status(503).json({ success: false, error: 'AI backend not reachable' });
  }
}