'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
  national_id: z.string()
    .min(10, 'کد ملی باید ۱۰ رقم باشد')
    .max(10, 'کد ملی باید ۱۰ رقم باشد')
    .regex(/^\d+$/, 'کد ملی باید فقط شامل اعداد باشد'),
  phone: z.string()
    .min(11, 'شماره تلفن باید ۱۱ رقم باشد')
    .max(11, 'شماره تلفن باید ۱۱ رقم باشد')
    .regex(/^09\d{9}$/, 'شماره تلفن باید با ۰۹ شروع شود'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ParentLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if parent exists with the provided credentials
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('national_id', data.national_id)
        .eq('phone', data.phone)
        .single();

      if (parentError || !parent) {
        setError('اطلاعات وارد شده صحیح نمی‌باشد. لطفاً دوباره تلاش کنید.');
        return;
      }

      // Store parent info in localStorage (in a real app, use proper session management)
      localStorage.setItem('parent_id', parent.id);
      localStorage.setItem('parent_name', parent.full_name);

      // Redirect to parent dashboard
      router.push('/parent/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('خطایی در ورود رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center py-responsive px-responsive">
      <div className="max-w-md w-full space-y-responsive fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-green-200 shadow-lg mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-responsive-2xl font-bold text-gray-900 persian-text mb-3">
            ورود والدین
          </h2>
          <p className="text-responsive-base text-gray-600 persian-text leading-relaxed">
            برای مشاهده نمرات و عملکرد فرزند خود وارد شوید
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-responsive">
          <form className="space-y-responsive" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 slide-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <p className="text-responsive-sm text-red-800 persian-text">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="national_id" className="form-label persian-text">
                کد ملی
              </label>
              <div className="mt-1">
                <input
                  {...register('national_id')}
                  type="text"
                  autoComplete="off"
                  className="form-input"
                  placeholder="کد ملی ۱۰ رقمی"
                  dir="ltr"
                />
              </div>
              {errors.national_id && (
                <p className="form-error persian-text">
                  {errors.national_id.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label persian-text">
                شماره تلفن همراه
              </label>
              <div className="mt-1">
                <input
                  {...register('phone')}
                  type="text"
                  autoComplete="tel"
                  className="form-input"
                  placeholder="09xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              {errors.phone && (
                <p className="form-error persian-text">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full mobile-full-width persian-text"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-3"></div>
                    در حال ورود...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    ورود
                  </div>
                )}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-responsive-sm text-gray-600 persian-text mb-4">
                در صورت فراموشی اطلاعات ورود، با مدرسه تماس بگیرید
              </p>
              <div className="flex items-center justify-center space-x-4 space-x-reverse">
                <div className="flex items-center text-responsive-xs text-gray-500">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="persian-text">ورود امن</span>
                </div>
                <div className="flex items-center text-responsive-xs text-gray-500">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="persian-text">محافظت از حریم خصوصی</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Admin Link */}
        <div className="text-center slide-in">
          <a
            href="/admin"
            className="inline-flex items-center text-responsive-sm text-blue-600 hover:text-blue-500 transition-colors duration-200 persian-text"
          >
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ورود مدیران
          </a>
        </div>
      </div>
    </div>
  );
}