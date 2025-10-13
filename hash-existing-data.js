const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function hashExistingNationalIds() {
  console.log('🔐 شروع هش کردن کدهای ملی موجود...\n');

  try {
    // دریافت تمام دانش‌آموزان
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select('id, full_name, national_id');

    if (fetchError) {
      console.error('❌ خطا در دریافت دانش‌آموزان:', fetchError);
      return;
    }

    if (!students || students.length === 0) {
      console.log('⚠️ هیچ دانش‌آموزی یافت نشد.');
      return;
    }

    console.log(`📋 ${students.length} دانش‌آموز یافت شد. شروع هش کردن...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // بررسی اینکه آیا کد ملی قبلاً هش شده است یا نه
        // اگر کد ملی 10 رقم باشد، احتمالاً هش نشده است
        if (student.national_id && student.national_id.length === 10) {
          // هش کردن کد ملی
          const hashedNationalId = bcrypt.hashSync(student.national_id, 10);
          
          // به‌روزرسانی در پایگاه داده
          const { error: updateError } = await supabase
            .from('students')
            .update({ national_id: hashedNationalId })
            .eq('id', student.id);

          if (updateError) {
            console.error(`❌ خطا در به‌روزرسانی ${student.full_name}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ ${student.full_name}: کد ملی هش شد`);
            successCount++;
          }
        } else {
          console.log(`⏭️ ${student.full_name}: کد ملی احتمالاً قبلاً هش شده`);
        }
      } catch (error) {
        console.error(`❌ خطا در پردازش ${student.full_name}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 خلاصه نتایج:');
    console.log(`✅ موفق: ${successCount}`);
    console.log(`❌ ناموفق: ${errorCount}`);
    console.log(`📋 کل: ${students.length}`);

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  }
}

// اجرای اسکریپت
hashExistingNationalIds();