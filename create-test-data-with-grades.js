require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { createDummyUser } = require('./create-dummy-user');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestData() {
  console.log('📝 ایجاد داده‌های تست کامل (والدین، دانش‌آموزان، نمرات)...\n');

  try {
    // استفاده از UUID ثابت برای created_by
    const dummyUserId = '00000000-0000-0000-0000-000000000001';
    console.log('🔧 استفاده از UUID ثابت برای created_by:', dummyUserId, '\n');
    // پاک کردن داده‌های قبلی
    console.log('🧹 پاک کردن داده‌های قبلی...');
    await supabase.from('grades').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('students').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('parents').delete().gte('id', '00000000-0000-0000-0000-000000000000');

    // بررسی کلاس‌ها و درس‌ها
    console.log('📚 بررسی کلاس‌ها و درس‌ها...');
    const { data: classes } = await supabase.from('classes').select('*');
    const { data: subjects } = await supabase.from('subjects').select('*');
    
    console.log(`✅ ${classes.length} کلاس و ${subjects.length} درس موجود`);

    // ایجاد والدین
    console.log('\n👥 ایجاد والدین...');
    const parentsData = [
      { full_name: 'مریم احمدی', phone: '09123456789' },
      { full_name: 'فاطمه احمدی', phone: '09123456790' },
      { full_name: 'علی رضایی', phone: '09123456791' }
    ];

    const { data: createdParents, error: parentsError } = await supabase
      .from('parents')
      .insert(parentsData)
      .select();

    if (parentsError) {
      console.error('❌ خطا در ایجاد والدین:', parentsError);
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
      console.error('❌ خطا در ایجاد دانش‌آموزان:', studentsError);
      return;
    }

    console.log(`✅ ${createdStudents.length} دانش‌آموز ایجاد شد`);

    // ایجاد نمرات
    console.log('\n📊 ایجاد نمرات...');
    const gradesData = [];
    
    createdStudents.forEach(student => {
      subjects.slice(0, 3).forEach(subject => { // فقط 3 درس اول
        gradesData.push({
          student_id: student.id,
          subject_id: subject.id,
          score: Math.floor(Math.random() * 5) + 15, // نمره بین 15-20
          month: 7, // ماه مهر
          school_year: 1403,
          created_by: dummyUserId
        });
      });
    });

    const { data: createdGrades, error: gradesError } = await supabase
      .from('grades')
      .insert(gradesData)
      .select();

    if (gradesError) {
      console.error('❌ خطا در ایجاد نمرات:', gradesError);
      return;
    }

    console.log(`✅ ${createdGrades.length} نمره ایجاد شد`);

    // نمایش خلاصه
    console.log('\n📋 خلاصه داده‌های تست:');
    console.log('برای تست API ورود والدین از اطلاعات زیر استفاده کنید:\n');

    for (let i = 0; i < createdParents.length; i++) {
      const parent = createdParents[i];
      const student = createdStudents[i];
      
      console.log(`${i + 1}. والد: ${parent.full_name}`);
      console.log(`   📞 شماره تلفن: ${parent.phone}`);
      console.log(`   🎓 دانش‌آموز: ${student.full_name}`);
      console.log(`   🆔 کد ملی: ${student.national_id}`);
      console.log('');
    }

    console.log('✅ تمام داده‌های تست با موفقیت ایجاد شد!');

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  }
}

createTestData();