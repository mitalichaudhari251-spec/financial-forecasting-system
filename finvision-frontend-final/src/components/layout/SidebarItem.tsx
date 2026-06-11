'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isChild?: boolean;
  badge?: string;
}

export default function SidebarItem({ label, href, icon, isActive, isChild, badge }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors',
        isChild && 'text-[13px]',
        isActive
          ? 'bg-indigo-50 text-indigo-700 font-medium'
          : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
          {badge}
        </span>
      )}
    </Link>
  );
}
