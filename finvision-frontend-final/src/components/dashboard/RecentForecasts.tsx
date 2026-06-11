'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimestamp, formatConfidence } from '@/lib/formatting';
import type { ForecastCase } from '@/types/forecast';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

function DirectionBadge({ direction }: { direction: string }) {
  const map = {
    bullish: { icon: <TrendingUp className="w-3 h-3" />, cls: 'bg-green-50 text-green-700 border-green-200' },
    bearish: { icon: <TrendingDown className="w-3 h-3" />, cls: 'bg-red-50 text-red-700 border-red-200' },
    neutral: { icon: <Minus className="w-3 h-3" />, cls: 'bg-gray-50 text-gray-600 border-gray-200' },
  };
  const d = map[direction as keyof typeof map] || map.neutral;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', d.cls)}>
      {d.icon} {direction}
    </span>
  );
}

export default function RecentForecasts() {
  const router = useRouter();
  const { history, dashboard } = useRealtimeMetrics();
  const forecasts: ForecastCase[] = (history.length ? history : dashboard?.recentForecasts?.map((f) => ({
    id: f.id,
    asset: f.ticker,
    direction: f.direction as ForecastCase['direction'],
    confidence: f.confidence,
    sharpeRatio: f.sharpe_ratio ?? 0,
    timestamp: f.created_at ?? new Date().toISOString(),
    modelVersion: f.model_version ?? 'v2.0',
    rlAlgorithm: (f.algorithm as 'PPO' | 'DQN') ?? 'PPO',
    horizon: '7d' as const,
    status: 'completed' as const,
  })) ?? []).slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#111827]">Recent Forecasts</h3>
        <button
          onClick={() => router.push('/history')}
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          View all <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {forecasts.map((forecast) => (
          <div
            key={forecast.id}
            onClick={() => router.push(`/history/${forecast.id}`)}
            className="flex items-center gap-3 p-3 rounded-lg border border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer transition-all group"
          >
            {/* Asset */}
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo-700">{forecast.asset.slice(0, 3)}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#111827]">{forecast.asset}</span>
                <DirectionBadge direction={forecast.direction} />
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#9CA3AF]">
                <Clock className="w-3 h-3" />
                {formatTimestamp(forecast.timestamp)}
                <span>·</span>
                <span>{forecast.rlAlgorithm}</span>
                <span>·</span>
                <span>{forecast.horizon}</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="text-right flex-shrink-0">
              <div className={cn(
                'text-sm font-bold',
                forecast.confidence >= 85 ? 'text-green-600' : forecast.confidence >= 70 ? 'text-amber-600' : 'text-red-500'
              )}>
                {formatConfidence(forecast.confidence)}
              </div>
              <div className="text-[10px] text-[#9CA3AF]">Sharpe {forecast.sharpeRatio.toFixed(2)}</div>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-[#D1D5DB] group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
