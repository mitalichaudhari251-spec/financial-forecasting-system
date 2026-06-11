'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

interface Signal {
  asset: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  action: 'BUY' | 'SELL' | 'HOLD';
}

const ACTION_COLORS: Record<string, string> = {
  BUY: 'bg-green-50 text-green-700 border-green-200',
  SELL: 'bg-red-50 text-red-700 border-red-200',
  HOLD: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function ForecastCard() {
  const { history, lastForecast } = useRealtimeMetrics();

  const signals: Signal[] = (history.length ? history : lastForecast ? [lastForecast] : []).slice(0, 6).map((f) => {
    const action =
      f.direction === 'bullish' ? 'BUY' : f.direction === 'bearish' ? 'SELL' : 'HOLD';
    return {
      asset: 'asset' in f ? f.asset : (f as { ticker?: string }).ticker ?? '—',
      direction: f.direction,
      confidence: f.confidence,
      action: action as 'BUY' | 'SELL' | 'HOLD',
    };
  });

  if (!signals.length) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#111827] mb-2">Live Signals</h3>
        <p className="text-xs text-[#6B7280]">Run a forecast to see signals</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h3 className="text-sm font-semibold text-[#111827] mb-4">Live Signals</h3>
      <div className="space-y-2">
        {signals.map((s) => (
          <div key={s.asset} className="flex items-center justify-between p-2.5 rounded-lg border border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              {s.direction === 'bullish' ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              ) : s.direction === 'bearish' ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="text-xs font-bold text-[#111827]">{s.asset}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7280]">{s.confidence.toFixed(1)}%</span>
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', ACTION_COLORS[s.action])}>
                {s.action}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
