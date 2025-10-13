require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  console.log('=== Checking Parents Data ===');
  const { data: parents, error: parentsError } = await supabase
    .from('parents')
    .select('*');
  
  if (parentsError) {
    console.error('Parents Error:', parentsError);
  } else {
    console.log('Parents found:', parents.length);
    parents.forEach(parent => {
      console.log(`- ID: ${parent.id}, Name: ${parent.full_name}, Phone: ${parent.phone}`);
    });
  }

  console.log('\n=== Checking Students Data ===');
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*');
  
  if (studentsError) {
    console.error('Students Error:', studentsError);
  } else {
    console.log('Students found:', students.length);
    students.forEach(student => {
      console.log(`- ID: ${student.id}, Name: ${student.full_name}, National ID: ${student.national_id}, Parent ID: ${student.parent_id}`);
    });
  }

  console.log('\n=== Test Login Data ===');
  console.log('Try these credentials:');
  if (parents && parents.length > 0) {
    parents.forEach(parent => {
      const relatedStudents = students?.filter(s => s.parent_id === parent.id) || [];
      if (relatedStudents.length > 0) {
        relatedStudents.forEach(student => {
          console.log(`Parent Phone: ${parent.phone} + Student National ID: ${student.national_id} (${student.full_name})`);
        });
      }
    });
  }
}

checkData().catch(console.error);