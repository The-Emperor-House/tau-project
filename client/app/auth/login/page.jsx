'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

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
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
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
      const t = setTimeout(() => { router.refresh(); router.push('/dashboard/furniture'); }, 800);
      return () => clearTimeout(t);
    }
  }, [success, router]);

  return (
    <div className="min-h-screen flex bg-[#0d0d0d]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col items-center justify-center p-16"
        style={{ background: 'linear-gradient(135deg, #1a1408 0%, #0d0d0d 60%, #1a1206 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cc8f2a 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-md text-center">
          <div className="flex justify-center mb-10">
            <Image src="/logo/LOGO NEW TAURUS WHITE.png" alt="Taurus" width={120} height={120} className="opacity-90" />
          </div>
          <h1 className="text-4xl font-black tracking-[0.15em] text-white uppercase mb-4">Taurus</h1>
          <div className="w-12 h-px bg-[#cc8f2a] mx-auto mb-4" />
          <p className="text-[#cc8f2a] text-sm tracking-[0.2em] uppercase font-medium mb-6">We Renew</p>
          <p className="text-neutral-500 text-sm leading-relaxed">
            ระบบจัดการข้อมูลภายใน<br />สำหรับทีมงาน Taurus
          </p>
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-px ${i === 1 ? 'w-8 bg-[#cc8f2a]' : 'w-4 bg-neutral-700'}`} />
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image src="/logo/LOGO NEW TAURUS WHITE.png" alt="Taurus" width={64} height={64} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">เข้าสู่ระบบ</h2>
            <p className="text-neutral-500 text-sm">ยินดีต้อนรับกลับมา</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertIcon />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckIcon />
              เข้าสู่ระบบสำเร็จ กำลังเข้าสู่ระบบ...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 tracking-wider uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 outline-none focus:border-[#cc8f2a]/60 focus:ring-1 focus:ring-[#cc8f2a]/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 outline-none focus:border-[#cc8f2a]/60 focus:ring-1 focus:ring-[#cc8f2a]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRememberMe((r) => !r)}
                  className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${rememberMe ? 'bg-[#cc8f2a] border-[#cc8f2a]' : 'border-neutral-700 bg-transparent'}`}
                >
                  {rememberMe && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-neutral-400">จดจำฉัน</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #cc8f2a, #b57b14)', color: '#000' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M2.25 12S6 5.25 12 5.25 21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" /><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
}
function EyeOffIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M3 3l18 18M10.584 5.36A10.71 10.71 0 0 1 12 5.25C18 5.25 21.75 12 21.75 12c-.474.82-1.022 1.6-1.64 2.324M7.5 7.5C5.63 8.83 4.12 10.62 3 12c0 0 3.75 6.75 9.75 6.75 1.02 0 1.976-.16 2.865-.45M9.75 12a2.25 2.25 0 0 0 3.232 2.026" /></svg>;
}
function AlertIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>;
}
function CheckIcon() {
  return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
}
