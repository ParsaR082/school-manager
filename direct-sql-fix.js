require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDirectSQLFix() {
  console.log('🔧 Applying RLS policies directly...\n');

  const policies = [
    {
      name: 'Allow anonymous login access to students',
      sql: `DROP POLICY IF EXISTS "Allow anonymous login access to students" ON students;
            CREATE POLICY "Allow anonymous login access to students" ON students FOR SELECT USING (true);`
    },
    {
      name: 'Allow anonymous login access to parents', 
      sql: `DROP POLICY IF EXISTS "Allow anonymous login access to parents" ON parents;
            CREATE POLICY "Allow anonymous login access to parents" ON parents FOR SELECT USING (true);`
    },
    {
      name: 'Allow anonymous login access to classes',
      sql: `DROP POLICY IF EXISTS "Allow anonymous login access to classes" ON classes;
            CREATE POLICY "Allow anonymous login access to classes" ON classes FOR SELECT USING (true);`
    }
  ];

  for (const policy of policies) {
    console.log(`📝 Applying: ${policy.name}`);
    
    try {
      // Use the raw SQL execution method
      const { error } = await supabase
        .from('_dummy_table_that_does_not_exist')
        .select('*')
        .limit(0);
      
      // Since we can't execute raw SQL directly, let's try a different approach
      // We'll create a simple function to test if policies exist
      
      console.log('   ⚠️ Cannot execute raw SQL via Supabase client');
      
    } catch (error) {
      console.log('   ⚠️ Expected error for SQL execution');
    }
  }

  // Let's test if we can access data with anon key now
  console.log('\n🧪 Testing current anonymous access...');
  
  const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    const { data: students, error: testError } = await anonClient
      .from('students')
      .select(`
        id,
        full_name,
        national_id,
        parents (
          id,
          full_name,
          phone
        )
      `)
      .limit(3);
    
    if (testError) {
      console.log('❌ Anonymous access blocked:', testError.message);
      console.log('\n💡 Solution: You need to manually run this SQL in your Supabase dashboard:');
      console.log('');
      policies.forEach(policy => {
        console.log(policy.sql);
        console.log('');
      });
    } else {
      console.log(`✅ Anonymous access works! Found ${students.length} students`);
      if (students.length > 0) {
        students.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.full_name} (${student.national_id}) - Parent: ${student.parents?.full_name}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

applyDirectSQLFix();