const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertTestData() {
  console.log('🚀 Inserting test data for parent login...\n');

  try {
    // Step 1: Get existing classes or create new ones
    console.log('📋 Checking classes...');
    let { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .limit(3);

    if (classError) {
      console.error('❌ Class error:', classError);
      return;
    }

    if (classes.length === 0) {
      console.log('Creating new classes...');
      const { data: newClasses, error: newClassError } = await supabase
        .from('classes')
        .insert([
          { name: 'سوم ابتدایی' },
          { name: 'چهارم ابتدایی' },
          { name: 'پنجم ابتدایی' }
        ])
        .select();

      if (newClassError) {
        console.error('❌ New class error:', newClassError);
        return;
      }
      classes = newClasses;
    }

    console.log('✅ Classes available:', classes.length);

    // Step 2: Insert parents one by one
    console.log('\n👨‍👩‍👧‍👦 Inserting parents...');
    const parents = [];
    
    const parentData = [
      { full_name: 'احمد محمدی', phone: '09123456789' },
      { full_name: 'فاطمه احمدی', phone: '09123456790' },
      { full_name: 'علی رضایی', phone: '09123456791' }
    ];

    for (const parent of parentData) {
      const { data, error } = await supabase
        .from('parents')
        .insert([parent])
        .select()
        .single();

      if (error) {
        console.log(`⚠️ Parent ${parent.full_name} might already exist:`, error.message);
        // Try to get existing parent
        const { data: existing } = await supabase
          .from('parents')
          .select('*')
          .eq('phone', parent.phone)
          .single();
        if (existing) {
          parents.push(existing);
          console.log(`✅ Using existing parent: ${existing.full_name}`);
        }
      } else {
        parents.push(data);
        console.log(`✅ Created parent: ${data.full_name}`);
      }
    }

    // Step 3: Insert students
    console.log('\n👨‍🎓 Inserting students...');
    const studentData = [
      { full_name: 'محمد احمدی', national_id: '1234567890', parent_id: parents[0].id, class_id: classes[0].id },
      { full_name: 'زهرا احمدی', national_id: '1234567891', parent_id: parents[1].id, class_id: classes[1] ? classes[1].id : classes[0].id },
      { full_name: 'حسین رضایی', national_id: '1234567892', parent_id: parents[2].id, class_id: classes[2] ? classes[2].id : classes[0].id }
    ];

    for (const student of studentData) {
      const { data, error } = await supabase
        .from('students')
        .insert([student])
        .select()
        .single();

      if (error) {
        console.log(`⚠️ Student ${student.full_name} might already exist:`, error.message);
      } else {
        console.log(`✅ Created student: ${data.full_name}`);
      }
    }

    console.log('\n🎉 Test data setup completed!');
    console.log('\n📋 Test login credentials:');
    console.log('1. Student National ID: 1234567890, Parent Phone: 09123456789');
    console.log('   Student: محمد احمدی, Parent: احمد محمدی');
    console.log('2. Student National ID: 1234567891, Parent Phone: 09123456790');
    console.log('   Student: زهرا احمدی, Parent: فاطمه احمدی');
    console.log('3. Student National ID: 1234567892, Parent Phone: 09123456791');
    console.log('   Student: حسین رضایی, Parent: علی رضایی');

  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  }
}

insertTestData();