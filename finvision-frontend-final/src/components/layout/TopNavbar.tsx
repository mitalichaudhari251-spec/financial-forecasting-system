'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { Search, Bell, PanelLeftClose, PanelLeft, Wifi, WifiOff } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useTrainingStore } from '@/store/trainingStore';
import NotificationDropdown from './NotificationDropdown';
import ProfileMenu from './ProfileMenu';
import { cn } from '@/lib/utils';

export default function TopNavbar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useSettingsStore();
  const { activeRun } = useTrainingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState('Quant Researcher');
  const [userRole, setUserRole] = useState('analyst');
  const isModelRunning = activeRun?.status === 'running';
  useEffect(() => {
  const storedUser = localStorage.getItem('fv_user');

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);

      setUserName(parsed.name || 'Quant Researcher');
      setUserRole(parsed.role || 'analyst');
    } catch (err) {
      console.error(err);
    }
  }
}, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 gap-3 z-20 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-[240px]'
      )}
    >
      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
        title="Toggle sidebar"
      >
        {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search assets, forecasts, models…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#F5F7FB] border border-[#E5E7EB] rounded-lg placeholder-[#9CA3AF] text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Model status pill */}
      <div
        className={cn(
          'hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
          isModelRunning
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-gray-50 text-[#6B7280] border-[#E5E7EB]'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isModelRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
          )}
        />
        {isModelRunning ? (
          <span>Training: {activeRun?.name}</span>
        ) : (
          <span>Model Idle</span>
        )}
      </div>

      {/* WS Status */}
      <div className="hidden md:flex items-center gap-1 text-xs text-[#9CA3AF]" title="WebSocket">
        <Wifi className="w-3.5 h-3.5 text-green-500" />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          className="relative p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>
        {showNotifications && (
          <NotificationDropdown onClose={() => setShowNotifications(false)} />
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#F3F4F6] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
           <span className="text-xs font-semibold text-indigo-700">
  {userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()}
</span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-[#111827] leading-none">
  {userName}
</div>
            <div className="text-[10px] text-[#6B7280] leading-none mt-0.5">
  {userRole}
</div>
          </div>
        </button>
        {showProfile && (
          <ProfileMenu onClose={() => setShowProfile(false)} />
        )}
      </div>
    </header>
  );
}
