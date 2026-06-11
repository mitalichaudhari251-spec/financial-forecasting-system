'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';

interface TimelineEntry {
  horizon: string;
  label: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  expectedReturn: string;
}

interface ForecastTimelineProps {
  asset?: string;
  entries?: TimelineEntry[];
}

const MOCK_ENTRIES: TimelineEntry[] = [
  { horizon: '1D',  label: '1 Day',    direction: 'bullish', confidence: 72, expectedReturn: '+1.2%' },
  { horizon: '3D',  label: '3 Days',   direction: 'bullish', confidence: 81, expectedReturn: '+2.8%' },
  { horizon: '7D',  label: '7 Days',   direction: 'bullish', confidence: 84, expectedReturn: '+4.1%' },
  { horizon: '14D', label: '14 Days',  direction: 'neutral', confidence: 61, expectedReturn: '+0.4%' },
  { horizon: '30D', label: '30 Days',  direction: 'bearish', confidence: 58, expectedReturn: '-2.1%' },
];

const DIR_CONFIG = {
  bullish: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' },
  bearish: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500' },
  neutral: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', bar: 'bg-gray-400' },
};

export default function ForecastTimeline({ asset = 'AAPL', entries = MOCK_ENTRIES }: ForecastTimelineProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#111827]">Multi-Horizon Forecast Timeline</h3>
        <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
          <Clock className="w-3.5 h-3.5" />
          <span>{asset} · Updated just now</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {entries.map((entry, i) => {
          const cfg = DIR_CONFIG[entry.direction];
          const Icon = cfg.icon;
          return (
            <div key={entry.horizon} className="flex items-center gap-3">
              {/* Timeline connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center border', cfg.bg, cfg.border)}>
                  <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                </div>
                {i < entries.length - 1 && (
                  <div className="w-px h-4 bg-[#E5E7EB] mt-1" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111827]">{entry.label}</span>
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize', cfg.bg, cfg.color, 'border', cfg.border)}>
                      {entry.direction}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={cn('font-bold', entry.direction === 'bearish' ? 'text-red-500' : entry.direction === 'bullish' ? 'text-green-600' : 'text-gray-500')}>
                      {entry.expectedReturn}
                    </span>
                    <span className="text-[#9CA3AF]">{entry.confidence}% conf</span>
                  </div>
                </div>
                {/* Confidence bar */}
                <div className="h-1 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', cfg.bar)}
                    style={{ width: `${entry.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
