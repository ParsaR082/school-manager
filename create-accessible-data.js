require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// استفاده از service role برای مدیریت RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAccessibleData() {
  console.log('🔧 ایجاد داده‌های قابل دسترس...\n');

  try {
    // پاک کردن تمام داده‌های قبلی
    console.log('🧹 پاک کردن داده‌های قبلی...');
    
    const { error: deleteGradesError } = await supabase
      .from('grades')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: deleteStudentsError } = await supabase
      .from('students')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: deleteParentsError } = await supabase
      .from('parents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ داده‌های قبلی پاک شد');

    // غیرفعال کردن RLS به صورت مستقیم
    console.log('\n🔓 غیرفعال کردن RLS...');
    
    const rlsQueries = [
      'ALTER TABLE parents DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE students DISABLE ROW LEVEL SECURITY;', 
      'ALTER TABLE grades DISABLE ROW LEVEL SECURITY;'
    ];

    for (const query of rlsQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`❌ ${query}: ${error.message}`);
        } else {
          console.log(`✅ ${query}: موفق`);
        }
      } catch (err) {
        // اگر exec_sql کار نکرد، از روش دیگری استفاده کنیم
        console.log(`⚠️ ${query}: ${err.message}`);
      }
    }

    // ایجاد داده‌های جدید
    console.log('\n📝 ایجاد داده‌های جدید...');

    // ایجاد والدین
    const parentsData = [
      { full_name: 'علی احمدی', phone: '09123456789' },
      { full_name: 'زهرا احمدی', phone: '09123456790' },
      { full_name: 'حسین رضایی', phone: '09123456791' }
    ];

    const { data: createdParents, error: parentsError } = await supabase
      .from('parents')
      .insert(parentsData)
      .select();

    if (parentsError) {
      console.log('❌ خطا در ایجاد والدین:', parentsError.message);
      return;
    }

    console.log(`✅ ${createdParents.length} والد ایجاد شد`);

    // دریافت کلاس‌ها
    const { data: classes } = await supabase.from('classes').select('*').limit(3);
    
    if (!classes || classes.length < 3) {
      console.log('❌ کلاس‌های کافی موجود نیست');
      return;
    }

    // ایجاد دانش‌آموزان
    const studentsData = [
      { 
        full_name: 'محمد احمدی', 
        national_id: '1234567801', 
        parent_id: createdParents[0].id, 
        class_id: classes[0].id 
      },
      { 
        full_name: 'فاطمه احمدی', 
        national_id: '1234567802', 
        parent_id: createdParents[1].id, 
        class_id: classes[1].id 
      },
      { 
        full_name: 'علی رضایی', 
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
      console.log('❌ خطا در ایجاد دانش‌آموزان:', studentsError.message);
      return;
    }

    console.log(`✅ ${createdStudents.length} دانش‌آموز ایجاد شد`);

    // تست دسترسی با anon key
    console.log('\n🧪 تست دسترسی با anon key...');
    
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: testParents, error: testError } = await supabaseAnon
      .from('parents')
      .select('*');

    if (testError) {
      console.log('❌ تست ناموفق:', testError.message);
    } else {
      console.log(`✅ ${testParents.length} والد با anon key قابل دسترس`);
      
      // تست جستجوی خاص
      const { data: specificParent, error: specificError } = await supabaseAnon
        .from('parents')
        .select('*')
        .eq('phone', '09123456789')
        .single();

      if (specificError) {
        console.log('❌ جستجوی خاص ناموفق:', specificError.message);
      } else {
        console.log('✅ جستجوی خاص موفق:', specificParent.full_name);
      }
    }

    console.log('\n📋 خلاصه داده‌های ایجاد شده:');
    for (let i = 0; i < createdParents.length; i++) {
      console.log(`${i + 1}. والد: ${createdParents[i].full_name}`);
      console.log(`   📞 تلفن: ${createdParents[i].phone}`);
      console.log(`   🎓 دانش‌آموز: ${createdStudents[i].full_name}`);
      console.log(`   🆔 کد ملی: ${createdStudents[i].national_id}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ خطای عمومی:', error.message);
  }
}

createAccessibleData();