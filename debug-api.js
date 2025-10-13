const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAPI() {
  console.log('🔍 Debugging API query...\n');

  try {
    // Test the exact query used in the API
    const national_id = '1363721011';
    const phone = '09143607301';

    console.log(`Testing with:`);
    console.log(`  Student National ID: ${national_id}`);
    console.log(`  Parent Phone: ${phone}\n`);

    // Step 1: Check if student exists
    console.log('📋 Step 1: Check if student exists...');
    const { data: studentCheck, error: studentError } = await supabase
      .from('students')
      .select('id, full_name, national_id, parent_id')
      .eq('national_id', national_id);

    if (studentError) {
      console.log('❌ Student query error:', studentError);
      return;
    }

    console.log('✅ Student query result:', studentCheck);

    if (!studentCheck || studentCheck.length === 0) {
      console.log('❌ No student found with this national_id');
      return;
    }

    const student = studentCheck[0];

    // Step 2: Check parent
    console.log('\n📋 Step 2: Check parent...');
    const { data: parentCheck, error: parentError } = await supabase
      .from('parents')
      .select('id, full_name, phone')
      .eq('id', student.parent_id);

    if (parentError) {
      console.log('❌ Parent query error:', parentError);
      return;
    }

    console.log('✅ Parent query result:', parentCheck);

    if (!parentCheck || parentCheck.length === 0) {
      console.log('❌ No parent found');
      return;
    }

    const parent = parentCheck[0];

    // Step 3: Check phone match
    console.log('\n📋 Step 3: Check phone match...');
    console.log(`  Parent phone in DB: "${parent.phone}"`);
    console.log(`  Input phone: "${phone}"`);
    console.log(`  Match: ${parent.phone === phone}`);

    // Step 4: Test the exact API query
    console.log('\n📋 Step 4: Test exact API query...');
    const { data: apiResult, error: apiError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        national_id,
        parent_id,
        parents!inner (
          id,
          full_name,
          phone
        )
      `)
      .eq('national_id', national_id)
      .eq('parents.phone', phone)
      .single();

    if (apiError) {
      console.log('❌ API query error:', apiError);
    } else {
      console.log('✅ API query successful:', apiResult);
    }

    // Step 5: Test without phone filter
    console.log('\n📋 Step 5: Test without phone filter...');
    const { data: noPhoneResult, error: noPhoneError } = await supabase
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
      .eq('national_id', national_id);

    if (noPhoneError) {
      console.log('❌ No phone filter query error:', noPhoneError);
    } else {
      console.log('✅ No phone filter query result:', noPhoneResult);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAPI();