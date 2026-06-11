'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/types/training';

const INITIAL_LOGS: LogEntry[] = [
  { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'info', message: 'Initializing FinVision-RL training pipeline v2.0', source: 'system' },
  { timestamp: new Date(Date.now() - 115000).toISOString(), level: 'info', message: 'Loading ResNet-18 backbone with pretrained ImageNet weights', source: 'cnn' },
  { timestamp: new Date(Date.now() - 110000).toISOString(), level: 'info', message: 'Dataset: AAPL 2020-2024 (1826 windows, 224×224px)', source: 'data' },
  { timestamp: new Date(Date.now() - 100000).toISOString(), level: 'info', message: 'Epoch [1/50] train_loss=2.4832 val_loss=2.7104 acc=0.3421', source: 'cnn' },
  { timestamp: new Date(Date.now() - 90000).toISOString(), level: 'info', message: 'Epoch [10/50] train_loss=1.2341 val_loss=1.4892 acc=0.5876', source: 'cnn' },
  { timestamp: new Date(Date.now() - 80000).toISOString(), level: 'info', message: 'Epoch [25/50] train_loss=0.6821 val_loss=0.7934 acc=0.7234', source: 'cnn' },
  { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'info', message: 'CNN training complete. Best val_acc=0.8312 at epoch 48', source: 'cnn' },
  { timestamp: new Date(Date.now() - 55000).toISOString(), level: 'info', message: 'Initializing PPO agent with CNN embedding dim=512', source: 'rl' },
  { timestamp: new Date(Date.now() - 45000).toISOString(), level: 'info', message: 'RL Episode 100/1000 | reward=-0.8432 | eps_len=252', source: 'rl' },
  { timestamp: new Date(Date.now() - 30000).toISOString(), level: 'info', message: 'RL Episode 500/1000 | reward=1.2341 | eps_len=243', source: 'rl' },
  { timestamp: new Date(Date.now() - 10000).toISOString(), level: 'warning', message: 'High volatility environment detected. Exploration rate adjusted.', source: 'rl' },
  { timestamp: new Date().toISOString(), level: 'info', message: 'RL Episode 847/1000 | reward=2.1823 | eps_len=251 | sharpe=1.87', source: 'rl' },
];

const LEVEL_STYLES = {
  info: 'text-[#6B7280]',
  warning: 'text-amber-600',
  error: 'text-red-500',
  debug: 'text-[#9CA3AF]',
};

const SOURCE_STYLES: Record<string, string> = {
  system: 'text-indigo-500',
  cnn: 'text-teal-500',
  rl: 'text-purple-500',
  data: 'text-green-500',
};

export default function TrainingLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const episode = Math.floor(Math.random() * 200 + 800);
      const reward = (Math.random() * 1 + 1.5).toFixed(4);
      setLogs((prev) => [
        ...prev.slice(-99),
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `RL Episode ${episode}/1000 | reward=${reward} | sharpe=${(parseFloat(reward) * 0.92).toFixed(2)}`,
          source: 'rl',
        },
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-[#94A3B8]">Live Training Console</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
        <button onClick={() => setLogs([])} className="p-1 rounded text-[#475569] hover:text-[#94A3B8] transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-56 overflow-y-auto space-y-0.5 font-mono text-[11px] leading-relaxed">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2 group hover:bg-white/5 px-1 rounded">
            <span className="text-[#475569] flex-shrink-0">
              {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
            </span>
            {log.source && (
              <span className={cn('flex-shrink-0', SOURCE_STYLES[log.source] || 'text-[#94A3B8]')}>
                [{log.source.padEnd(6)}]
              </span>
            )}
            <span className={LEVEL_STYLES[log.level]}>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
