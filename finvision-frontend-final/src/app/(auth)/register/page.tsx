'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/lib/validators';
import { fadeInUp } from '@/lib/animation-utils';

function setAuthCookie() {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `fv_token=demo-token; expires=${expires}; path=/`;
}

const ROLES = [
  { value: 'analyst', label: 'Financial Analyst' },
  { value: 'quant', label: 'Quantitative Researcher' },
  { value: 'trader', label: 'Trader' },
  { value: 'ml_engineer', label: 'ML Engineer' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'analyst' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
  setIsLoading(true);

  await new Promise((r) => setTimeout(r, 1200));

  setAuthCookie();

  localStorage.setItem(
    'fv_user',
    JSON.stringify({
      name: data.name,
      role: data.role,
      email: data.email,
    })
  );

  router.push('/dashboard');
};

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Request Access</h2>
        <p className="text-sm text-[#6B7280] mt-1">Create your researcher account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', error: errors.name },
          { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email', error: errors.email },
          { id: 'organization', label: 'Organization (optional)', type: 'text', placeholder: 'Enter your organization', error: undefined },
        ].map((f) => (
          <div key={f.id}>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
            <input
              type={f.type}
              {...register(f.id as keyof RegisterFormValues)}
              placeholder={f.placeholder}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
            {f.error && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {f.error.message}
              </p>
            )}
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Role</label>
          <select
            {...register('role')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          >
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Password</label>
          <input
            type="password"
            {...register('password')}
            placeholder="Min. 8 characters"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#6B7280]">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
