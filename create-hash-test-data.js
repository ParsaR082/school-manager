const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createHashTestData() {
  console.log('🔐 ایجاد داده‌های تست با کد ملی هش شده...\n');

  try {
    // پاک کردن داده‌های قبلی
    console.log('🧹 پاک کردن داده‌های قبلی...');
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('parents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // ایجاد کلاس‌ها (اگر وجود ندارند)
    console.log('📚 بررسی کلاس‌ها...');
    const { data: existingClasses } = await supabase
      .from('classes')
      .select('id, name');

    let classIds = {};
    if (!existingClasses || existingClasses.length === 0) {
      const classesToCreate = [
        'سوم ابتدایی',
        'دوم ابتدایی', 
        'اول ابتدایی'
      ];

      for (const className of classesToCreate) {
        const { data: newClass, error } = await supabase
          .from('classes')
          .insert({ name: className })
          .select()
          .single();

        if (error) {
          console.error(`❌ خطا در ایجاد کلاس ${className}:`, error);
        } else {
          classIds[className] = newClass.id;
          console.log(`✅ کلاس ${className} ایجاد شد`);
        }
      }
    } else {
      existingClasses.forEach(cls => {
        classIds[cls.name] = cls.id;
      });
      console.log(`✅ ${existingClasses.length} کلاس موجود یافت شد`);
    }

    // داده‌های والدین و دانش‌آموزان
    const testData = [
      {
        parent: { name: 'مریم احمدی', phone: '09123456789' },
        student: { name: 'علی احمدی', national_id: '1234567890', class: 'سوم ابتدایی' }
      },
      {
        parent: { name: 'فاطمه احمدی', phone: '09123456790' },
        student: { name: 'زهرا احمدی', national_id: '1234567891', class: 'دوم ابتدایی' }
      },
      {
        parent: { name: 'علی رضایی', phone: '09123456791' },
        student: { name: 'حسین رضایی', national_id: '1234567892', class: 'اول ابتدایی' }
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

        // هش کردن کد ملی دانش‌آموز
        const hashedNationalId = bcrypt.hashSync(item.student.national_id, 10);

        // ایجاد دانش‌آموز با کد ملی هش شده
        const { data: student, error: studentError } = await supabase
          .from('students')
          .insert({
            full_name: item.student.name,
            national_id: hashedNationalId,
            parent_id: parent.id,
            class_id: classIds[item.student.class]
          })
          .select()
          .single();

        if (studentError) {
          console.error(`❌ خطا در ایجاد دانش‌آموز ${item.student.name}:`, studentError);
        } else {
          console.log(`✅ دانش‌آموز ایجاد شد: ${item.student.name} (کد ملی هش شده)`);
          console.log(`   📝 کد ملی اصلی: ${item.student.national_id}`);
          console.log(`   🔐 کد ملی هش شده: ${hashedNationalId.substring(0, 20)}...`);
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

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  }
}

// اجرای اسکریپت
createHashTestData();