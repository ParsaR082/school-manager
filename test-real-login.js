const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealLogin() {
  console.log('🔐 Testing real login with existing data...\n');

  try {
    // First, get some real data from the database
    console.log('📊 Getting existing data...');
    
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        national_id,
        parent_id,
        parents (
          id,
          full_name,
          phone
        )
      `)
      .limit(3);

    if (studentsError) {
      console.error('❌ Error getting students:', studentsError);
      return;
    }

    if (!students || students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }

    console.log('✅ Found students:');
    students.forEach((student, index) => {
      console.log(`   ${index + 1}. Student: ${student.full_name} (${student.national_id})`);
      console.log(`      Parent: ${student.parents?.full_name} (${student.parents?.phone})`);
    });

    // Test login with each student
    console.log('\n🧪 Testing login API...');
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const studentId = student.national_id;
      const parentPhone = student.parents?.phone;

      if (!parentPhone) {
        console.log(`❌ Student ${student.full_name} has no parent phone`);
        continue;
      }

      console.log(`\n🔑 Testing login for: ${student.full_name}`);
      console.log(`   Student ID: ${studentId}`);
      console.log(`   Parent Phone: ${parentPhone}`);

      try {
        const response = await fetch('http://localhost:3000/api/auth/parent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            national_id: studentId,
            phone: parentPhone
          })
        });

        const result = await response.json();

        if (response.ok) {
          console.log('   ✅ Login successful!');
          console.log('   📋 Response:', {
            parent: result.parent?.full_name,
            student: result.student?.full_name
          });
        } else {
          console.log('   ❌ Login failed:', result.error);
        }
      } catch (fetchError) {
        console.log('   ❌ API call failed:', fetchError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealLogin();