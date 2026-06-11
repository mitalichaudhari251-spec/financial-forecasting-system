'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animation-utils';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'green' | 'red' | 'amber' | 'indigo' | 'teal';
  delay?: number;
}

const COLOR_MAP = {
  default: { bg: 'bg-gray-50', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  red: { bg: 'bg-red-50', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
};

export default function AccuracyCard({ title, value, subtitle, trend, trendLabel, icon, color = 'default', delay = 0 }: Props) {
  const colors = COLOR_MAP[color];
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
            <span className={cn('text-sm', colors.text)}>{icon}</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-[#111827] tracking-tight">{value}</span>
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="flex items-center gap-2 flex-wrap">
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
                isPositive && 'bg-green-50 text-green-700',
                isNegative && 'bg-red-50 text-red-700',
                !isPositive && !isNegative && 'bg-gray-50 text-gray-600'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
          {trendLabel && <span className="text-xs text-[#9CA3AF]">{trendLabel}</span>}
          {subtitle && <span className="text-xs text-[#6B7280]">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
}
