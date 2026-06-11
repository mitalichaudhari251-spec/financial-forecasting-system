'use client';

import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTimestamp } from '@/lib/formatting';
import { usePlatform } from '@/providers/PlatformProvider';

const ICON_MAP = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  info:    <TrendingUp className="w-4 h-4 text-indigo-500" />,
};

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Props { onClose: () => void; }

export default function NotificationDropdown({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { lastForecast, training } = usePlatform();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Real notifications from actual data
  const notifications: Notification[] = [];

  // 1. Last forecast notification — real data
  if (lastForecast) {
    const isLowConf = lastForecast.confidence < 70;
    notifications.push({
      id: `forecast-${lastForecast.id}`,
      type: isLowConf ? 'warning' : 'success',
      title: isLowConf ? 'Low Confidence Alert' : 'Forecast Completed',
      message: isLowConf
        ? `${lastForecast.asset} forecast confidence ${lastForecast.confidence.toFixed(1)}% — below 70% threshold`
        : `${lastForecast.asset} ${lastForecast.forecastHorizon ?? '7d'} forecast ready with ${lastForecast.confidence.toFixed(1)}% confidence`,
      timestamp: lastForecast.timestamp ?? new Date().toISOString(),
      read: readIds.has(`forecast-${lastForecast.id}`),
    });
  }

  // 2. Training status — real data from /training/status
  const train = training as {
    rl?: { mean_reward?: number; status?: string };
    cnn?: { val_accuracy?: number; status?: string };
  } | null;

  if (train?.rl?.status === 'ready' && train?.rl?.mean_reward) {
    notifications.push({
      id: 'training-rl',
      type: 'info',
      title: 'Training Complete',
      message: `PPO agent training finished. Mean Reward: ${train.rl.mean_reward.toFixed(2)}`,
      timestamp: new Date(Date.now() - 3_600_000).toISOString(),
      read: readIds.has('training-rl'),
    });
  }

  if (train?.cnn?.status === 'ready' && train?.cnn?.val_accuracy) {
    notifications.push({
      id: 'training-cnn',
      type: 'info',
      title: 'CNN Model Ready',
      message: `CNN ResNet-18 trained. Val Accuracy: ${(train.cnn.val_accuracy * 100).toFixed(1)}%`,
      timestamp: new Date(Date.now() - 7_200_000).toISOString(),
      read: readIds.has('training-cnn'),
    });
  }

  // 3. Agar koi notification nahi hai
  if (notifications.length === 0) {
    notifications.push({
      id: 'empty',
      type: 'info',
      title: 'No notifications yet',
      message: ' run Forecast to see notifications here',
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-10 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-dropdown z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#111827]">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-600 cursor-pointer hover:underline"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-0.5 rounded text-[#6B7280] hover:text-[#111827]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-[#F3F4F6] max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
            className={`flex gap-3 px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer transition-colors ${
              !n.read && n.id !== 'empty' ? 'bg-indigo-50/40' : ''
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {ICON_MAP[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold text-[#111827]">{n.title}</div>
                {!n.read && n.id !== 'empty' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{n.message}</div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-[#9CA3AF]">
                <Clock className="w-3 h-3" />
                {formatTimestamp(n.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[#F3F4F6]">
        <button className="w-full text-center text-xs text-indigo-600 hover:underline">
          View all notifications
        </button>
      </div>
    </motion.div>
  );
}