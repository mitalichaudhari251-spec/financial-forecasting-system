'use client';

import { Gauge, Thermometer, Zap, HardDrive, Cpu } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function GPUUsageMonitor() {
  const { train } = useRealtimeMetrics();

  const gpu = (train as any)?.gpu;

  const metrics = [
    { label: 'CPU Utilization', value: gpu?.utilization ?? 0, unit: '%', max: 100, icon: Gauge, color: '#4F46E5' },
    { label: 'Heap Memory', value: gpu?.memoryUsed ?? 0, unit: '%', max: 100, icon: HardDrive, color: '#0D9488' },
    { label: 'Temperature (est.)', value: gpu?.temperature ?? 0, unit: '°C', max: 90, icon: Thermometer, color: '#D97706' },
  ];

  const isOnline = gpu !== undefined;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#111827]">System Monitor</h3>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
            {isOnline ? (gpu?.available ? (gpu.name || 'GPU Mode') : 'CPU Mode') : 'Backend Offline'}
          </span>
        </div>
      </div>

      {!isOnline ? (
        <div className="text-center py-6 text-xs text-[#9CA3AF]">
          <Cpu className="w-8 h-8 mx-auto mb-2 text-[#D1D5DB]" />
           System Metrics is loading from backened
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                  <span className="text-xs text-[#6B7280]">{m.label}</span>
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  {m.value.toFixed(0)}{m.unit}
                </span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}