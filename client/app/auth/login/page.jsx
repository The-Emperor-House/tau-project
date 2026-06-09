'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'motion/react';
import { cn } from '@/shared/lib/cn';
import { BackgroundLines } from '@/shared/components/ui/background-lines';

/**
 * LoginPage — Tailwind + Framer Motion (Aceternity-style)
 * - No MUI imports
 * - Copy‑paste ready for Next.js App Router
 * - Uses BackgroundLines as animated background
 */

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

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
        setSuccessOpen(true);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successOpen) {
      const timer = setTimeout(async () => {
        router.refresh();
        await router.push('/profile');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successOpen, router]);

  return (
    <BackgroundLines className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="p-6 md:p-8">
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">เข้าสู่ระบบ</h1>
            <p className="mt-1 text-sm text-zinc-400">ยินดีต้อนรับกลับมา</p>
          </div>

          {error && (
            <AlertBar type="error" onClose={() => setError(null)}>
              {error}
            </AlertBar>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                className={inputClass()}
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={cn(inputClass(), 'pr-12')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-white/20 bg-zinc-900/60 text-amber-500 focus:ring-0"
                />
                Remember Me
              </label>
            </div>

            <ShimmerButton
              type="submit"
              disabled={loading}
              color="amber"
              className="mt-1 w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold"
            >
              {loading ? <Spinner className="h-5 w-5" /> : 'Login'}
            </ShimmerButton>
          </form>
        </GlassCard>
      </motion.div>

      {/* Success Modal */}
      <AnimatedModal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SuccessIcon className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">เข้าสู่ระบบสำเร็จ</h3>
          </div>
          <p className="text-sm text-zinc-300">กำลังเปลี่ยนเส้นทางไปยังแดชบอร์ด...</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-progress bg-amber-400" />
          </div>
        </div>
      </AnimatedModal>

      <style jsx global>{`
        @keyframes progress { 0% { transform: translateX(-100%);} 100% { transform: translateX(200%);} }
        .animate-progress { animation: progress 1.2s infinite linear; }
      `}</style>
    </BackgroundLines>
  );
}

/* ============================== */
/* ====== Reusable UI Bits ====== */
/* ============================== */
function AlertBar({ type = 'info', children, onClose }) {
  const styleByType = {
    error: 'bg-rose-500/10 border-rose-400/30 text-rose-200',
    success: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200',
    info: 'bg-sky-500/10 border-sky-400/30 text-sky-200',
    warning: 'bg-amber-500/10 border-amber-400/30 text-amber-200',
  };

  const iconByType = {
    error: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 13h-2v-2h2v2Zm0-4h-2V7h2v4Z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1.2 14.2L7.5 12.9l1.4-1.4 1.9 1.9 4.8-4.8 1.4 1.4-6.7 6.7Z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
      </svg>
    ),
  };

  const Icon = iconByType[type] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative flex items-start gap-3 rounded-xl border px-3 py-2',
        styleByType[type] || styleByType.info
      )}
      role="alert"
    >
      <div className="mt-0.5">{Icon}</div>
      <div className="text-sm">{children}</div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Close alert"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

function GlassCard({ className, children }) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl',
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
        initial={{ backgroundPosition: '0% 50%' }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundImage: 'linear-gradient(120deg, rgba(251,191,36,0.18), rgba(99,102,241,0.18), rgba(236,72,153,0.18))', backgroundSize: '200% 200%' }}
      />
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function inputClass() {
  return 'peer w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-zinc-900/80 placeholder:text-zinc-500';
}

function ShimmerButton({ children, className = '', disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn('group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:cursor-not-allowed disabled:opacity-70', className)}
    >
      <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] transition group-hover:translate-x-[120%]" />
      <span className="relative">{children}</span>
    </button>
  );
}

function Spinner({ className = '' }) {
  return (
    <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

function AnimatedModal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="relative z-10 w-[90%] max-w-sm rounded-2xl border border-white/10 bg-zinc-900/80 p-5 shadow-2xl backdrop-blur-xl"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ===== Icons ===== */
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M2.25 12S6 5.25 12 5.25 21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M3 3l18 18" />
      <path d="M10.584 5.36A10.71 10.71 0 0 1 12 5.25C18 5.25 21.75 12 21.75 12c-.474.82-1.022 1.6-1.64 2.324M7.5 7.5C5.63 8.83 4.12 10.62 3 12c0 0 3.75 6.75 9.75 6.75 1.02 0 1.976-.16 2.865-.45M9.75 12a2.25 2.25 0 0 0 3.232 2.026" />
    </svg>
  );
}

function SuccessIcon({ className = '' }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.03 7.22a.75.75 0 10-1.06-1.06L11 12.44l-1.97-1.97a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd" />
    </svg>
  );
}
