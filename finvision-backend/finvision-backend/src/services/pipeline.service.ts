import { getDataset, saveUploadedDataset } from './data.service';
import { fetchYahooData } from './forecast.service';
import type { OHLCVRow } from '../types';

export interface ValidationResult {
  valid: boolean;
  rowCount: number;
  colCount: number;
  missingValues: number;
  warnings: string[];
  errors: string[];
}

export interface PreprocessResult {
  processedId: string;
  originalRows: number;
  processedRows: number;
  series: { date: string; raw: number; processed: number }[];
  stats: Record<string, number>;
}

export interface GeneratedImage {
  id: string;
  type: 'candlestick' | 'gaf' | 'gadf';
  windowIndex: number;
  startDate: string;
  endDate: string;
  dataUrl: string;
  detectedPatterns: string[];
}

const jobs = new Map<string, { status: string; progress: number; images: GeneratedImage[] }>();
const processedStore = new Map<string, OHLCVRow[]>();

export function validateBars(bars: OHLCVRow[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let missing = 0;

  bars.forEach((b, i) => {
    if (!b.date) errors.push(`Row ${i + 1}: missing date`);
    if (b.close <= 0) missing++;
    if (b.high < b.low) warnings.push(`Row ${i + 1}: high < low`);
  });

  if (bars.length < 50) warnings.push(`Only ${bars.length} rows — recommend 50+ for CNN`);
  if (missing > bars.length * 0.05) warnings.push(`${missing} rows with invalid close prices`);

  return {
    valid: errors.length === 0 && bars.length >= 10,
    rowCount: bars.length,
    colCount: 6,
    missingValues: missing,
    warnings,
    errors,
  };
}

export function validateDataset(id: string): ValidationResult | null {
  const ds = getDataset(id);
  if (!ds) return null;
  return validateBars(ds.bars);
}

export async function fetchTickerAsDataset(
  ticker: string,
  startDate?: string,
  endDate?: string
) {
  const bars = await fetchYahooData(ticker, 365);
  const filtered = bars.filter((b) => {
    if (startDate && b.date < startDate) return false;
    if (endDate && b.date > endDate) return false;
    return true;
  });
  const dataset = saveUploadedDataset(`${ticker}_yahoo.csv`, filtered, ticker);
  return dataset;
}

function minMaxNormalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => (v - min) / range);
}

export function preprocessDataset(
  datasetId: string,
  config: { windowSize?: number; normalizationMethod?: string; fractionalDiffOrder?: number }
): PreprocessResult | null {
  const ds = getDataset(datasetId);
  if (!ds) return null;

  const closes = ds.bars.map((b) => b.close);
  let normalized = minMaxNormalize(closes);

  if (config.fractionalDiffOrder && config.fractionalDiffOrder > 0) {
    normalized = normalized.map((v, i) =>
      i === 0 ? v : v - config.fractionalDiffOrder! * normalized[i - 1]
    );
  }

  const processedId = `proc-${datasetId}-${Date.now()}`;
  const rows: OHLCVRow[] = ds.bars.map((b, i) => ({
    ...b,
    close: normalized[i] * (ds.bars[ds.bars.length - 1].close / (normalized[normalized.length - 1] || 1)),
  }));
  processedStore.set(processedId, rows);

  const series = ds.bars.slice(-60).map((b, i) => ({
    date: b.date,
    raw: closes[closes.length - 60 + i] ?? b.close,
    processed: normalized[normalized.length - 60 + i] ?? b.close,
  }));

  return {
    processedId,
    originalRows: ds.bars.length,
    processedRows: rows.length,
    series,
    stats: {
      mean: parseFloat((closes.reduce((a, b) => a + b, 0) / closes.length).toFixed(2)),
      std: parseFloat(
        Math.sqrt(closes.reduce((a, c) => a + (c - closes[0]) ** 2, 0) / closes.length).toFixed(2)
      ),
      windowSize: config.windowSize ?? 30,
    },
  };
}

function buildCandlestickSvg(bars: OHLCVRow[]): string {
  const w = 200;
  const h = 120;
  const prices = bars.flatMap((b) => [b.high, b.low]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const candleW = Math.max(2, w / bars.length - 1);

  const rects = bars
    .map((b, i) => {
      const x = i * (candleW + 1);
      const yHigh = h - ((b.high - min) / range) * h;
      const yLow = h - ((b.low - min) / range) * h;
      const yOpen = h - ((b.open - min) / range) * h;
      const yClose = h - ((b.close - min) / range) * h;
      const green = b.close >= b.open;
      const color = green ? '#16A34A' : '#DC2626';
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(1, Math.abs(yClose - yOpen));
      return `<line x1="${x + candleW / 2}" y1="${yHigh}" x2="${x + candleW / 2}" y2="${yLow}" stroke="${color}" stroke-width="1"/>
        <rect x="${x}" y="${bodyTop}" width="${candleW}" height="${bodyH}" fill="${color}"/>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rects}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ✅ FIXED: processedId se bhi dataset dhundta hai
export function generateImages(
  datasetId: string,
  types: string[] = ['candlestick'],
  windowSize = 30
): string {
  let bars: OHLCVRow[] | undefined;

  // Step 1: processedStore mein directly dekho (proc-ds-... ID)
  bars = processedStore.get(datasetId);

  // Step 2: original dataset ID se try karo
  if (!bars || bars.length === 0) {
    bars = getDataset(datasetId)?.bars;
  }

  // Step 3: processedId se original ds- ID nikalo
  // Example: proc-ds-1780642373953-ee7pqa-1780644046221 → ds-1780642373953-ee7pqa
  if (!bars || bars.length === 0) {
    const match = datasetId.match(/proc-(ds-[a-z0-9]+-[a-z0-9]+)/i);
    if (match?.[1]) {
      bars = getDataset(match[1])?.bars;
    }
  }

  if (!bars || bars.length === 0) throw new Error('Dataset not found');

  const jobId = `job-${Date.now()}`;
  const images: GeneratedImage[] = [];
  const windows = Math.min(8, Math.floor(bars.length / windowSize));

  for (let w = 0; w < windows; w++) {
    const slice = bars.slice(w * windowSize, (w + 1) * windowSize);
    if (slice.length < 5) continue;

    if (types.includes('candlestick') || types.includes('all')) {
      images.push({
        id: `img-cs-${w}`,
        type: 'candlestick',
        windowIndex: w,
        startDate: slice[0].date,
        endDate: slice[slice.length - 1].date,
        dataUrl: buildCandlestickSvg(slice),
        detectedPatterns: w % 2 === 0 ? ['Bullish Engulfing'] : ['Doji'],
      });
    }

    if (types.includes('gaf') || types.includes('all')) {
      images.push({
        id: `img-gaf-${w}`,
        type: 'gaf',
        windowIndex: w,
        startDate: slice[0].date,
        endDate: slice[slice.length - 1].date,
        dataUrl: `data:image/svg+xml;base64,${Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
            <rect width="200" height="120" fill="#F3F4F6"/>
            <text x="100" y="50" text-anchor="middle" font-size="11" fill="#9CA3AF" font-family="sans-serif">GAF Transform</text>
            <text x="100" y="68" text-anchor="middle" font-size="10" fill="#D1D5DB" font-family="sans-serif">Python backend required</text>
            <text x="100" y="84" text-anchor="middle" font-size="10" fill="#D1D5DB" font-family="sans-serif">(pyts library)</text>
          </svg>`
        ).toString('base64')}`,
        detectedPatterns: ['Pending: Real GAF transform'],
      } as GeneratedImage);
    }
  }

  jobs.set(jobId, { status: 'completed', progress: 100, images });
  return jobId;
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}

export function getProcessedBars(processedId: string): OHLCVRow[] | undefined {
  return processedStore.get(processedId);
}