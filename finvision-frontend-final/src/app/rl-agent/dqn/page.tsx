'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Brain, Shield } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function DQNPage() {
  const { lastForecast, aiOnline } = useRealtimeMetrics();
  const [rewardData, setRewardData] = useState<{ episode: number; reward: number }[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    api.get('/training/reward-history')
      .then((json: any) => {
        if (json?.data?.episodes) {
          setRewardData(json.data.episodes.map((e: any) => ({ episode: e.episode, reward: e.dqn })));
          setIsLive(json.data.isLive ?? false);
        }
      })
      .catch(() => {});
  }, [aiOnline]);

  const rlAction = lastForecast?.rlRecommendation?.action ?? null;
  const isBuy = rlAction === 'buy';
  const isSell = rlAction === 'sell';

  return (
    <DashboardLayout>
      <PageContainer title="DQN Agent" subtitle="Deep Q-Network — real inference results from last forecast">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">

          {!aiOnline && (
            <motion.div variants={fadeInUp} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              AI server is offline. Run a forecast to see real DQN values.
            </motion.div>
          )}

          {!isLive && rewardData.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              ℹ️ Reward chart showing estimated data — real training history not available from AI server yet.
            </motion.div>
          )}

          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: 'Last Action',
                value: rlAction ? rlAction.toUpperCase() : '—',
                icon: <Activity className="w-4 h-4" />,
                color: isBuy ? 'text-green-600' : isSell ? 'text-red-500' : 'text-gray-500',
              },
              {
                label: 'Confidence',
                value: lastForecast ? `${lastForecast.confidence.toFixed(1)}%` : '—',
                icon: <Zap className="w-4 h-4" />,
                color: 'text-indigo-600',
              },
              {
                label: 'Expected Reward',
                value: lastForecast?.rlRecommendation?.expectedReward != null
                  ? lastForecast.rlRecommendation.expectedReward.toFixed(3)
                  : rewardData.length > 0
                  ? rewardData[rewardData.length - 1].reward.toFixed(3)
                  : '—',
                icon: <Brain className="w-4 h-4" />,
                color: 'text-teal-600',
              },
              {
                label: 'Risk-Adj Conf.',
                value: lastForecast?.rlRecommendation?.riskAdjustedConfidence != null
                  ? `${lastForecast.rlRecommendation.riskAdjustedConfidence.toFixed(1)}%`
                  : '—',
                icon: <Shield className="w-4 h-4" />,
                color: 'text-amber-600',
              },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280]">{s.label}</span>
                  <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">{s.icon}</div>
                </div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">DQN Reward Progression</h3>
            {rewardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-xs text-[#9CA3AF] gap-2">
                <Brain className="w-8 h-8 text-[#D1D5DB]" />
                <span>DQN reward history is not available.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={rewardData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dqnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="episode" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [v.toFixed(3), 'Reward']} />
                  <Area type="monotone" dataKey="reward" stroke="#0D9488" strokeWidth={2} fill="url(#dqnGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-3">DQN Architecture</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Learning Rate', value: '1e-4' },
                { label: 'Gamma', value: '0.99' },
                { label: 'Replay Buffer', value: '100K' },
                { label: 'Batch Size', value: '32' },
                { label: 'Target Update', value: '1000 steps' },
                { label: 'ε Decay', value: 'Linear' },
                { label: 'ε Min', value: '0.05' },
                { label: 'Network', value: 'Dueling DQN' },
              ].map((s) => (
                <div key={s.label} className="p-3 bg-[#F9FAFB] rounded-lg border border-[#F3F4F6] text-center">
                  <div className="text-[10px] text-[#9CA3AF]">{s.label}</div>
                  <div className="text-sm font-bold text-[#374151] mt-0.5 font-mono">{s.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}