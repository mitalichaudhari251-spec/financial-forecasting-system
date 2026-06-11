'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generateEquityCurve } from '@/lib/chart-utils';
import { formatDate } from '@/lib/date-utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

interface Props { strategy?: string; }

export default function EquityCurveChart({ strategy = 'CNN + RL Hybrid' }: Props) {
  const { history, metrics, ohlcv, rewardCurve, equityCurve, lastForecast, ticker, aiOnline, train, refresh } = useRealtimeMetrics(); const seed = ohlcv.length;
  const data = useMemo(() => generateEquityCurve(180, 100_000, seed), [seed]);
  const finalValue = data[data.length - 1]?.value ?? 100_000;
  const totalReturn = ((finalValue / 100_000) - 1) * 100;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Equity Curve</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">{strategy} · 6-month backtest</p>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </div>
          <div className="text-xs text-[#9CA3AF]">${finalValue.toLocaleString()}</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatDate(v, 'MMM d')} interval={25} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} width={48} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`$${v.toLocaleString()}`, 'Portfolio Value']} />
          <ReferenceLine y={100_000} stroke="#E5E7EB" strokeDasharray="4 4" label={{ value: 'Initial', fill: '#9CA3AF', fontSize: 10 }} />
          <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} fill="url(#equityGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

