require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLogin() {
  console.log('🔍 Detailed Login Debug...\n');

  // First, let's see what data we actually have
  console.log('📊 Checking actual data in database:');
  
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select(`
      id,
      full_name,
      national_id,
      parent_id,
      class_id,
      parents (
        id,
        full_name,
        phone
      ),
      classes (
        id,
        name
      )
    `);

  if (studentsError) {
    console.error('❌ Error fetching students:', studentsError);
    return;
  }

  console.log(`\n👥 Found ${students.length} students:`);
  students.forEach((student, index) => {
    console.log(`\n${index + 1}. Student: ${student.full_name}`);
    console.log(`   National ID: "${student.national_id}"`);
    console.log(`   Parent ID: ${student.parent_id}`);
    console.log(`   Parent: ${student.parents?.full_name || 'N/A'}`);
    console.log(`   Parent Phone: "${student.parents?.phone || 'N/A'}"`);
    console.log(`   Class: ${student.classes?.name || 'N/A'}`);
  });

  // Now let's test the exact query from the API
  console.log('\n\n🧪 Testing API Query Logic:');
  
  const testCases = [
    { national_id: '2234567890', phone: '09123456789' },
    { national_id: '2234567891', phone: '09123456790' },
    { national_id: '1363721012', phone: '09143607301' }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: National ID "${testCase.national_id}", Phone "${testCase.phone}"`);
    
    // Step 1: Find student by national_id
    const { data: studentData, error: studentError } = await supabase
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
        ),
        classes (
          id,
          name
        )
      `)
      .eq('national_id', testCase.national_id)
      .single();

    if (studentError) {
      console.log(`   ❌ Student not found: ${studentError.message}`);
      continue;
    }

    console.log(`   ✅ Student found: ${studentData.full_name}`);
    console.log(`   📞 Parent phone in DB: "${studentData.parents?.phone}"`);
    console.log(`   📞 Phone to match: "${testCase.phone}"`);
    console.log(`   🔍 Phone match: ${studentData.parents?.phone === testCase.phone}`);

    // Check if parent phone matches
    if (studentData.parents?.phone === testCase.phone) {
      console.log(`   ✅ Login should succeed!`);
    } else {
      console.log(`   ❌ Phone mismatch - login should fail`);
    }
  }

  console.log('\n🎉 Debug completed!');
}

debugLogin();