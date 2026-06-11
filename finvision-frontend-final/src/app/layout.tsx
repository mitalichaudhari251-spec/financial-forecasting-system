import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AppProviders from '@/components/providers/AppProviders';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FinVision-RL | AI Financial Forecasting Platform',
    template: '%s | FinVision-RL',
  },
  description: 'Institutional-grade AI-powered financial forecasting platform combining CNN pattern recognition with Reinforcement Learning agents.',
  keywords: ['financial forecasting', 'reinforcement learning', 'CNN', 'market intelligence'],
  authors: [{ name: 'FinVision Research' }],
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* This script runs BEFORE React hydrates — clears any stale auth cookie */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // App version — bump this to force logout on all users
            var APP_VERSION = 'v4';
            var storedVersion = localStorage.getItem('fv_app_version');
            if (storedVersion !== APP_VERSION) {
              // Clear old cookie
              document.cookie = 'fv_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              localStorage.setItem('fv_app_version', APP_VERSION);
            }
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-[#F5F7FB] text-[#111827] antialiased">
        <AppProviders>{children}</AppProviders>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#111827',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
            error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
