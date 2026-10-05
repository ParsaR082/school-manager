'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  student_national_id: z.string()
    .min(10, 'کد ملی باید ۱۰ رقم باشد')
    .max(10, 'کد ملی باید ۱۰ رقم باشد')
    .regex(/^\d+$/, 'کد ملی باید فقط شامل عدد باشد'),
  password: z.string()
    .min(6, 'رمز عبور باید ۶ رقم باشد')
    .max(6, 'رمز عبور باید ۶ رقم باشد')
    .regex(/^\d+$/, 'رمز عبور باید فقط شامل عدد باشد'),
});

interface LoginFormData {
  student_national_id: string;
  password: string;
}

export default function ParentLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Prevent access to admin routes from parent portal
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      router.replace('/parent/login');
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const nationalId = watch('student_national_id');

  // Convenience helper: auto-fill password with last 6 digits of national_id if valid
  const handleAutoFillPassword = () => {
    if (nationalId && nationalId.length === 10) {
      setValue('password', nationalId.slice(-6));
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parent/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_national_id: data.student_national_id,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const sessionData = {
          parent_id: result.data.parent.id,
          parent_name: result.data.parent.name,
          student_id: result.data.student.id,
          student_name: result.data.student.name,
          student_national_id: result.data.student.national_id,
          class_id: result.data.student.class_id,
          login_time: new Date().toISOString(),
          access_token: 'parent-session-token',
        };

        localStorage.setItem('parent-session', JSON.stringify(sessionData));
        router.push('/parent/dashboard');
      } else {
        setError(result.error || 'خطایی در ورود به سیستم رخ داد');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      <div className="max-w-md w-full space-y-6">
        {/* Portal Gateway Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 text-white shadow-xs">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 persian-text">
              سامانه اولیا و دانش‌آموزان
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 persian-text mt-1.5">
              مشاهده وضعیت تحصیلی و کارنامه نمرات ماهانه
            </p>
          </div>

          {/* Error Notice */}
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="student_national_id" className="form-label">
                کد ملی ۱۰ رقمی دانش‌آموز
              </label>
              <input
                {...register('student_national_id')}
                type="text"
                id="student_national_id"
                className="form-input font-mono text-left tracking-wider"
                placeholder="1234567890"
                maxLength={10}
                dir="ltr"
                autoFocus
              />
              {errors.student_national_id && (
                <p className="form-error persian-text">{errors.student_national_id.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="form-label mb-0">
                  رمز عبور (۶ رقم آخر کد ملی)
                </label>
                {nationalId && nationalId.length === 10 && (
                  <button
                    type="button"
                    onClick={handleAutoFillPassword}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium persian-text"
                  >
                    درج خودکار ۶ رقم آخر
                  </button>
                )}
              </div>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="form-input font-mono text-left tracking-wider"
                placeholder="******"
                maxLength={6}
                dir="ltr"
              />
              {errors.password && (
                <p className="form-error persian-text">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary btn-lg shadow-xs mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>در حال بررسی و ورود...</span>
                </div>
              ) : (
                'ورود به کارنامه دانش‌آموز'
              )}
            </button>
          </form>

          {/* Helpful Tips Card */}
          <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1.5 persian-text">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>راهنمای ورود والدین:</span>
            </div>
            <p className="text-slate-500 leading-relaxed pr-6">
              نام کاربری، <strong>کد ملی کامل (۱۰ رقم)</strong> دانش‌آموز و رمز عبور پیش‌فرض، <strong>۶ رقم آخر کد ملی</strong> او می‌باشد.
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