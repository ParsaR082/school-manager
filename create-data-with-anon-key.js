require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// استفاده از anon key برای ایجاد داده‌ها
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createDataWithAnonKey() {
  console.log('📝 ایجاد داده‌های تست با anon key...\n');

  try {
    // بررسی کلاس‌ها
    console.log('📚 بررسی کلاس‌ها...');
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*');

    if (classError) {
      console.log('❌ خطا در دسترسی به کلاس‌ها:', classError);
      return;
    }

    if (classes.length === 0) {
      console.log('❌ هیچ کلاسی موجود نیست');
      return;
    }

    console.log(`✅ ${classes.length} کلاس موجود`);

    // ایجاد والدین
    console.log('\n👥 ایجاد والدین...');
    const parentsData = [
      { full_name: 'مریم احمدی', phone: '09123456789', national_id: '1234567890' },
      { full_name: 'فاطمه احمدی', phone: '09123456790', national_id: '1234567891' },
      { full_name: 'علی رضایی', phone: '09123456791', national_id: '1234567892' }
    ];

    const { data: createdParents, error: parentsError } = await supabase
      .from('parents')
      .insert(parentsData)
      .select();

    if (parentsError) {
      console.log('❌ خطا در ایجاد والدین:', parentsError);
      return;
    }

    console.log(`✅ ${createdParents.length} والد ایجاد شد`);

    // ایجاد دانش‌آموزان
    console.log('\n🎓 ایجاد دانش‌آموزان...');
    const studentsData = [
      { 
        full_name: 'علی احمدی', 
        national_id: '1234567801', 
        parent_id: createdParents[0].id, 
        class_id: classes[0].id 
      },
      { 
        full_name: 'زهرا احمدی', 
        national_id: '1234567802', 
        parent_id: createdParents[1].id, 
        class_id: classes[1].id 
      },
      { 
        full_name: 'حسین رضایی', 
        national_id: '1234567803', 
        parent_id: createdParents[2].id, 
        class_id: classes[2].id 
      }
    ];

    const { data: createdStudents, error: studentsError } = await supabase
      .from('students')
      .insert(studentsData)
      .select();

    if (studentsError) {
      console.log('❌ خطا در ایجاد دانش‌آموزان:', studentsError);
      return;
    }

    console.log(`✅ ${createdStudents.length} دانش‌آموز ایجاد شد`);

    console.log('\n📋 خلاصه داده‌های ایجاد شده:');
    for (let i = 0; i < createdParents.length; i++) {
      console.log(`${i + 1}. والد: ${createdParents[i].full_name}`);
      console.log(`   📞 تلفن: ${createdParents[i].phone}`);
      console.log(`   🎓 دانش‌آموز: ${createdStudents[i].full_name}`);
      console.log(`   🆔 کد ملی: ${createdStudents[i].national_id}`);
      console.log('');
    }

    // تست دسترسی
    console.log('🧪 تست دسترسی به داده‌های ایجاد شده...');
    const { data: testParent, error: testError } = await supabase
      .from('parents')
      .select('*')
      .eq('phone', '09123456789')
      .single();

    if (testError) {
      console.log('❌ تست دسترسی ناموفق:', testError);
    } else {
      console.log('✅ تست دسترسی موفق:', testParent.full_name);
    }

  } catch (error) {
    console.error('❌ خطای عمومی:', error);
  }
}

createDataWithAnonKey();