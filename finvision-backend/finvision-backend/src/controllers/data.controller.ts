import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { saveUploadedDataset, listDatasets, getDataset } from '../services/data.service';
import {
  validateDataset,
  fetchTickerAsDataset,
  preprocessDataset,
  generateImages,
  getJob,
} from '../services/pipeline.service';

const OHLCVSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

const UploadSchema = z.object({
  filename: z.string().min(1).max(255),
  ticker: z.string().max(20).optional(),
  bars: z.array(OHLCVSchema).min(1),
});

export async function uploadDataset(req: AuthRequest, res: Response): Promise<void> {
  const parsed = UploadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message ?? 'Invalid payload' });
    return;
  }

  const { filename, bars, ticker } = parsed.data;
  const valid = bars.filter((b) => b.close > 0 && b.open > 0);

  if (valid.length < 10) {
    res.status(400).json({
      success: false,
      error: `Need at least 10 valid OHLCV rows (got ${valid.length})`,
    });
    return;
  }

  const dataset = saveUploadedDataset(filename, valid, ticker);

  res.status(200).json({
    success: true,
    data: {
      datasetId: dataset.id,
      dataset: {
        ticker: dataset.ticker,
        timeframe: dataset.timeframe,
        startDate: dataset.startDate,
        endDate: dataset.endDate,
        bars: dataset.bars,
        missingValues: bars.length - valid.length,
        schema: {
          hasDate: true,
          hasOpen: true,
          hasHigh: true,
          hasLow: true,
          hasClose: true,
          hasVolume: true,
          rowCount: dataset.rowCount,
          columnCount: 6,
          validationErrors: [],
        },
      },
    },
  });
}

export async function listUploaded(req: AuthRequest, res: Response): Promise<void> {
  const items = listDatasets().map((d) => ({
    id: d.id,
    name: d.filename,
    ticker: d.ticker,
    rowCount: d.rowCount,
    sizeBytes: JSON.stringify(d.bars).length,
    uploadedAt: d.uploadedAt,
  }));
  res.status(200).json({ success: true, data: items });
}

export async function previewDataset(req: AuthRequest, res: Response): Promise<void> {
  const dataset = getDataset(String(req.params['id'] || ''));
  if (!dataset) {
    res.status(404).json({ success: false, error: 'Dataset not found' });
    return;
  }

  const rows = parseInt(String(req.query['rows'] || '50'), 10) || 50;
  res.status(200).json({
    success: true,
    data: {
      ticker: dataset.ticker,
      timeframe: dataset.timeframe,
      startDate: dataset.startDate,
      endDate: dataset.endDate,
      bars: dataset.bars.slice(0, rows),
      missingValues: 0,
      schema: {
        hasDate: true,
        hasOpen: true,
        hasHigh: true,
        hasLow: true,
        hasClose: true,
        hasVolume: true,
        rowCount: dataset.rowCount,
        columnCount: 6,
        validationErrors: [],
      },
    },
  });
}

export async function fetchTicker(req: AuthRequest, res: Response): Promise<void> {
  const ticker = String(req.body?.ticker || '').toUpperCase();
  if (!ticker) {
    res.status(400).json({ success: false, error: 'Ticker required' });
    return;
  }
  try {
    const dataset = await fetchTickerAsDataset(
      ticker,
      req.body?.startDate,
      req.body?.endDate
    );
    res.json({
      success: true,
      data: { datasetId: dataset.id, dataset: { ticker: dataset.ticker, rowCount: dataset.rowCount } },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Fetch failed' });
  }
}

export async function validateData(req: AuthRequest, res: Response): Promise<void> {
  const result = validateDataset(String(req.params['id'] || ''));
  if (!result) {
    res.status(404).json({ success: false, error: 'Dataset not found' });
    return;
  }
  res.json({ success: true, data: result });
}

export async function preprocess(req: AuthRequest, res: Response): Promise<void> {
  const datasetId = String(req.body?.datasetId || '');
  const result = preprocessDataset(datasetId, req.body?.config ?? {});
  if (!result) {
    res.status(404).json({ success: false, error: 'Dataset not found' });
    return;
  }
  res.json({ success: true, data: result });
}

export async function generateImagesJob(req: AuthRequest, res: Response): Promise<void> {
  const datasetId = String(req.body?.processedId || req.body?.datasetId || '');
  const types = (req.body?.types as string[]) ?? ['candlestick'];
  try {
    const jobId = generateImages(datasetId, types, req.body?.resolution ?? 30);
    res.json({ success: true, data: { jobId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Image generation failed' });
  }
}

export async function getImageJob(req: AuthRequest, res: Response): Promise<void> {
  const job = getJob(String(req.params['jobId'] || ''));
  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found' });
    return;
  }
  res.json({ success: true, data: job });
}
