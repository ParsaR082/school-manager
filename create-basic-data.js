require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBasicData() {
  console.log('📝 ایجاد داده‌های پایه سیستم...\n');

  try {
    // پاک کردن داده‌های قبلی
    console.log('🧹 پاک کردن داده‌های قبلی...');
    
    await supabase.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('parents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ داده‌های قبلی پاک شد');

    // ایجاد کلاس‌ها
    console.log('\n📚 ایجاد کلاس‌ها...');
    const classesData = [
      { name: 'دهم تجربی ۱' },
      { name: 'دهم تجربی ۲' },
      { name: 'یازدهم تجربی ۱' },
      { name: 'یازدهم تجربی ۲' },
      { name: 'دوازدهم تجربی ۱' },
      { name: 'دوازدهم تجربی ۲' }
    ];

    const { data: createdClasses, error: classesError } = await supabase
      .from('classes')
      .insert(classesData)
      .select();

    if (classesError) {
      console.log('❌ خطا در ایجاد کلاس‌ها:', classesError);
      return;
    }

    console.log(`✅ ${createdClasses.length} کلاس ایجاد شد`);

    // ایجاد مواد درسی
    console.log('\n📖 ایجاد مواد درسی...');
    const subjectsData = [
      { name: 'ریاضی' },
      { name: 'فیزیک' },
      { name: 'شیمی' },
      { name: 'زیست‌شناسی' },
      { name: 'زبان انگلیسی' },
      { name: 'ادبیات فارسی' },
      { name: 'تاریخ' },
      { name: 'جغرافیا' }
    ];

    const { data: createdSubjects, error: subjectsError } = await supabase
      .from('subjects')
      .insert(subjectsData)
      .select();

    if (subjectsError) {
      console.log('❌ خطا در ایجاد مواد درسی:', subjectsError);
      return;
    }

    console.log(`✅ ${createdSubjects.length} ماده درسی ایجاد شد`);

    // ایجاد والدین
    console.log('\n👥 ایجاد والدین...');
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
      console.log('❌ خطا در ایجاد والدین:', parentsError);
      return;
    }

    console.log(`✅ ${createdParents.length} والد ایجاد شد`);

    // ایجاد دانش‌آموزان
    console.log('\n🎓 ایجاد دانش‌آموزان...');
    const studentsData = [
      { 
        full_name: 'محمد احمدی', 
        national_id: '1234567801', 
        parent_id: createdParents[0].id, 
        class_id: createdClasses[0].id 
      },
      { 
        full_name: 'فاطمه احمدی', 
        national_id: '1234567802', 
        parent_id: createdParents[1].id, 
        class_id: createdClasses[1].id 
      },
      { 
        full_name: 'علی رضایی', 
        national_id: '1234567803', 
        parent_id: createdParents[2].id, 
        class_id: createdClasses[2].id 
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

    // ایجاد نمرات
    console.log('\n📊 ایجاد نمرات...');
    const gradesData = [];
    
    for (const student of createdStudents) {
      for (let i = 0; i < 3; i++) {
        gradesData.push({
          student_id: student.id,
          subject_id: createdSubjects[i].id,
          month: 8, // شهریور
          school_year: 1403,
          score: Math.floor(Math.random() * 10) + 10, // نمره بین 10 تا 20
          created_by: '00000000-0000-0000-0000-000000000001'
        });
      }
    }

    const { data: createdGrades, error: gradesError } = await supabase
      .from('grades')
      .insert(gradesData)
      .select();

    if (gradesError) {
      console.log('❌ خطا در ایجاد نمرات:', gradesError);
      return;
    }

    console.log(`✅ ${createdGrades.length} نمره ایجاد شد`);

    console.log('\n📋 خلاصه داده‌های ایجاد شده:');
    console.log('=====================================');
    for (let i = 0; i < createdParents.length; i++) {
      console.log(`${i + 1}. والد: ${createdParents[i].full_name}`);
      console.log(`   📞 تلفن: ${createdParents[i].phone}`);
      console.log(`   🎓 دانش‌آموز: ${createdStudents[i].full_name}`);
      console.log(`   🆔 کد ملی: ${createdStudents[i].national_id}`);
      console.log(`   📚 کلاس: ${createdClasses[i].name}`);
      console.log('');
    }

    console.log('✅ تمام داده‌های پایه با موفقیت ایجاد شد!');

  } catch (error) {
    console.error('❌ خطای عمومی:', error);
  }
}

createBasicData();