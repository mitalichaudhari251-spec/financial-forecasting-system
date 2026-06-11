'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import type { ForecastProbabilities } from '@/types/forecast';

interface Props {
  probabilities?: ForecastProbabilities;
}

const DEFAULT_PROBS: ForecastProbabilities = { bullish: 0.842, neutral: 0.108, bearish: 0.05 };

export default function ProbabilityChart({ probabilities = DEFAULT_PROBS }: Props) {
  const data = [
    { name: 'Bullish', value: probabilities.bullish * 100, color: '#16A34A' },
    { name: 'Neutral', value: probabilities.neutral * 100, color: '#6B7280' },
    { name: 'Bearish', value: probabilities.bearish * 100, color: '#DC2626' },
  ];

  return (
    <div>
      <p className="text-xs font-semibold text-[#374151] mb-3">Prediction Probabilities</p>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, 'Probability']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
