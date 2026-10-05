import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 block leading-tight">سامانه هوشمند مدیریت مدرسه</span>
              <span className="text-xs text-slate-500">پرتال جامع آموزشی و اداری</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              سال تحصیلی ۱۴۰۳-۱۴۰۴
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-4">
              <span>نسخه ۲.۰ • ارتباط یکپارچه مدرسه و خانواده</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              مدیریت مدرن و هوشمند آموزش
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              سامانه جامع ثبت نمرات، تحلیل عملکرد تحصیلی، مدیریت کلاس‌ها و ارتباط مستمر کادر مدرسه با اولیای گرامی دانش‌آموزان
            </p>
          </div>

          {/* Portal Gateway Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
            
            {/* Admin Portal Card */}
            <div className="app-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary-300 hover:shadow-card-hover transition-all duration-200">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                    دسترسی کادر مدرسه
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  ورود کادر اداری و معلمان
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  ثبت و ویرایش نمرات ماهانه، مدیریت پایه‌ها و کلاس‌ها، تعریف دروس و تخصیص آموزگاران، نظارت آماری و گزارش‌گیری یکپارچه
                </p>

                <div className="space-y-2 mb-8 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>ثبت گروهی نمرات در ماتریس ماهانه</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>مدیریت هوشمند پرونده و کد ملی دانش‌آموزان</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>داشبورد آماری و نمودارهای میانگین تحصیلی</span>
                  </div>
                </div>
              </div>

              <Link
                href="/admin/login"
                className="btn-primary w-full justify-center text-sm py-2.5 shadow-sm group-hover:bg-primary-700"
              >
                <span>ورود به پنل مدیریت</span>
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Parent Portal Card */}
            <div className="app-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 hover:shadow-card-hover transition-all duration-200">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    دسترسی اختصاصی اولیا
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  سامانه والدین و دانش‌آموزان
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  مشاهده برخط نمرات در کلیه ماه‌ها، بررسی ارزیابی‌های کیفی معلمان، چاپ کارنامه رسمی و آگاهی لحظه‌ای از وضعیت درسی
                </p>

                <div className="space-y-2 mb-8 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>مشاهده نمرات به تفکیک ماه‌های تحصیلی</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>چاپ و ذخیره کارنامه ماهانه با یک کلیک</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>ورود سریع و امن با کد ملی دانش‌آموز</span>
                  </div>
                </div>
              </div>

              <Link
                href="/parent/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all duration-150 shadow-sm"
              >
                <span>ورود به پرتال اولیا</span>
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

          </div>

          {/* Features / Assurance Section */}
          <div className="border-t border-slate-200/80 pt-12">
            <div className="text-center mb-8">
              <h3 className="text-base font-bold text-slate-800">امکانات و مزایای برجسته سامانه</h3>
              <p className="text-xs text-slate-500 mt-1">طراحی شده بر مبنای آخرین استانداردهای آموزشی و سهولت کاربری</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="app-card p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">دقت و شفافیت نمرات</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  پشتیبانی از انواع مقیاس‌های نمره‌دهی عددی، کسری و توصیفی با قابلیت نظارت فوری
                </p>
              </div>

              <div className="app-card p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">کاملاً واکنش‌گرا و سریع</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  طراحی سازگار با موبایل، تبلت و کامپیوتر بدون افت کیفیت یا به‌هم‌ریختگی چیدمان
                </p>
              </div>

              <div className="app-card p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">کارنامه استاندارد</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  قابلیت دریافت و پرینت کارنامه ماهانه و فصلی دانش‌آموز با فرمت شکیل و رسمی
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© سامانه جامع مدیریت هوشمند مدرسه • کلیه حقوق محفوظ است</p>
          <div className="flex items-center gap-4">
            <span>نسخه نهایی پایدار</span>
            <span>•</span>
            <span className="text-slate-400">پایگاه داده Aiven Cloud PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
