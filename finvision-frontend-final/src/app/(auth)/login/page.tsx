'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validators';
import { fadeInUp } from '@/lib/animation-utils';

function setAuthCookie() {
  // Set fv_token cookie for 7 days so middleware allows access
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `fv_token=demo-token; expires=${expires}; path=/`;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
  setIsLoading(true);

  await new Promise((r) => setTimeout(r, 1000));

  setAuthCookie();

  localStorage.setItem(
    'fv_user',
    JSON.stringify({
      name: data.email.split('@')[0],
      role: 'Financial Analyst',
      email: data.email,
    })
  );

  router.push('/dashboard');
};

  const handleDemo = () => {
  setAuthCookie();

  localStorage.setItem(
    'fv_user',
    JSON.stringify({
      name: 'Demo User',
      role: 'Quant Researcher',
      email: 'demo@finvision.ai',
    })
  );

  router.push('/dashboard');
};
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm"
    >
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Sign in</h2>
        <p className="text-sm text-[#6B7280] mt-1">Access your research workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
          <input
            type="email"
            {...register('email')}
            placeholder="researcher@finvision.ai"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('rememberMe')} className="rounded border-[#D1D5DB] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0" />
            <span className="text-xs text-[#6B7280]">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={handleDemo}
          className="w-full py-2.5 border border-[#E5E7EB] text-sm text-[#374151] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          Demo Mode (No Auth)
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#6B7280]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 font-medium hover:underline">Request access</Link>
      </p>

      <p className="mt-4 text-center text-[10px] text-[#9CA3AF] italic leading-relaxed">
        For research and informational purposes only. Not financial advice.
      </p>
    </motion.div>
  );
}
