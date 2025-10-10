# راهنمای دیپلوی پروژه مدیریت مدرسه

## پیش‌نیازهای دیپلوی

### 1. متغیرهای محیطی
فایل `.env.local` باید شامل موارد زیر باشد:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. پیکربندی Supabase
- تمام جداول ایجاد شده باشند (از فایل `database-schema.sql`)
- RLS policies فعال باشند (از فایل `rls-policies.sql`)
- Authentication تنظیم شده باشد

## مراحل دیپلوی

### 1. Vercel (توصیه شده)
```bash
# نصب Vercel CLI
npm i -g vercel

# دیپلوی
vercel

# تنظیم متغیرهای محیطی در Vercel Dashboard
```

### 2. Netlify
```bash
# ساخت پروژه
npm run build

# آپلود فولدر .next به Netlify
```

### 3. سرور شخصی
```bash
# ساخت پروژه
npm run build

# اجرای production
npm start
```

## چک‌لیست امنیتی

- [x] RLS policies فعال
- [x] متغیرهای محیطی محافظت شده
- [x] API routes محدود به نقش‌های مجاز
- [x] اعتبارسنجی ورودی‌ها
- [x] عدم نمایش اطلاعات حساس در کلاینت

## بهینه‌سازی Performance

- [x] Static generation برای صفحات عمومی
- [x] Dynamic imports برای کامپوننت‌های سنگین
- [x] Image optimization
- [x] CSS minification
- [x] Bundle analysis

## مانیتورینگ و لاگ‌ها

### Vercel Analytics
- فعال‌سازی Vercel Analytics
- تنظیم Error Tracking

### Supabase Monitoring
- بررسی Database Performance
- تنظیم Alerts برای خطاها

## پشتیبان‌گیری

### Database Backup
```sql
-- Export data
pg_dump your_database > backup.sql

-- Import data
psql your_database < backup.sql
```

### Code Backup
- استفاده از Git repository
- تنظیم CI/CD pipeline

## تست Production

### چک‌لیست تست
- [ ] ورود مدیر
- [ ] ورود والد
- [ ] CRUD عملیات
- [ ] ثبت نمرات
- [ ] مشاهده نمرات
- [ ] ریسپانسیو بودن
- [ ] RTL support
- [ ] Performance

### ابزارهای تست
- Lighthouse audit
- GTmetrix
- WebPageTest

## نکات مهم

1. **امنیت**: هرگز service role key را در فرانت‌اند استفاده نکنید
2. **Performance**: از caching مناسب استفاده کنید
3. **SEO**: meta tags و structured data اضافه کنید
4. **Accessibility**: WCAG guidelines را رعایت کنید
5. **Error Handling**: error boundaries و proper error messages

## پشتیبانی

در صورت بروز مشکل:
1. بررسی logs در Vercel/Netlify
2. بررسی Supabase logs
3. تست local environment
4. بررسی network requests در DevTools