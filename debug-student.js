require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Debugging Student Data Access ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!serviceKey);
console.log('Anon Key exists:', !!anonKey);

async function testWithServiceKey() {
  console.log('\n--- Testing with Service Key ---');
  const supabase = createClient(supabaseUrl, serviceKey);
  
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, national_id')
      .limit(5);
    
    console.log('Service Key Query Result:');
    console.log('Data:', students);
    console.log('Error:', error);
    
    if (students && students.length > 0) {
      console.log('Found students:', students.map(s => ({ id: s.id, name: s.name })));
    }
    
    // Test specific student ID
    const { data: specificStudent, error: specificError } = await supabase
      .from('students')
      .select('*')
      .eq('id', '05844e89-fd29-4d4e-8694-0dceb41907d2')
      .maybeSingle();
    
    console.log('Specific student query:');
    console.log('Data:', specificStudent);
    console.log('Error:', specificError);
    
  } catch (err) {
    console.error('Service key error:', err);
  }
}

async function testWithAnonKey() {
  console.log('\n--- Testing with Anonymous Key ---');
  const supabase = createClient(supabaseUrl, anonKey);
  
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, national_id')
      .limit(5);
    
    console.log('Anonymous Key Query Result:');
    console.log('Data:', students);
    console.log('Error:', error);
    
    // Test specific student ID
    const { data: specificStudent, error: specificError } = await supabase
      .from('students')
      .select('*')
      .eq('id', '05844e89-fd29-4d4e-8694-0dceb41907d2')
      .maybeSingle();
    
    console.log('Specific student query with anon key:');
    console.log('Data:', specificStudent);
    console.log('Error:', specificError);
    
  } catch (err) {
    console.error('Anonymous key error:', err);
  }
}

async function main() {
  await testWithServiceKey();
  await testWithAnonKey();
}

main().catch(console.error);