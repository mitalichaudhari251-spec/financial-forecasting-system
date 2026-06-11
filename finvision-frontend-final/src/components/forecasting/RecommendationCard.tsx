'use client';

import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RLRecommendation } from '@/types/forecast';
import { cn } from '@/lib/utils';

interface Props {
  recommendation?: RLRecommendation;
  algorithm?: 'PPO' | 'DQN';
}

const DEFAULT_REC: RLRecommendation = {
  action: 'buy',
  expectedReward: 2.41,
  riskAdjustedConfidence: 81.3,
  rationale: 'PPO agent detected a strong bullish pattern with high momentum confirmation. Risk-adjusted position sizing recommended at 8–12% portfolio weight.',
  marketRiskFactors: ['Earnings season', 'Fed rate decision', 'VIX elevated'],
  patternCorrelation: 'Bullish Engulfing and Hammer patterns detected with 89% and 76% confidence.',
};

const ACTION_CONFIG = {
  buy:  { label: 'BUY',  icon: TrendingUp,  bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-600' },
  sell: { label: 'SELL', icon: TrendingDown, bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-600'   },
  hold: { label: 'HOLD', icon: Minus,        bg: 'bg-gray-50',  border: 'border-gray-200',  text: 'text-gray-600',  badge: 'bg-gray-500'  },
};

export default function RecommendationCard({ recommendation = DEFAULT_REC, algorithm = 'PPO' }: Props) {
  const cfg = ACTION_CONFIG[recommendation.action];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border p-5', cfg.bg, cfg.border)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-[#374151]">RL Agent Recommendation ({algorithm})</span>
        </div>
        <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white', cfg.badge)}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-2.5 rounded-lg bg-white/60 border border-white/80">
          <p className="text-[10px] text-[#9CA3AF] mb-0.5">Expected Reward</p>
          <p className="text-sm font-bold text-green-600">+{recommendation.expectedReward.toFixed(2)}%</p>
        </div>
        <div className="p-2.5 rounded-lg bg-white/60 border border-white/80">
          <p className="text-[10px] text-[#9CA3AF] mb-0.5">Risk-Adj. Confidence</p>
          <p className="text-sm font-bold text-indigo-600">{recommendation.riskAdjustedConfidence.toFixed(1)}%</p>
        </div>
      </div>

      <p className="text-xs text-[#374151] leading-relaxed mb-3">{recommendation.rationale}</p>

      {recommendation.marketRiskFactors && recommendation.marketRiskFactors.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#9CA3AF] mb-1.5">Market Risk Factors</p>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.marketRiskFactors.map((f) => (
              <span key={f} className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200">{f}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
