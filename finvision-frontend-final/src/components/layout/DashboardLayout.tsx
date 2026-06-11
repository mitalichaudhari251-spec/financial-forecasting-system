'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

interface Props {
  children: React.ReactNode;
}

function hasCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith('fv_token='));
}

export default function DashboardLayout({ children }: Props) {
  const { sidebarCollapsed } = useSettingsStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hasCookie()) {
      router.replace('/');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F5F7FB] z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L9 4L15 14H3Z" fill="white" opacity="0.9" />
                <path d="M6 14L9 9L12 14H6Z" fill="white" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#111827] tracking-tight">FinVision-RL</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar />
      <TopNavbar />
      <main className={cn('transition-all duration-300 pt-14', sidebarCollapsed ? 'ml-16' : 'ml-[240px]')}>
        {children}
      </main>
    </div>
  );
}
