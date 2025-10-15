'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParentHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to parent login page immediately
    router.replace('/parent/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">در حال انتقال به صفحه ورود...</p>
      </div>
    </div>
  );
}