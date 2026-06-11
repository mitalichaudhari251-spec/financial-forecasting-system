'use client';

import { TrendingUp, TrendingDown, Minus, Brain, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ForecastResult } from '@/types/forecast';
import { formatTimestamp } from '@/lib/formatting';

interface Props { forecast?: ForecastResult; }

const DEFAULT_FORECAST: ForecastResult = {
  id: 'fc-default',
  asset: 'AAPL',
  direction: 'bullish',
  confidence: 84.2,
  confidenceLevel: 'high',
  probabilities: { bullish: 0.842, neutral: 0.108, bearish: 0.05 },
  rlRecommendation: {
    action: 'buy',
    expectedReward: 2.41,
    riskAdjustedConfidence: 81.3,
    rationale: 'Strong bullish confirmation from CNN pattern analysis with PPO agent recommendation.',
    marketRiskFactors: ['Earnings season', 'Fed rate decision'],
    patternCorrelation: 'Bullish Engulfing detected with 89% confidence.',
  },
  detectedPatterns: [
    { name: 'Bullish Engulfing', confidence: 0.89 },
    { name: 'Hammer', confidence: 0.76 },
  ],
  forecastHorizon: '7d',
  rationale: 'The CNN backbone identified strong upward momentum signals in the GAF image representation.',
  timestamp: new Date().toISOString(),
  modelVersion: 'v2.0',
  sharpeRatio: 1.92,
};

const DIR_CONFIG = {
  bullish: { icon: TrendingUp, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Bullish' },
  bearish: { icon: TrendingDown, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Bearish' },
  neutral: { icon: Minus, bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', label: 'Neutral' },
};

export default function PredictionSummary({ forecast = DEFAULT_FORECAST }: Props) {
  const cfg = DIR_CONFIG[forecast.direction];
  const Icon = cfg.icon;

  return (
    <div className="space-y-4">
      <div className={cn('rounded-xl border p-4 flex items-center gap-4', cfg.bg, cfg.border)}>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', cfg.bg, cfg.border)}>
          <Icon className={cn('w-6 h-6', cfg.text)} />
        </div>
        <div>
          <div className="text-xs text-[#6B7280] font-medium">Primary Prediction</div>
          <div className={cn('text-xl font-bold', cfg.text)}>{cfg.label}</div>
          <div className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-0.5">
            <Brain className="w-3 h-3" /> {forecast.modelVersion} · {forecast.forecastHorizon}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-[#6B7280]">Asset</div>
          <div className="text-lg font-bold text-[#111827]">{forecast.asset}</div>
          <div className="text-xs text-[#9CA3AF] flex items-center gap-1 justify-end mt-0.5">
            <Calendar className="w-3 h-3" />
            {formatTimestamp(forecast.timestamp)}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
        <p className="text-xs font-semibold text-[#374151] mb-1.5">AI Forecast Rationale</p>
        <p className="text-xs text-[#6B7280] leading-relaxed">{forecast.rationale}</p>
      </div>

      {forecast.detectedPatterns.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#374151] mb-2">Detected Chart Patterns</p>
          <div className="flex flex-wrap gap-2">
            {forecast.detectedPatterns.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                {p.name}
                <span className="text-indigo-400 font-normal">({(p.confidence * 100).toFixed(0)}%)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
