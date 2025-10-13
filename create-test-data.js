const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestData() {
  console.log('🚀 Creating test data for parent login...\n');

  try {
    // 1. Insert test classes
    console.log('📋 Creating classes...');
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .upsert([
        { name: 'سوم ابتدایی' },
        { name: 'چهارم ابتدایی' },
        { name: 'پنجم ابتدایی' }
      ], { onConflict: 'name' })
      .select();

    if (classError) {
      console.error('❌ Class error:', classError);
      return;
    }
    console.log('✅ Classes created:', classData.length);

    // 2. Insert test parents
    console.log('\n👨‍👩‍👧‍👦 Creating parents...');
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .insert([
        {
          full_name: 'احمد محمدی',
          phone: '09123456789'
        },
        {
          full_name: 'فاطمه احمدی', 
          phone: '09123456790'
        },
        {
          full_name: 'علی رضایی',
          phone: '09123456791'
        }
      ])
      .select();

    if (parentError) {
      console.error('❌ Parent error:', parentError);
      return;
    }
    console.log('✅ Parents created:', parentData.length);

    // 3. Insert test students
    console.log('\n👨‍🎓 Creating students...');
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          full_name: 'محمد احمدی',
          national_id: '1234567890',
          parent_id: parentData[0].id,
          class_id: classData[0].id
        },
        {
          full_name: 'زهرا احمدی',
          national_id: '1234567891', 
          parent_id: parentData[1].id,
          class_id: classData[1].id
        },
        {
          full_name: 'حسین رضایی',
          national_id: '1234567892',
          parent_id: parentData[2].id,
          class_id: classData[2].id
        }
      ])
      .select();

    if (studentError) {
      console.error('❌ Student error:', studentError);
      return;
    }
    console.log('✅ Students created:', studentData.length);

    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Test login credentials:');
    console.log('1. Student National ID: 1234567890, Parent Phone: 09123456789');
    console.log('   Student: محمد احمدی, Parent: احمد محمدی');
    console.log('2. Student National ID: 1234567891, Parent Phone: 09123456790');
    console.log('   Student: زهرا احمدی, Parent: فاطمه احمدی');
    console.log('3. Student National ID: 1234567892, Parent Phone: 09123456791');
    console.log('   Student: حسین رضایی, Parent: علی رضایی');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

createTestData();