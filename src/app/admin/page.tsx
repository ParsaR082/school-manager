'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface DashboardStats {
  classes: number;
  subjects: number;
  students: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    classes: 0,
    subjects: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8 fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-3 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              سامانه فعال و متصل
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight persian-text mb-2">
              سامانه جامع مدیریت هوشمند مدرسه
            </h1>
            <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed persian-text">
              مدیریت و نظارت بر کلاس‌ها، دروس، دانش‌آموزان و کارنامه نمرات ماهانه با بالاترین دقت و سهولت
            </p>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute left-[-40px] bottom-[-40px] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute left-20 top-[-20px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Classes Stat */}
          <Link href="/admin/classes" className="group">
            <div className="app-card app-card-interactive p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500 persian-text">کل کلاس‌ها</span>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border border-blue-100/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    stats.classes
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1 persian-text flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                  <span>مشاهده و تنظیم کلاس‌ها</span>
                  <span className="text-sm">&larr;</span>
                </p>
              </div>
            </div>
          </Link>

          {/* Subjects Stat */}
          <Link href="/admin/subjects" className="group">
            <div className="app-card app-card-interactive p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500 persian-text">کل دروس</span>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border border-emerald-100/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    stats.subjects
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1 persian-text flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                  <span>مدیریت دروس و تخصیص به پایه</span>
                  <span className="text-sm">&larr;</span>
                </p>
              </div>
            </div>
          </Link>

          {/* Students Stat */}
          <Link href="/admin/students" className="group">
            <div className="app-card app-card-interactive p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500 persian-text">دانش‌آموزان ثبت‌نامی</span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border border-indigo-100/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    stats.students
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1 persian-text flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                  <span>مشاهده پرونده دانش‌آموزان</span>
                  <span className="text-sm">&larr;</span>
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 persian-text">
              دسترسی و عملیات سریع
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/grades"
              className="app-card app-card-interactive p-4.5 flex items-center gap-3.5 group bg-white"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 persian-text group-hover:text-blue-600 transition-colors">
                  ثبت نمرات ماهانه
                </p>
                <p className="text-xs text-slate-500 persian-text truncate">ورود نمرات تکی یا گروهی</p>
              </div>
            </Link>

            <Link
              href="/admin/students"
              className="app-card app-card-interactive p-4.5 flex items-center gap-3.5 group bg-white"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 persian-text group-hover:text-indigo-600 transition-colors">
                  ثبت دانش‌آموز جدید
                </p>
                <p className="text-xs text-slate-500 persian-text truncate">تعریف مشخصات و والدین</p>
              </div>
            </Link>

            <Link
              href="/admin/classes"
              className="app-card app-card-interactive p-4.5 flex items-center gap-3.5 group bg-white"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 persian-text group-hover:text-amber-600 transition-colors">
                  تعریف کلاس جدید
                </p>
                <p className="text-xs text-slate-500 persian-text truncate">پایه‌ها و گروه‌های درسی</p>
              </div>
            </Link>

            <Link
              href="/admin/subjects"
              className="app-card app-card-interactive p-4.5 flex items-center gap-3.5 group bg-white"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 persian-text group-hover:text-emerald-600 transition-colors">
                  افزودن سرفصل درس
                </p>
                <p className="text-xs text-slate-500 persian-text truncate">تخصیص به کلاس‌ها</p>
              </div>
            </Link>
          </div>
        </div>

        {/* System & DB Status Overview */}
        <div className="app-card p-6 bg-white">
          <h3 className="text-base font-bold text-slate-900 persian-text mb-4">
            وضعیت زیرساخت و سامانه
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <p className="text-xs text-slate-500 persian-text">پایگاه داده</p>
                <p className="text-xs font-semibold text-slate-800">Aiven PostgreSQL (متصل و پایدار)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <div>
                <p className="text-xs text-slate-500 persian-text">درگاه والدین</p>
                <p className="text-xs font-semibold text-slate-800 persian-text">ورود با کد ملی و رمز عبور فعال</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <div>
                <p className="text-xs text-slate-500 persian-text">فرمت نمره‌دهی</p>
                <p className="text-xs font-semibold text-slate-800 persian-text">پشتیبانی از نمرات اعشاری و کسری</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}