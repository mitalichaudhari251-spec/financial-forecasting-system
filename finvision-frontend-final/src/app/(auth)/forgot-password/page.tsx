'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { fadeInUp } from '@/lib/animation-utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-2">Check your email</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Reset password</h2>
        <p className="text-sm text-[#6B7280] mt-1">We&apos;ll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="researcher@finvision.ai"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {isLoading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/login" className="text-xs text-indigo-600 flex items-center justify-center gap-1 hover:underline">
          <ArrowLeft className="w-3 h-3" /> Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}
