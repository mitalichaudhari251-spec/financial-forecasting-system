'use client';

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalCardProps {
  asset?: string;
  signal?: 'bullish' | 'bearish' | 'neutral';
  strength?: number;
  price?: number;
  change?: number;
  volume?: string;
}

const SIGNAL_CONFIG = {
  bullish: {
    icon: TrendingUp,
    label: 'Bullish Signal',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
  },
  bearish: {
    icon: TrendingDown,
    label: 'Bearish Signal',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  neutral: {
    icon: Minus,
    label: 'Neutral Signal',
    color: 'text-[#6B7280]',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600',
  },
};

const MOCK_SIGNALS = [
  { asset: 'AAPL', signal: 'bullish' as const, strength: 84, price: 189.42, change: 2.31, volume: '52.4M' },
  { asset: 'TSLA', signal: 'bearish' as const, strength: 71, price: 248.90, change: -3.12, volume: '89.1M' },
  { asset: 'NVDA', signal: 'bullish' as const, strength: 91, price: 874.15, change: 5.67, volume: '41.2M' },
  { asset: 'SPY',  signal: 'neutral' as const, strength: 52, price: 512.38, change: 0.14, volume: '78.9M' },
];

export default function SignalCard({ asset, signal, strength, price, change, volume }: SignalCardProps) {
  const signals = asset
    ? [{ asset, signal: signal ?? 'neutral', strength: strength ?? 50, price: price ?? 0, change: change ?? 0, volume: volume ?? '—' }]
    : MOCK_SIGNALS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111827]">Live Signals</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-[#9CA3AF]">Live</span>
        </div>
      </div>
      {signals.map((s) => {
        const cfg = SIGNAL_CONFIG[s.signal];
        const Icon = cfg.icon;
        return (
          <div
            key={s.asset}
            className={cn('flex items-center justify-between p-3 rounded-xl border', cfg.bg, cfg.border)}
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm border', cfg.border)}>
                <Icon className={cn('w-4 h-4', cfg.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#111827]">{s.asset}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold', cfg.badge)}>
                    {cfg.label}
                  </span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] mt-0.5">Strength: {s.strength}% · Vol {s.volume}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#111827]">${s.price.toFixed(2)}</div>
              <div className={cn('text-xs font-semibold', s.change >= 0 ? 'text-green-600' : 'text-red-500')}>
                {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-1.5 mt-2 px-1">
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <p className="text-[10px] text-[#9CA3AF] italic">Not financial advice. Research use only.</p>
      </div>
    </div>
  );
}
