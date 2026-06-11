export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* Left: branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#EEF2FF] via-[#E0E7FF] to-[#F8FAFC] p-12 flex-col justify-between relative overflow-hidden border-r border-[#E5E7EB]">

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              `radial-gradient(circle at 1px 1px, #6366F1 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">

            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#E5E7EB] flex items-center justify-center">

              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 17L11 5L18 17H4Z" fill="#5B5FEF" opacity="0.85" />
                <path d="M7.5 17L11 11L14.5 17H7.5Z" fill="#7C3AED" />
              </svg>
            </div>

            <div>
              <div className="text-[#111827] font-bold text-lg leading-none">
                FinVision-RL
              </div>

              <div className="text-[#5B5FEF] text-xs font-medium tracking-widest uppercase">
                Research Platform
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-[#111827] leading-tight mb-4">

            AI-Powered Financial
            <br />
            Forecasting Platform
          </h1>

          {/* Description */}
          <p className="text-[#6B7280] text-sm leading-relaxed max-w-sm">

            Combining CNN-based visual market pattern recognition with
            Reinforcement Learning agents to deliver institutional-grade
            market intelligence.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 space-y-4">

          {[
            {
              label: 'Forecast Accuracy',
              value: '76.3%',
              color: 'text-green-500'
            },
            {
              label: 'Sharpe Ratio (CNN+RL)',
              value: '1.87',
              color: 'text-[#5B5FEF]'
            },
            {
              label: 'Directional Accuracy',
              value: '71.4%',
              color: 'text-teal-500'
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/70 backdrop-blur border border-white shadow-sm"
            >

              <span className="text-[#6B7280] text-sm">
                {stat.label}
              </span>

              <span className={`font-bold text-sm ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}

          <p className="text-[#9CA3AF] text-xs italic pt-2">
            For research and informational purposes only. Not financial advice.
          </p>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8FAFC]">

        {children}
      </div>
    </div>
  );
}