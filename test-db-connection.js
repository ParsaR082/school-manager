const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found!');
  console.log('Make sure you have .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test 1: Check parents table
    console.log('📋 Testing parents table...');
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('*')
      .limit(5);

    if (parentsError) {
      console.error('❌ Parents table error:', parentsError);
    } else {
      console.log('✅ Parents table accessible');
      console.log(`📊 Found ${parents.length} parents:`);
      parents.forEach(parent => {
        console.log(`   - ${parent.full_name} (ID: ${parent.national_id}, Phone: ${parent.phone})`);
      });
    }

    // Test 2: Check students table
    console.log('\n📋 Testing students table...');
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(5);

    if (studentsError) {
      console.error('❌ Students table error:', studentsError);
    } else {
      console.log('✅ Students table accessible');
      console.log(`📊 Found ${students.length} students:`);
      students.forEach(student => {
        console.log(`   - ${student.full_name} (ID: ${student.national_id}, Parent ID: ${student.parent_id})`);
      });
    }

    // Test 3: Test specific login data
    console.log('\n🔐 Testing specific login combinations...');
    
    const testCases = [
      { student_national_id: '2234567890', parent_phone: '09123456789' },
      { student_national_id: '2234567891', parent_phone: '09123456790' },
      { student_national_id: '2234567892', parent_phone: '09123456791' }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: Student ID ${testCase.student_national_id} with Parent Phone ${testCase.parent_phone}`);
      
      // Find student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, full_name, national_id, parent_id')
        .eq('national_id', testCase.student_national_id)
        .single();

      if (studentError || !student) {
        console.log('❌ Student not found:', studentError?.message || 'No data');
        continue;
      }

      console.log(`✅ Found student: ${student.full_name}`);

      // Find parent
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('id, full_name, national_id, phone')
        .eq('id', student.parent_id)
        .eq('phone', testCase.parent_phone)
        .single();

      if (parentError || !parent) {
        console.log('❌ Parent not found or phone mismatch:', parentError?.message || 'No data');
        
        // Check if parent exists with different phone
        const { data: parentCheck } = await supabase
          .from('parents')
          .select('phone')
          .eq('id', student.parent_id)
          .single();
        
        if (parentCheck) {
          console.log(`   📞 Parent's actual phone: ${parentCheck.phone}`);
        }
      } else {
        console.log(`✅ Login should work: ${parent.full_name} (${parent.phone})`);
      }
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabaseConnection();