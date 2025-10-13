require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyLoginFix() {
  console.log('🔧 Applying RLS fix for parent login...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-rls-for-login.sql', 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Failed to apply RLS fix:', error);
      
      // Try alternative approach - execute each statement separately
      console.log('🔄 Trying alternative approach...');
      
      const statements = [
        `CREATE POLICY "Allow anonymous login access to students" ON students FOR SELECT USING (true);`,
        `CREATE POLICY "Allow anonymous login access to parents" ON parents FOR SELECT USING (true);`,
        `CREATE POLICY "Allow anonymous login access to classes" ON classes FOR SELECT USING (true);`
      ];
      
      for (const statement of statements) {
        console.log(`Executing: ${statement}`);
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
        if (stmtError) {
          console.log(`   ⚠️ Error (might be expected if policy exists): ${stmtError.message}`);
        } else {
          console.log('   ✅ Success');
        }
      }
    } else {
      console.log('✅ RLS fix applied successfully!');
    }

    // Test if the fix worked
    console.log('\n🧪 Testing anonymous access after fix...');
    
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
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
      console.log('❌ Anonymous access still blocked:', testError.message);
    } else {
      console.log(`✅ Anonymous access works! Found ${students.length} students`);
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.full_name} (${student.national_id}) - Parent: ${student.parents?.full_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error applying fix:', error);
  }
}

applyLoginFix();