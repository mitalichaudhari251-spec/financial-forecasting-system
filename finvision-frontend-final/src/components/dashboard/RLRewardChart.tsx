'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generateRewardCurve } from '@/lib/chart-utils';
import { CHART_DEFAULTS, CHART_COLORS } from '@/config/charts';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function RLRewardChart() {
  const { rewardCurve, seed } = useRealtimeMetrics();
  const data = useMemo(
    () => (rewardCurve.length ? rewardCurve : generateRewardCurve(160, seed)),
    [rewardCurve, seed]
  );
  const episodes = data.length;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">RL Reward Progression</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">PPO agent episode rewards over training</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280]">Episodes: {episodes}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            Converged
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={CHART_DEFAULTS.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="episode" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(v) => `Episode ${v}`}
            formatter={(v: number) => [v.toFixed(3), 'Reward']}
          />
          <ReferenceLine y={0} stroke="#E5E7EB" strokeDasharray="4 4" />
          <Line
            type="monotone" dataKey="reward" stroke={CHART_COLORS.primary}
            strokeWidth={2} dot={false} activeDot={{ r: 4, fill: CHART_COLORS.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
