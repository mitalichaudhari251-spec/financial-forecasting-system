'use client';

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="bg-gray-50 rounded-lg skeleton" style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden animate-pulse">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-100 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-3.5 border-b border-[#F3F4F6] flex gap-6">
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-3 bg-gray-100 rounded flex-1" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 animate-pulse">
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
        <div className="h-4 w-28 bg-gray-100 rounded" />
        <div className="bg-gray-50 rounded-lg skeleton h-64" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
        <div className="h-4 w-36 bg-gray-100 rounded" />
        <div className="h-28 w-28 mx-auto bg-gray-100 rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChartSkeleton;
