

# پروژه وب‌اپلیکیشن مدیریت مدرسه

## هدف پروژه
ایجاد یک سیستم مدیریت مدرسه برای ثبت نمرات دانش‌آموزان و مشاهده آن توسط والدین

## نقش‌ها ✅
- **مدیر**: مدیریت کلاس‌ها، دروس، دانش‌آموزان و ثبت نمرات ✅
- **والد**: مشاهده نمرات فرزند ✅

## تکنولوژی‌ها ✅
- **Frontend**: Next.js 15 + TypeScript + TailwindCSS ✅
- **Backend**: Supabase (PostgreSQL + Auth + RLS) ✅
- **UI**: RTL Support + Persian Fonts ✅
- **Validation**: Zod + React Hook Form ✅

---

## 👥 نقش‌ها (Roles)

### 1. مدیر (Admin)

* افزودن کلاس‌ها (مثلاً "دهم تجربی ۱")
* تعریف دروس (مثلاً "ریاضی ۱") و تخصیص آن‌ها به یک یا چند کلاس
* افزودن دانش‌آموز (با اطلاعات دانش‌آموز و والد)
* هنگام افزودن دانش‌آموز، یک کاربر برای والد در Supabase ایجاد می‌شود:

  * `username` = کد ملی دانش‌آموز
  * `password` = شماره تلفن والد
* وارد کردن نمرات ماهانه برای هر دانش‌آموز در هر درس
  (ماه‌های سال تحصیلی از مهر تا خرداد)

### 2. والد (Parent)

* ورود با نام کاربری و رمز عبور تعیین‌شده توسط مدیر
* مشاهدهٔ جدول نمرات فرزندش (فقط Read-only)
* جدول شامل دروس در سطرها و ماه‌های مهر تا خرداد در ستون‌ها است
* آخرین ستون معدل کل هر درس را نمایش می‌دهد

---

## ⚙️ تکنولوژی‌ها و ابزارها

| بخش        | ابزار                              |
| ---------- | ---------------------------------- |
| Frontend   | Next.js 14 (App Router)            |
| Database   | PostgreSQL (در Supabase)           |
| Auth       | Supabase Auth                      |
| Styling    | TailwindCSS (با پشتیبانی RTL)      |
| Forms      | React Hook Form                    |
| Validation | Zod (در صورت نیاز)                 |
| Deployment | Vercel (Frontend) + Supabase Cloud |

---

## ساختار دیتابیس ✅

### جداول اصلی ✅

#### 1. جدول کلاس‌ها (classes) ✅
```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. جدول دروس (subjects) ✅
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. جدول ارتباط دروس و کلاس‌ها (subject_classes) ✅
```sql
CREATE TABLE subject_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, class_id)
);
```

#### 4. جدول والدین (parents) ✅
```sql
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(11) NOT NULL UNIQUE,
    national_id VARCHAR(10) NOT NULL UNIQUE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. جدول دانش‌آموزان (students) ✅
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(10) NOT NULL UNIQUE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. جدول نمرات (grades) ✅
```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    month INTEGER CHECK (month >= 1 AND month <= 12),
    school_year INTEGER NOT NULL,
    score DECIMAL(4,2) CHECK (score >= 0 AND score <= 20),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_id, month, school_year)
);
```

---

## روابط بین جداول ✅

- **classes** ← **students** (یک کلاس، چندین دانش‌آموز) ✅
- **parents** ← **students** (یک والد، چندین فرزند) ✅
- **students** ← **grades** (یک دانش‌آموز، چندین نمره) ✅
- **subjects** ← **grades** (یک درس، چندین نمره) ✅
- **subjects** ↔ **classes** (رابطه many-to-many از طریق subject_classes) ✅

---

## فازبندی پروژه ✅

### فاز ۱: زیرساخت ✅
- [x] راه‌اندازی Next.js با TypeScript ✅
- [x] پیکربندی TailwindCSS برای RTL ✅
- [x] اتصال به Supabase ✅
- [x] ایجاد جداول دیتابیس ✅
- [x] تنظیم RLS (Row Level Security) ✅

### فاز ۲: مدیریت کلاس‌ها و دروس ✅
- [x] CRUD کلاس‌ها ✅
- [x] CRUD دروس ✅
- [x] تخصیص دروس به کلاس‌ها ✅

### فاز ۳: مدیریت دانش‌آموزان و والدین ✅
- [x] CRUD دانش‌آموزان ✅
- [x] ایجاد خودکار والدین هنگام ثبت دانش‌آموز ✅
- [x] تخصیص دانش‌آموزان به کلاس‌ها ✅

### فاز ۴: ثبت نمرات ✅
- [x] فرم ثبت نمرات ماهانه ✅
- [x] ویرایش و حذف نمرات ✅
- [x] فیلتر بر اساس کلاس و درس ✅

### فاز ۵: پنل والد ✅
- [x] صفحه ورود والدین (کد ملی + شماره تلفن) ✅
- [x] داشبورد والد ✅
- [x] مشاهده نمرات فرزند ✅
- [x] محاسبه معدل ماهانه و کل ✅

### فاز ۶: امنیت و دیپلوی
- [ ] تنظیم کامل RLS policies
- [ ] اضافه کردن authentication برای admin
- [ ] بهینه‌سازی performance
- [ ] تست کامل سیستم
- [ ] آماده‌سازی برای production

---

## دستورالعمل اتصال به Supabase ✅

### مراحل راه‌اندازی ✅
1. **ایجاد پروژه در Supabase** ✅
2. **کپی کردن URL و API Key** ✅
3. **تنظیم متغیرهای محیطی در `.env.local`** ✅
4. **اجرای migration ها** ✅
5. **تنظیم RLS policies** ✅

### اطلاعات اتصال ✅
- **Project URL**: `https://hprzgndndgcmwyrosmlx.supabase.co` ✅
- **Anon Key**: تنظیم شده در `.env.local` ✅
- **Service Role Key**: تنظیم شده در `.env.local` ✅

---

## نکات UI/UX ✅

### طراحی کلی ✅
- **زبان**: فارسی ✅
- **جهت**: راست به چپ (RTL) ✅
- **فونت**: Vazirmatn ✅
- **ریسپانسیو**: موبایل و دسکتاپ ✅

### رنگ‌بندی ✅
- **اصلی**: آبی (#3b82f6) ✅
- **ثانویه**: سبز (#10b981) ✅
- **خاکستری**: طیف کامل ✅
- **پس‌زمینه**: سفید/خاکستری روشن ✅

---

## ساختار پوشه‌ها ✅

```
src/
├── app/                    ✅
│   ├── admin/             ✅
│   │   ├── page.tsx       ✅ (داشبورد مدیر)
│   │   ├── classes/       ✅
│   │   │   └── page.tsx   ✅ (مدیریت کلاس‌ها)
│   │   ├── subjects/      ✅
│   │   │   └── page.tsx   ✅ (مدیریت دروس)
│   │   ├── students/      ✅
│   │   │   └── page.tsx   ✅ (مدیریت دانش‌آموزان)
│   │   └── grades/        ✅
│   │       └── page.tsx   ✅ (ثبت نمرات)
│   ├── parent/            ✅
│   │   ├── login/         ✅
│   │   │   └── page.tsx   ✅ (ورود والد)
│   │   └── dashboard/     ✅
│   │       └── page.tsx   ✅ (داشبورد والد)
│   ├── layout.tsx         ✅ (RTL Layout)
│   ├── page.tsx           ✅ (صفحه اصلی)
│   └── globals.css        ✅ (استایل‌های کلی)
├── components/            ✅
│   └── AdminLayout.tsx    ✅ (لایوت پنل مدیر)
└── lib/                   ✅
    ├── supabase.ts        ✅ (کلاینت Supabase)
    └── types.ts           ✅ (تایپ‌های TypeScript)
```

---
* دسترسی‌ها را با RLS در Supabase کنترل کنید.
* از `service_role` فقط در سرور استفاده شود (نه در فرانت‌اند).

---

## فرمول محاسبه معدل ✅

### معدل ماهانه ✅
```javascript
// برای هر درس در هر ماه
monthlyAverage = totalScore / numberOfSubjects
```

### معدل کل ✅
```javascript
// معدل کل سال تحصیلی
totalAverage = sumOfAllScores / (numberOfSubjects × numberOfMonths)
```

### پیاده‌سازی در کد ✅
- محاسبه معدل در کامپوننت والد ✅
- نمایش معدل در جدول نمرات ✅
- رنگ‌بندی بر اساس معدل (قرمز < 10، زرد 10-15، سبز > 15) ✅

---

## خروجی نهایی پروژه ✅

### پنل مدیر ✅
- **داشبورد**: آمار کلی (تعداد کلاس‌ها، دروس، دانش‌آموزان) ✅
- **مدیریت کلاس‌ها**: افزودن، ویرایش، حذف کلاس‌ها ✅
- **مدیریت دروس**: افزودن، ویرایش، حذف دروس ✅
- **مدیریت دانش‌آموزان**: ثبت دانش‌آموز با ایجاد خودکار والد ✅
- **ثبت نمرات**: ثبت نمرات ماهانه با فیلتر کلاس و درس ✅

### پنل والد ✅
- **ورود**: با کد ملی و شماره تلفن ✅
- **داشبورد**: مشاهده نمرات فرزند در جدول ماهانه ✅
- **محاسبه معدل**: نمایش معدل ماهانه و کل ✅

### ویژگی‌های تکنیکی ✅
- **RTL**: پشتیبانی کامل از راست به چپ ✅
- **ریسپانسیو**: سازگار با موبایل و دسکتاپ ✅
- **امنیت**: RLS policies برای محافظت از داده‌ها ✅
- **تایپ‌اسکریپت**: تایپ‌های کامل برای همه entities ✅
- **فرم validation**: اعتبارسنجی کامل با Zod ✅

---

## وضعیت فعلی پروژه ✅

### انجام شده ✅
- [x] **زیرساخت**: Next.js + TypeScript + TailwindCSS + Supabase ✅
- [x] **دیتابیس**: تمام جداول و روابط ایجاد شده ✅
- [x] **پنل مدیر**: تمام صفحات CRUD پیاده‌سازی شده ✅
- [x] **پنل والد**: ورود و داشبورد کامل ✅
- [x] **UI/UX**: طراحی RTL و ریسپانسیو ✅
- [x] **امنیت**: RLS policies اولیه ✅

### باقی‌مانده
- [ ] **تست کامل**: بررسی تمام عملکردها
- [ ] **بهینه‌سازی**: Performance optimization
- [ ] **Authentication مدیر**: سیستم ورود برای مدیر
- [ ] **آماده‌سازی production**: Environment variables و deployment

**درصد پیشرفت: ۹۰٪** 🎉

---
