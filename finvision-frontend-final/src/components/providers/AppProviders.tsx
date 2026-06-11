'use client';

import { usePathname } from 'next/navigation';
import { PlatformProvider } from '@/providers/PlatformProvider';

/** Routes that must not mount PlatformProvider (no live API polling). */
function shouldUsePlatform(pathname: string): boolean {
  if (pathname === '/') return false;
  if (pathname.startsWith('/login')) return false;
  if (pathname.startsWith('/register')) return false;
  if (pathname.startsWith('/forgot-password')) return false;
  return true;
}

/**
 * Wraps the app with PlatformProvider on dashboard/app routes.
 * Must live in root layout so hooks work in page components that render
 * DashboardLayout as a child (hooks run in the page, not inside layout children).
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';

  if (!shouldUsePlatform(pathname)) {
    return <>{children}</>;
  }

  return <PlatformProvider>{children}</PlatformProvider>;
}
