'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROUTES } from '@/config/routes';

interface Props { onClose: () => void; }

const MENU_ITEMS = [
  { label: 'Profile', icon: User, href: ROUTES.SETTINGS.PROFILE },
  { label: 'Preferences', icon: Settings, href: ROUTES.SETTINGS.PREFERENCES },
  { label: 'Notifications', icon: Shield, href: ROUTES.SETTINGS.NOTIFICATIONS },
  { label: 'Help & Docs', icon: HelpCircle, href: '#' },
];

function clearAuthCookie() {
  // Expire the cookie immediately
  document.cookie = 'fv_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
export default function ProfileMenu({ onClose }: Props) {
  const [userName, setUserName] = useState('Quant Researcher');
  const [userEmail, setUserEmail] = useState('researcher@finvision.ai');

  useEffect(() => {
    const stored = localStorage.getItem('fv_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserName(parsed.name || 'Quant Researcher');
        setUserEmail(parsed.email || 'researcher@finvision.ai');
      } catch {}
    }
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSignOut = () => {
    clearAuthCookie();
    onClose();
    router.push('/');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-10 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-dropdown z-50"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
  <span className="text-sm font-semibold text-indigo-700">
    {userName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
  </span>
</div>
<div>
  <div className="text-sm font-semibold text-[#111827]">{userName}</div>
  <div className="text-xs text-[#6B7280]">{userEmail}</div>
</div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
          >
            <item.icon className="w-4 h-4 text-[#9CA3AF]" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-[#E5E7EB] py-1">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </motion.div>
  );
}
