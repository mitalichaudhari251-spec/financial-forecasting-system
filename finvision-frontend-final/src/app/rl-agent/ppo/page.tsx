'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Brain, Zap, Shield } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function PPOPage() {
  const { lastForecast, aiOnline } = useRealtimeMetrics();
  const [rewardData, setRewardData] = useState<{ episode: number; reward: number }[]>([]);
  const [stats, setStats] = useState<{ bestEpisode: number; avgLast100: number; sharpeRatio: number } | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    api.get('/training/reward-history')
      .then((json: any) => {
        if (json?.data) {
          const episodes = json.data.episodes ?? [];
          setRewardData(episodes.map((e: any) => ({ episode: e.episode, reward: e.ppo })));
          setStats(json.data.stats ?? null);
          setIsLive(json.data.isLive ?? false);
        }
      })
      .catch(() => {});
  }, [aiOnline]);

  const rlAction = lastForecast?.rlRecommendation?.action ?? null;
  const isBuy = rlAction === 'buy';
  const isSell = rlAction === 'sell';

  const meanReward = stats?.avgLast100 != null
    ? stats.avgLast100.toFixed(2)
    : rewardData.length > 0
    ? rewardData[rewardData.length - 1].reward.toFixed(2)
    : '—';

  return (
    <DashboardLayout>
      <PageContainer title="PPO Agent" subtitle="Proximal Policy Optimization — real inference results from last forecast">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">

          {!aiOnline && (
            <motion.div variants={fadeInUp} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              AI server is offline. Run a forecast to see real PPO values.
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
                label: 'Model Status',
                value: aiOnline ? 'ready' : 'offline',
                icon: <Brain className="w-4 h-4" />,
                color: aiOnline ? 'text-teal-600' : 'text-gray-400',
              },
              {
                label: 'Confidence',
                value: lastForecast ? `${lastForecast.confidence.toFixed(1)}%` : '—',
                icon: <Zap className="w-4 h-4" />,
                color: 'text-amber-600',
              },
              {
                label: 'Mean Reward',
                value: meanReward,
                icon: <Shield className="w-4 h-4" />,
                color: 'text-purple-600',
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">PPO Reward Progression</h3>
              {stats && (
                <div className="flex gap-4 text-xs text-[#6B7280]">
                  <span>Best: <span className="text-green-600 font-semibold">+{stats.bestEpisode}</span></span>
                  <span>Avg(100): <span className="text-indigo-600 font-semibold">{stats.avgLast100}</span></span>
                  <span>Sharpe: <span className="text-teal-600 font-semibold">{stats.sharpeRatio}</span></span>
                </div>
              )}
            </div>
            {rewardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-xs text-[#9CA3AF] gap-2">
                <Brain className="w-8 h-8 text-[#D1D5DB]" />
                <span>Loading PPO reward history...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={rewardData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ppoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="episode" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [v.toFixed(3), 'Reward']} />
                  <Area type="monotone" dataKey="reward" stroke="#4F46E5" strokeWidth={2} fill="url(#ppoGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-3">PPO Hyperparameters</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Learning Rate', value: '3e-4' },
                { label: 'Gamma', value: '0.99' },
                { label: 'GAE Lambda', value: '0.95' },
                { label: 'Batch Size', value: '64' },
                { label: 'n_epochs', value: '10' },
                { label: 'n_steps', value: '2048' },
                { label: 'vf_coef', value: '0.5' },
                { label: 'ent_coef', value: '0.01' },
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