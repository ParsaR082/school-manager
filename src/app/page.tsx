import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
      <div className="max-w-6xl mx-auto px-responsive">
        <div className="text-center fade-in">
          {/* Logo/Title */}
          <div className="mb-12">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 shadow-lg">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-responsive-3xl font-bold text-gray-900 persian-text mb-4">
              سیستم مدیریت مدرسه
            </h1>
            <p className="text-responsive-lg text-gray-600 persian-text max-w-2xl mx-auto">
              مدیریت هوشمند نمرات و اطلاعات دانش‌آموزان با رابط کاربری مدرن و کاربردی
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Admin Panel */}
            <Link href="/admin/login">
              <div className="card card-hover p-responsive group cursor-pointer transform transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                    <svg
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-responsive-xl font-bold text-gray-900 persian-text mb-3">
                    ورود مدیریت
                  </h2>
                  <p className="text-responsive-base text-gray-600 persian-text text-center leading-relaxed">
                    مدیریت کامل کلاس‌ها، دروس، دانش‌آموزان و نمرات با امکانات پیشرفته
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">کلاس‌ها</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">دروس</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">دانش‌آموزان</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">نمرات</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Parent Panel */}
            <Link href="/parent/login">
              <div className="card card-hover p-responsive group cursor-pointer transform transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
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
                  <h2 className="text-responsive-xl font-bold text-gray-900 persian-text mb-3">
                    پنل والدین
                  </h2>
                  <p className="text-responsive-base text-gray-600 persian-text text-center leading-relaxed">
                    دسترسی آسان به نمرات و عملکرد تحصیلی فرزندان با گزارش‌های تفصیلی
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">نمرات</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">آمار</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">گزارش</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="slide-in">
            <h3 className="text-responsive-lg font-semibold text-gray-900 persian-text mb-8">
              ویژگی‌های کلیدی سیستم
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-responsive-base font-semibold text-gray-900 persian-text mb-2">مدیریت آسان نمرات</h4>
                <p className="text-responsive-sm text-gray-600 persian-text">ثبت و مدیریت نمرات با رابط کاربری ساده و کاربردی</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-12 w-12 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-responsive-base font-semibold text-gray-900 persian-text mb-2">گزارش‌گیری دقیق</h4>
                <p className="text-responsive-sm text-gray-600 persian-text">تولید گزارش‌های تفصیلی و آماری از عملکرد دانش‌آموزان</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-responsive-base font-semibold text-gray-900 persian-text mb-2">ارتباط مؤثر</h4>
                <p className="text-responsive-sm text-gray-600 persian-text">برقراری ارتباط مستقیم و مؤثر بین مدرسه و والدین</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-responsive-sm text-gray-500 persian-text">
              سیستم مدیریت مدرسه - طراحی شده برای بهبود فرآیند آموزش
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
