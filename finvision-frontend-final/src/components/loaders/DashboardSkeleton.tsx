'use client';

export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {/* Header */}
      <div className="h-14 bg-white border-b border-[#E5E7EB] -mx-6 -mt-6 mb-6 px-6 flex items-center gap-3">
        <div className="h-5 w-32 bg-gray-100 rounded" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-7 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-[#E5E7EB] h-56" />
        <div className="bg-white rounded-xl border border-[#E5E7EB] h-56" />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] h-48" />
        <div className="bg-white rounded-xl border border-[#E5E7EB] h-48" />
      </div>
    </div>
  );
}
