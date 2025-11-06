import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // بهینه‌سازی برای production
  compress: true,
  poweredByHeader: false,
  
  // تنظیمات هدرها و کش
  async headers() {
    return [
      // صفحات و مسیرهای عمومی: فقط هدرهای امنیتی، بدون کش
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      // API: کاملاً بدون کش برای جلوگیری از داده‌های قدیمی
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      // فایل‌های استاتیک Next: کش بلندمدت ایمن
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Service Worker Headers
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Manifest Headers
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
  // تنظیمات تصاویر
  images: {
    domains: ['hprzgndndgcmwyrosmlx.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },

  // بهینه‌سازی bundle
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },

  // PWA Configuration
  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
    ];
  },
};

export default nextConfig;
