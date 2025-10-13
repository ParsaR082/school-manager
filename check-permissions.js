require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Supabase permissions...\n');

async function checkPermissions() {
  // Test with anon key (what the API uses)
  console.log('📋 Testing with ANON key (API access):');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: anonStudents, error: anonError } = await anonClient
      .from('students')
      .select('*')
      .limit(5);
    
    if (anonError) {
      console.log('   ❌ Anon access failed:', anonError.message);
    } else {
      console.log(`   ✅ Anon access works - found ${anonStudents.length} students`);
    }
  } catch (error) {
    console.log('   ❌ Anon access error:', error.message);
  }

  // Test with service key (what setup scripts use)
  console.log('\n📋 Testing with SERVICE key (setup access):');
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: serviceStudents, error: serviceError } = await serviceClient
      .from('students')
      .select('*')
      .limit(5);
    
    if (serviceError) {
      console.log('   ❌ Service access failed:', serviceError.message);
    } else {
      console.log(`   ✅ Service access works - found ${serviceStudents.length} students`);
      
      // Show some sample data
      if (serviceStudents.length > 0) {
        console.log('\n   📄 Sample students:');
        serviceStudents.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.full_name} (${student.national_id})`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Service access error:', error.message);
  }

  // Check parents table too
  console.log('\n📋 Testing parents table with SERVICE key:');
  try {
    const { data: parents, error: parentsError } = await serviceClient
      .from('parents')
      .select('*')
      .limit(5);
    
    if (parentsError) {
      console.log('   ❌ Parents access failed:', parentsError.message);
    } else {
      console.log(`   ✅ Parents access works - found ${parents.length} parents`);
      
      if (parents.length > 0) {
        console.log('\n   📄 Sample parents:');
        parents.forEach((parent, index) => {
          console.log(`   ${index + 1}. ${parent.full_name} (${parent.phone})`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Parents access error:', error.message);
  }
}

checkPermissions();