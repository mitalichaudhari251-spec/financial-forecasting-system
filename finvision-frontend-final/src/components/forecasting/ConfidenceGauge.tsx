'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  confidence?: number; // 0-100
  size?: number;
}

export default function ConfidenceGauge({ confidence = 84.2, size = 160 }: Props) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(confidence), 100);
    return () => clearTimeout(timer);
  }, [confidence]);

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (animated / 100) * circumference;

  const color = confidence >= 85 ? '#16A34A' : confidence >= 70 ? '#D97706' : '#DC2626';
  const label = confidence >= 85 ? 'High' : confidence >= 70 ? 'Medium' : 'Low';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          <path
            d={`M 10,${size / 2} A ${radius},${radius} 0 0,1 ${size - 10},${size / 2}`}
            fill="none" stroke="#F3F4F6" strokeWidth={12} strokeLinecap="round"
          />
          <path
            d={`M 10,${size / 2} A ${radius},${radius} 0 0,1 ${size - 10},${size / 2}`}
            fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl font-bold" style={{ color }}>{animated.toFixed(1)}%</span>
          <span className="text-xs font-medium text-[#6B7280]">Confidence</span>
        </div>
      </div>
      <div className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
        confidence >= 85 ? 'bg-green-50 text-green-700 border border-green-200' :
          confidence >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-red-50 text-red-700 border border-red-200'
      )}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        {label} Confidence
      </div>
    </div>
  );
}
