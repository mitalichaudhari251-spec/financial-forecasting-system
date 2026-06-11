'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Root error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F5F7FB]">
      <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Something went wrong</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
