require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Fixing RLS Policies for Parent Dashboard ===');

const supabase = createClient(supabaseUrl, serviceKey);

async function fixRLSPolicies() {
  try {
    console.log('1. Disabling RLS for students table...');
    
    // Disable RLS for students table
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE students DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.error('Error disabling RLS:', disableError);
    } else {
      console.log('✓ RLS disabled for students table');
    }
    
    console.log('2. Creating anonymous access policy...');
    
    // Create policy for anonymous access
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow anonymous read access to students" ON students;
        CREATE POLICY "Allow anonymous read access to students" ON students 
        FOR SELECT USING (true);
      `
    });
    
    if (policyError) {
      console.error('Error creating policy:', policyError);
    } else {
      console.log('✓ Anonymous access policy created');
    }
    
    console.log('3. Testing access with anonymous key...');
    
    // Test with anonymous key
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: testData, error: testError } = await anonSupabase
      .from('students')
      .select('id, full_name, national_id')
      .eq('id', '05844e89-fd29-4d4e-8694-0dceb41907d2')
      .maybeSingle();
    
    console.log('Test result:');
    console.log('Data:', testData);
    console.log('Error:', testError);
    
    if (testData) {
      console.log('✓ Anonymous access is working!');
    } else {
      console.log('✗ Anonymous access still not working');
    }
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

fixRLSPolicies().catch(console.error);