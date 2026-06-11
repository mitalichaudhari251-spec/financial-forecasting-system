'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generateEquityCurve } from '@/lib/chart-utils';
import { formatDate } from '@/lib/date-utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function RiskAnalysisChart() {
  const { history, metrics, ohlcv, rewardCurve, equityCurve, lastForecast, ticker, aiOnline, train, refresh } = useRealtimeMetrics(); const seed = ohlcv.length;
  const data = useMemo(() => generateEquityCurve(180, 100_000, seed), [seed]);

  const maxDrawdown = Math.min(...data.map((d) => d.drawdown));

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Drawdown Analysis</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">Underwater equity curve</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-red-500">{maxDrawdown.toFixed(2)}%</div>
          <div className="text-xs text-[#9CA3AF]">Max Drawdown</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatDate(v, 'MMM d')} interval={25} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v.toFixed(2)}%`, 'Drawdown']} />
          <ReferenceLine y={0} stroke="#E5E7EB" />
          <Area type="monotone" dataKey="drawdown" stroke="#DC2626" strokeWidth={1.5}
            fill="url(#drawdownGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

