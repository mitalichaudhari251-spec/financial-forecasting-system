'use client';

import { TrendingDown, Target, Award, CheckCircle, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  positive?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

function MetricCard({ title, value, subtitle, positive, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{title}</span>
        {icon && <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <span style={{ color }}>{icon}</span>
        </div>}
      </div>
      <div className={cn('text-xl font-bold', positive === undefined ? 'text-[#111827]' : positive ? 'text-green-600' : 'text-red-500')}>
        {value}
      </div>
      {subtitle && <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>}
    </div>
  );
}

export function RMSECard() {
  return <MetricCard title="RMSE" value="0.0421" subtitle="Root mean square error" icon={<Target className="w-3.5 h-3.5" />} color="#4F46E5" />;
}
export function MAECard() {
  return <MetricCard title="MAE" value="0.0318" subtitle="Mean absolute error" icon={<BarChart2 className="w-3.5 h-3.5" />} color="#0D9488" />;
}
export function SharpeRatioAnalyticsCard() {
  return <MetricCard title="Sharpe Ratio" value="1.87" positive={true} subtitle="Risk-adjusted return" icon={<Award className="w-3.5 h-3.5" />} color="#16A34A" />;
}
export function DrawdownCard() {
  return <MetricCard title="Max Drawdown" value="-14.2%" positive={false} subtitle="Peak-to-trough decline" icon={<TrendingDown className="w-3.5 h-3.5" />} color="#DC2626" />;
}
export function WinRateCard() {
  return <MetricCard title="Win Rate" value="58.3%" positive={true} subtitle="91 / 156 trades" icon={<CheckCircle className="w-3.5 h-3.5" />} color="#7C3AED" />;
}
