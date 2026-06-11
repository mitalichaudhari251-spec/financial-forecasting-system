'use client';

export default function RootLoading() {
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
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500"
              style={{
                animation: `bounce 0.8s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
