import { Request, Response } from 'express';
import { fetchYahooData } from '../services/forecast.service';

/** GET /api/market/ohlcv/:ticker?days=365 — server-side Yahoo proxy (avoids browser CORS) */
export async function getOHLCV(req: Request, res: Response): Promise<void> {
  try {
    const ticker = String(req.params['ticker'] || '').toUpperCase().trim();
    const days = parseInt(String(req.query['days'] || '365'), 10) || 365;

    if (!ticker) {
      res.status(400).json({ success: false, error: 'Ticker is required' });
      return;
    }

    const rows = await fetchYahooData(ticker, days);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch market data';
    console.error('Market OHLCV error:', message);
    res.status(500).json({ success: false, error: message });
  }
}
