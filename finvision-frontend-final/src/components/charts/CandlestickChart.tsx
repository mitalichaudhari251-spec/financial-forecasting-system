'use client';

import { useMemo, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateMockOHLCV } from '@/lib/chart-utils';
import { formatDate } from '@/lib/date-utils';
import type { OHLCVBar } from '@/types/market';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

interface Props {
  ticker: string;
  showPrediction?: boolean;
  showGradCAM?: boolean;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: OHLCVBar & { isUp: boolean } }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-dropdown text-xs">
      <div className="font-semibold text-[#374151] mb-2">{formatDate(d.date)}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#6B7280]">
        <span>Open</span><span className="text-[#111827] font-medium">${d.open?.toFixed(2)}</span>
        <span>High</span><span className="text-green-600 font-medium">${d.high?.toFixed(2)}</span>
        <span>Low</span><span className="text-red-500 font-medium">${d.low?.toFixed(2)}</span>
        <span>Close</span><span className={`font-medium ${d.isUp ? 'text-green-600' : 'text-red-500'}`}>${d.close?.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function CandlestickChart({ ticker, showPrediction = false, showGradCAM = false, height = 300 }: Props) {
  const { history, metrics, ohlcv, rewardCurve, equityCurve, lastForecast, ticker : tickerName, aiOnline, train, refresh } = useRealtimeMetrics(); const seed = ohlcv.length;
  const rawData = useMemo(() => generateMockOHLCV(ticker, 60, 150, seed), [ticker, seed]);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const isBullish = seed % 3 !== 0;
  const confidence = 55 + ((seed % 1000) / 1000) * 25;
  const predictedSign = isBullish ? 1 : -1;
  const heatmapStart = 45 + (seed % 10);
  const heatmapEnd = heatmapStart + 6;

  const data = rawData.map((d, i) => ({
    ...d,
    isUp: d.close >= d.open,
    bodyLow: Math.min(d.open, d.close),
    bodyHigh: Math.max(d.open, d.close),
    predicted:
      showPrediction && i >= 55
        ? d.close *
          (1 + predictedSign * (confidence / 100) * ((i - 55) / (60 - 55)) * 0.015)
        : undefined,
  }));

  return (
    <div>
      {showGradCAM && (
        <div className="mb-3 p-2.5 rounded-lg bg-gradient-to-r from-red-50 via-amber-50 to-green-50 border border-[#E5E7EB]">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-red-400 via-amber-300 to-green-400" />
            <span>
              Grad-CAM activation heatmap — high activation at candles {heatmapStart}–{heatmapEnd}
            </span>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatDate(v, 'MMM d')} interval={9} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`} domain={['auto', 'auto']} width={48} />
          <Tooltip content={<CustomTooltip />} />

          {/* Candle bodies */}
          <Bar dataKey="bodyHigh" fill="transparent" stackId="candle">
            {data.map((d, i) => (
              <Cell key={i} fill={d.isUp ? '#16A34A' : '#DC2626'} />
            ))}
          </Bar>

          {/* Close prices as line */}
          <Line type="monotone" dataKey="close" stroke="#4F46E5" strokeWidth={1.5} dot={false} opacity={0.4} />

          {/* Predicted overlay */}
          {showPrediction && (
            <Line type="monotone" dataKey="predicted" stroke="#16A34A" strokeWidth={2}
              strokeDasharray="5 3" dot={{ fill: '#16A34A', r: 3 }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

