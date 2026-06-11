'use client';

import { useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatDate } from '@/lib/date-utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function ForecastChart() {
  const { ohlcv, ticker, lastForecast } = useRealtimeMetrics();
  const days = Math.min(40, Math.max(20, ohlcv.length));

  const { data, badgeText } = useMemo(() => {
    const rawData = ohlcv.slice(-days).map((b) => ({
      date:   b.date,
      close:  b.close,
      volume: b.volume,
    }));

    if (!rawData.length) return { data: [], badgeText: 'Loading market data…' };

    if (!lastForecast) {
      return {
        data: rawData,
        badgeText: 'Run a forecast to see AI prediction',
      };
    }

    const isBullish = lastForecast.direction === 'bullish';
    const isBearish = lastForecast.direction === 'bearish';

    return {
      data: rawData,
      badgeText: `${isBullish ? '▲ Bullish' : isBearish ? '▼ Bearish' : '— Neutral'} · ${lastForecast.confidence.toFixed(1)}%`,
    };
  }, [ohlcv, days, lastForecast]);

  const lastClose = ohlcv.length > 0 ? ohlcv[ohlcv.length - 1].close : null;

  const badgeColor = lastForecast?.direction === 'bullish'
    ? 'text-green-700 bg-green-50 border-green-200'
    : lastForecast?.direction === 'bearish'
    ? 'text-red-700 bg-red-50 border-red-200'
    : 'text-gray-600 bg-gray-50 border-gray-200';

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Market Chart — {ticker}</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {lastForecast
              ? `CNN + ${lastForecast.rlRecommendation?.action?.toUpperCase() ?? 'RL'} signal`
              : 'Real price data from Yahoo Finance'}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatDate(v, 'MMM d')} interval={4} />
          <YAxis yAxisId="price" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`} domain={['auto', 'auto']} />
          <YAxis yAxisId="vol" orientation="right" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number, name: string) => [
              name === 'volume' ? `${(v / 1_000_000).toFixed(1)}M` : `$${v.toFixed(2)}`,
              name === 'close' ? 'Close Price (Yahoo)' : 'Volume',
            ]}
          />
          <Bar yAxisId="vol" dataKey="volume" fill="#E5E7EB" opacity={0.6} />
          <Line yAxisId="price" type="monotone" dataKey="close" stroke="#4F46E5" strokeWidth={2} dot={false} />
          {lastClose && (
            <ReferenceLine
              yAxisId="price"
              y={lastClose}
              stroke={
                lastForecast?.direction === 'bullish' ? '#16A34A' :
                lastForecast?.direction === 'bearish' ? '#DC2626' : '#6B7280'
              }
              strokeDasharray="5 3"
              label={{ value: `Last: $${lastClose.toFixed(2)}`, fill: '#6B7280', fontSize: 10, position: 'right' }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}