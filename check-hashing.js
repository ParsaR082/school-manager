const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkHashing() {
  console.log('🔍 بررسی نحوه ذخیره و مقایسه اطلاعات...\n');

  try {
    // بررسی نحوه ذخیره کد ملی دانش‌آموز
    console.log('📋 بررسی کد ملی دانش‌آموزان:');
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, full_name, national_id')
      .limit(3);

    if (studentsError) {
      console.error('❌ خطا در دریافت دانش‌آموزان:', studentsError);
      return;
    }

    if (students && students.length > 0) {
      students.forEach(student => {
        console.log(`   دانش‌آموز: ${student.full_name}`);
        console.log(`   کد ملی: ${student.national_id} (نوع: ${typeof student.national_id})`);
        console.log(`   طول: ${student.national_id?.length} کاراکتر`);
        console.log('');
      });
    }

    // بررسی نحوه ذخیره شماره تلفن والدین
    console.log('📞 بررسی شماره تلفن والدین:');
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('id, full_name, phone')
      .limit(3);

    if (parentsError) {
      console.error('❌ خطا در دریافت والدین:', parentsError);
      return;
    }

    if (parents && parents.length > 0) {
      parents.forEach(parent => {
        console.log(`   والد: ${parent.full_name}`);
        console.log(`   تلفن: ${parent.phone} (نوع: ${typeof parent.phone})`);
        console.log(`   طول: ${parent.phone?.length} کاراکتر`);
        console.log('');
      });
    }

    // تست مقایسه مستقیم
    console.log('🧪 تست مقایسه مستقیم:');
    if (students && students.length > 0 && parents && parents.length > 0) {
      const testNationalId = students[0].national_id;
      const testPhone = parents[0].phone;

      console.log(`   کد ملی تست: "${testNationalId}"`);
      console.log(`   تلفن تست: "${testPhone}"`);

      // تست مقایسه با رشته‌های مختلف
      const testStrings = [
        testNationalId,
        testNationalId?.toString(),
        String(testNationalId),
        `${testNationalId}`,
      ];

      console.log('\n   نتایج مقایسه کد ملی:');
      testStrings.forEach((testStr, index) => {
        const isEqual = testStr === testNationalId;
        console.log(`     تست ${index + 1}: "${testStr}" === "${testNationalId}" → ${isEqual}`);
      });

      const phoneTestStrings = [
        testPhone,
        testPhone?.toString(),
        String(testPhone),
        `${testPhone}`,
      ];

      console.log('\n   نتایج مقایسه تلفن:');
      phoneTestStrings.forEach((testStr, index) => {
        const isEqual = testStr === testPhone;
        console.log(`     تست ${index + 1}: "${testStr}" === "${testPhone}" → ${isEqual}`);
      });
    }

    // تست query با مقادیر مختلف
    console.log('\n🔍 تست query با مقادیر مختلف:');
    if (students && students.length > 0) {
      const testNationalId = students[0].national_id;
      
      // تست با رشته
      const { data: result1 } = await supabase
        .from('students')
        .select('id, full_name, national_id')
        .eq('national_id', testNationalId)
        .single();

      // تست با تبدیل به رشته
      const { data: result2 } = await supabase
        .from('students')
        .select('id, full_name, national_id')
        .eq('national_id', String(testNationalId))
        .single();

      console.log(`   Query با مقدار اصلی: ${result1 ? '✅ موفق' : '❌ ناموفق'}`);
      console.log(`   Query با String(): ${result2 ? '✅ موفق' : '❌ ناموفق'}`);
    }

    // بررسی encoding و character set
    console.log('\n🔤 بررسی encoding:');
    if (students && students.length > 0) {
      const nationalId = students[0].national_id;
      console.log(`   کد ملی: ${nationalId}`);
      console.log(`   UTF-8 bytes: ${Buffer.from(nationalId, 'utf8').toString('hex')}`);
      console.log(`   ASCII: ${Buffer.from(nationalId, 'ascii').toString('hex')}`);
    }

  } catch (error) {
    console.error('❌ خطا در بررسی:', error);
  }
}

checkHashing();