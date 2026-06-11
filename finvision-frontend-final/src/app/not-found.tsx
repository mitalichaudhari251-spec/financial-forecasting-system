import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F5F7FB]">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="text-8xl font-bold text-[#E5E7EB] select-none">404</div>
        <div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Page not found</h2>
          <p className="text-sm text-[#6B7280]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
