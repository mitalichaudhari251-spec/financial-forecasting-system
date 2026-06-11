'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ForecastHorizon } from '@/types/forecast';

const TABS: { label: string; value: ForecastHorizon }[] = [
  { label: '1 Day', value: '1d' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
];

interface Props {
  selected: ForecastHorizon;
  onChange: (h: ForecastHorizon) => void;
}

export default function ForecastTabs({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-lg w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
            selected === tab.value
              ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]'
              : 'text-[#6B7280] hover:text-[#374151]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
