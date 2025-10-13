require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// استفاده از همان کلید که API استفاده می‌کند
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkWithAnonKey() {
  console.log('🔍 بررسی داده‌ها با anon key (همان کلیدی که API استفاده می‌کند)...\n');

  try {
    // بررسی والدین
    console.log('👥 بررسی جدول والدین:');
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('*');

    if (parentsError) {
      console.log('❌ خطا در والدین:', parentsError);
    } else {
      console.log(`✅ تعداد والدین: ${parents.length}`);
      if (parents.length > 0) {
        console.log('📄 نمونه والدین:');
        parents.forEach((parent, index) => {
          console.log(`   ${index + 1}. ${parent.full_name} - ${parent.phone}`);
        });
      }
    }

    // بررسی دانش‌آموزان
    console.log('\n🎓 بررسی جدول دانش‌آموزان:');
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*');

    if (studentsError) {
      console.log('❌ خطا در دانش‌آموزان:', studentsError);
    } else {
      console.log(`✅ تعداد دانش‌آموزان: ${students.length}`);
      if (students.length > 0) {
        console.log('📄 نمونه دانش‌آموزان:');
        students.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.full_name} - کد ملی: ${student.national_id} - والد: ${student.parent_id}`);
        });
      }
    }

    // تست مستقیم جستجوی والد
    console.log('\n🧪 تست مستقیم جستجوی والد:');
    const { data: testParent, error: testError } = await supabase
      .from('parents')
      .select('*')
      .eq('phone', '09123456789')
      .single();

    if (testError) {
      console.log('❌ والد با شماره 09123456789 یافت نشد:', testError);
    } else {
      console.log('✅ والد یافت شد:', testParent);
    }

  } catch (error) {
    console.error('❌ خطای عمومی:', error);
  }
}

checkWithAnonKey();