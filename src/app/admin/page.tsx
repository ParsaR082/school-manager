import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-responsive fade-in">
        {/* Welcome Section */}
        <div className="card p-responsive">
          <h1 className="text-responsive-2xl font-bold text-gray-900 mb-3 persian-text">
            خوش آمدید به پنل مدیریت
          </h1>
          <p className="text-responsive-base text-gray-600 persian-text leading-relaxed">
            از این پنل می‌توانید تمام اطلاعات مدرسه را مدیریت کنید و گزارش‌های مفصل دریافت نمایید
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-responsive">
          <div className="card card-hover p-responsive">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="mr-4 min-w-0">
                <p className="text-responsive-sm font-medium text-gray-600 persian-text truncate">کل کلاس‌ها</p>
                <p className="text-responsive-xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="card card-hover p-responsive">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="mr-4 min-w-0">
                <p className="text-responsive-sm font-medium text-gray-600 persian-text truncate">کل دروس</p>
                <p className="text-responsive-xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="card card-hover p-responsive">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="mr-4 min-w-0">
                <p className="text-responsive-sm font-medium text-gray-600 persian-text truncate">کل دانش‌آموزان</p>
                <p className="text-responsive-xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="card card-hover p-responsive">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-100 to-orange-200 text-orange-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="mr-4 min-w-0">
                <p className="text-responsive-sm font-medium text-gray-600 persian-text truncate">کل والدین</p>
                <p className="text-responsive-xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-responsive slide-in">
          <h2 className="text-responsive-lg font-semibold text-gray-900 mb-responsive persian-text">
            عملیات سریع
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-responsive">
            <a
              href="/admin/classes"
              className="btn btn-outline group mobile-full-width"
            >
              <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg text-blue-600 ml-3 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-responsive-sm font-medium text-gray-900 persian-text">
                افزودن کلاس جدید
              </span>
            </a>

            <a
              href="/admin/subjects"
              className="btn btn-outline group mobile-full-width"
            >
              <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg text-green-600 ml-3 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-responsive-sm font-medium text-gray-900 persian-text">
                افزودن درس جدید
              </span>
            </a>

            <a
              href="/admin/students"
              className="btn btn-outline group mobile-full-width"
            >
              <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg text-purple-600 ml-3 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-responsive-sm font-medium text-gray-900 persian-text">
                افزودن دانش‌آموز جدید
              </span>
            </a>

            <a
              href="/admin/grades"
              className="btn btn-outline group mobile-full-width"
            >
              <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg text-orange-600 ml-3 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-responsive-sm font-medium text-gray-900 persian-text">
                ثبت نمره جدید
              </span>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-responsive slide-in">
          <h2 className="text-responsive-lg font-semibold text-gray-900 mb-responsive persian-text">
            فعالیت‌های اخیر
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600 ml-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-responsive-sm font-medium text-gray-900 persian-text">
                  سیستم آماده استفاده است
                </p>
                <p className="text-responsive-xs text-gray-500 persian-text">
                  برای شروع، از منوی کناری استفاده کنید
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}