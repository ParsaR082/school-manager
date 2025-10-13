const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSimpleTestData() {
  console.log('📝 ایجاد داده‌های تست ساده...\n');

  try {
    // پاک کردن داده‌های قبلی
    console.log('🧹 پاک کردن داده‌های قبلی...');
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('parents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // بررسی کلاس‌ها
    console.log('📚 بررسی کلاس‌ها...');
    const { data: existingClasses } = await supabase
      .from('classes')
      .select('id, name');

    let classIds = {};
    if (existingClasses && existingClasses.length > 0) {
      existingClasses.forEach(cls => {
        classIds[cls.name] = cls.id;
      });
      console.log(`✅ ${existingClasses.length} کلاس موجود یافت شد`);
    }

    // داده‌های تست ساده
    const testData = [
      {
        parent: { name: 'مریم احمدی', phone: '09123456789' },
        student: { name: 'علی احمدی', national_id: '1234567890', class: 'دهم تجربی ۱' }
      },
      {
        parent: { name: 'فاطمه احمدی', phone: '09123456790' },
        student: { name: 'زهرا احمدی', national_id: '1234567891', class: 'دهم تجربی ۲' }
      },
      {
        parent: { name: 'علی رضایی', phone: '09123456791' },
        student: { name: 'حسین رضایی', national_id: '1234567892', class: 'یازدهم ریاضی ۱' }
      }
    ];

    console.log('\n👥 ایجاد والدین و دانش‌آموزان...');

    for (const item of testData) {
      try {
        // ایجاد والد
        const { data: parent, error: parentError } = await supabase
          .from('parents')
          .insert({
            full_name: item.parent.name,
            phone: item.parent.phone
          })
          .select()
          .single();

        if (parentError) {
          console.error(`❌ خطا در ایجاد والد ${item.parent.name}:`, parentError);
          continue;
        }

        console.log(`✅ والد ایجاد شد: ${item.parent.name}`);

        // ایجاد دانش‌آموز با کد ملی ساده
        const { data: student, error: studentError } = await supabase
          .from('students')
          .insert({
            full_name: item.student.name,
            national_id: item.student.national_id,
            parent_id: parent.id,
            class_id: classIds[item.student.class] || null
          })
          .select()
          .single();

        if (studentError) {
          console.error(`❌ خطا در ایجاد دانش‌آموز ${item.student.name}:`, studentError);
        } else {
          console.log(`✅ دانش‌آموز ایجاد شد: ${item.student.name}`);
          console.log(`   📝 کد ملی: ${item.student.national_id}`);
        }

      } catch (error) {
        console.error(`❌ خطا در پردازش ${item.student.name}:`, error);
      }
    }

    console.log('\n📊 خلاصه داده‌های تست:');
    console.log('برای تست ورود از اطلاعات زیر استفاده کنید:');
    console.log('');
    testData.forEach((item, index) => {
      console.log(`${index + 1}. کد ملی دانش‌آموز: ${item.student.national_id}`);
      console.log(`   شماره تلفن والد: ${item.parent.phone}`);
      console.log(`   نام دانش‌آموز: ${item.student.name}`);
      console.log(`   نام والد: ${item.parent.name}`);
      console.log('');
    });

    console.log('⚠️ توجه: کد ملی‌ها در حالت ساده ذخیره شده‌اند.');
    console.log('💡 برای استفاده از هش، ابتدا ساختار جدول را تغییر دهید:');
    console.log('   ALTER TABLE students ALTER COLUMN national_id TYPE TEXT;');

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  }
}

// اجرای اسکریپت
createSimpleTestData();