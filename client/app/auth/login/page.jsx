'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'motion/react';
import { cn } from '@/shared/lib/cn';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        rememberMe: rememberMe ? 'on' : '',
      });

      if (result?.error) {
        const knownErrors = { CredentialsSignin: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
        setError(knownErrors[result.error] || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      } else if (result?.ok) {
        setSuccess(true);
      }
    } catch {
      setError('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(async () => {
        router.refresh();
        await router.push('/profile');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xs"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="text-lg font-semibold tracking-widest text-white uppercase">Taurus</span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-white">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-neutral-500">ยินดีต้อนรับกลับมา</p>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-rose-400"
          >
            {error}
          </motion.p>
        )}

        {/* Success */}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-emerald-400"
          >
            เข้าสู่ระบบสำเร็จ กำลังเปลี่ยนหน้า...
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-neutral-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@example.com"
              className="w-full border-b border-neutral-700 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-neutral-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-b border-neutral-700 bg-transparent py-2.5 pr-8 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-neutral-500 transition hover:text-neutral-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer rounded-sm border-neutral-600 bg-transparent accent-white focus:ring-0"
            />
            Remember me
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className={cn(
              'mt-2 w-full rounded-none bg-white py-3 text-sm font-medium text-neutral-950 transition-opacity',
              'hover:opacity-90 active:opacity-80',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M2.25 12S6 5.25 12 5.25 21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M3 3l18 18" />
      <path d="M10.584 5.36A10.71 10.71 0 0 1 12 5.25C18 5.25 21.75 12 21.75 12c-.474.82-1.022 1.6-1.64 2.324M7.5 7.5C5.63 8.83 4.12 10.62 3 12c0 0 3.75 6.75 9.75 6.75 1.02 0 1.976-.16 2.865-.45M9.75 12a2.25 2.25 0 0 0 3.232 2.026" />
    </svg>
  );
}
