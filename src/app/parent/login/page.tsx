'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for form validation
const loginSchema = z.object({
  student_national_id: z
    .string()
    .min(1, 'کد ملی دانش‌آموز الزامی است')
    .regex(/^\d{10}$/, 'کد ملی باید دقیقاً ۱۰ رقم باشد'),
  parent_phone: z
    .string()
    .min(1, 'شماره تلفن والدین الزامی است')
    .regex(/^09\d{9}$/, 'شماره تلفن باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
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

    const response = await fetch('/api/parent/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_national_id: data.student_national_id,
        parent_phone: data.parent_phone,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // ذخیره session در localStorage
      const sessionData = {
        parent_id: result.data.parent.id,
        parent_name: result.data.parent.name,
        parent_phone: result.data.parent.phone,
        student_id: result.data.student.id,
        student_name: result.data.student.name,
        student_national_id: result.data.student.national_id,
        class_id: result.data.student.class_id,
        login_time: new Date().toISOString(),
        access_token: 'parent-session-token'
      };
      
      localStorage.setItem('parent-session', JSON.stringify(sessionData));
      
      // هدایت به پنل والدین
      router.push('/parent/dashboard');
    } else {
      setError(result.error || 'خطایی در ورود رخ داد');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ورود والدین</h2>
            <p className="text-gray-600">برای ورود به سامانه، اطلاعات زیر را وارد کنید</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Student National ID */}
            <div>
              <label htmlFor="student_national_id" className="block text-sm font-medium text-gray-700 mb-2">
                کد ملی دانش‌آموز
              </label>
              <input
                {...register('student_national_id')}
                type="text"
                id="student_national_id"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 text-gray-900 placeholder-gray-500"
                placeholder="مثال: 1234567890"
                maxLength={10}
                dir="ltr"
              />
              {errors.student_national_id && (
                <p className="mt-1 text-sm text-red-600">{errors.student_national_id.message}</p>
              )}
            </div>

            {/* Parent Phone */}
            <div>
              <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2">
                شماره تلفن والدین
              </label>
              <input
                {...register('parent_phone')}
                type="text"
                id="parent_phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 text-gray-900 placeholder-gray-500"
                placeholder="مثال: 09123456789"
                maxLength={11}
                dir="ltr"
              />
              {errors.parent_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.parent_phone.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ورود...
                </div>
              ) : (
                'ورود به سامانه'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              در صورت بروز مشکل با مدیریت مدرسه تماس بگیرید
            </p>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">راهنمای ورود</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2 flex-shrink-0"></span>
              <span>کد ملی دانش‌آموز را وارد کنید (۱۰ رقم)</span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2 flex-shrink-0"></span>
              <span>شماره تلفن والدین را وارد کنید (۱۱ رقم، با ۰۹ شروع شود)</span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2 flex-shrink-0"></span>
              <span>سامانه اطلاعات را بررسی کرده و در صورت صحت، شما را وارد می‌کند</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}