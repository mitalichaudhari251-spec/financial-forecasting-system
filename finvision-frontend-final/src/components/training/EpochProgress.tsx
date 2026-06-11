'use client';

import { useEffect, useState } from 'react';

interface Props {
  currentEpoch: number;
  totalEpochs: number;
  currentStep?: number;
  totalSteps?: number;
  loss?: number;
  accuracy?: number;
}

export default function EpochProgress({ currentEpoch, totalEpochs, loss, accuracy }: Props) {
  const pct = totalEpochs > 0 ? (currentEpoch / totalEpochs) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-semibold text-[#111827]">Training Progress</span>
          <span className="ml-2 text-xs text-[#6B7280]">Epoch {currentEpoch}/{totalEpochs}</span>
        </div>
        <span className="text-sm font-bold text-indigo-600">{pct.toFixed(1)}%</span>
      </div>

      <div className="relative h-3 bg-[#F3F4F6] rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-[#9CA3AF]">Train Loss</div>
          <div className="text-sm font-bold text-[#111827]">{loss?.toFixed(4) ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs text-[#9CA3AF]">Val Accuracy</div>
          <div className="text-sm font-bold text-green-600">{accuracy ? `${(accuracy * 100).toFixed(1)}%` : '—'}</div>
        </div>
        <div>
          <div className="text-xs text-[#9CA3AF]">ETA</div>
          <div className="text-sm font-bold text-[#374151]">~12 min</div>
        </div>
      </div>
    </div>
  );
}
