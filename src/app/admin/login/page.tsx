'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loginUser, verifyAuth, isAuthenticated } from '@/lib/auth-client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (isAuthenticated()) {
          const verifyResult = await verifyAuth();
          if (verifyResult.authenticated) {
            if (typeof window !== 'undefined') {
              window.location.replace('/admin');
            }
            return;
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        setSuccess('ورود موفقیت‌آمیز بود! در حال انتقال به پنل مدیریت...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.replace('/admin');
          }
        }, 800);
      } else {
        setError(result.error || 'نام کاربری یا رمز عبور اشتباه است');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-600 persian-text">در حال بررسی احراز هویت...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-6 text-slate-800">
      <div className="max-w-md w-full space-y-6">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 text-white shadow-xs">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 persian-text">
              ورود به پنل مدیریت
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 persian-text mt-1.5">
              مدیریت کلاس‌ها، دروس، نمرات و دانش‌آموزان
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2.5">
              <svg className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-medium text-rose-800 persian-text leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-xs font-medium text-emerald-800 persian-text leading-relaxed">
                {success}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                نام کاربری یا ایمیل
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Samira1364"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary btn-lg shadow-xs mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>در حال اعتبارسنجی...</span>
                </div>
              ) : (
                'ورود به پنل مدیریت'
              )}
            </button>
          </form>

          {/* Preset hint */}
          <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1.5 persian-text">
            <p className="text-slate-500 leading-relaxed">
              اطلاعات ورود پیش‌فرض مدیر: نام کاربری: <code className="font-mono bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-800 font-semibold">Samira1364</code> | رمز عبور: <code className="font-mono bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-800 font-semibold">admin123</code>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors inline-flex items-center gap-1.5 persian-text"
          >
            <span>&larr;</span>
            <span>بازگشت به صفحه اصلی پورتال</span>
          </Link>
        </div>
      </div>
    </div>
  );
}