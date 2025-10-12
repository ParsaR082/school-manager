import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // بهینه‌سازی برای production
  compress: true,
  poweredByHeader: false,
  
  // تنظیمات امنیتی
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
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
};

export default nextConfig;
