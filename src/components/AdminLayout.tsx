'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminUser {
  email: string;
  full_name: string;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🏗️ AdminLayout useEffect triggered for path:', pathname);
    
    const getUser = async () => {
      try {
        console.log('🔍 AdminLayout: Getting user...');
        const { data: { user } } = await supabase.auth.getUser();
        
        console.log('🔍 AdminLayout: User data:', user);
        
        if (user) {
          console.log('✅ AdminLayout: Valid user found');
          setAdminUser({
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email || 'کاربر سیستم'
          });
        } else {
          console.log('❌ AdminLayout: No user found');
        }
      } catch (error) {
        console.error('❌ AdminLayout: Error getting user:', error);
      } finally {
        console.log('🏁 AdminLayout: Setting loading to false');
        setLoading(false);
      }
    };

    getUser();
  }, []); // Only run once on mount, not on pathname changes

  const handleLogout = async () => {
    try {
      console.log('🚪 AdminLayout: Logging out...');
      await supabase.auth.signOut();
      console.log('✅ AdminLayout: Signed out, redirecting to login');
      router.push('/admin/login');
    } catch (error) {
      console.error('❌ AdminLayout: Error signing out:', error);
    }
  };

  console.log('🏗️ AdminLayout render - loading:', loading, 'adminUser:', adminUser);

  if (loading) {
    console.log('⏳ AdminLayout: Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 persian-text">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated or not admin
  if (!adminUser) {
    console.log('❌ AdminLayout: No admin user found, redirecting to login');
    router.push('/admin/login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 persian-text">در حال انتقال به صفحه ورود...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: 'داشبورد',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
    },
    {
      name: 'کلاس‌ها',
      href: '/admin/classes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      name: 'دروس',
      href: '/admin/subjects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'دانش‌آموزان',
      href: '/admin/students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: 'نمرات',
      href: '/admin/grades',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 persian-text">پنل مدیریت</h1>
          <p className="text-sm text-gray-600 persian-text">سیستم مدیریت مدرسه</p>
          
          {/* Admin User Info */}
          {adminUser && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {adminUser.full_name.charAt(0)}
                </div>
                <div className="mr-3 min-w-0">
                  <p className="text-sm font-medium text-blue-900 persian-text truncate">
                    {adminUser.full_name}
                  </p>
                  <p className="text-xs text-blue-600 truncate" dir="ltr">
                    {adminUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 persian-text ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="ml-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 space-y-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center text-sm text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200 persian-text py-2 px-3 rounded-lg"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            خروج از سیستم
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 persian-text py-2 px-3 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 persian-text">
              {navigation.find(item => item.href === pathname)?.name || 'داشبورد'}
            </h2>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;