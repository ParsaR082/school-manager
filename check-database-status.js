require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// بررسی با service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// بررسی با anon key
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabaseStatus() {
  console.log('🔍 بررسی وضعیت کامل دیتابیس...\n');

  const tables = ['classes', 'subjects', 'parents', 'students', 'grades'];

  console.log('📊 بررسی با Service Role Key:');
  console.log('=====================================');
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`❌ ${table}: خطا - ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} رکورد`);
        if (data && data.length > 0) {
          console.log(`   نمونه: ${JSON.stringify(data[0], null, 2).substring(0, 100)}...`);
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: خطای اتصال - ${err.message}`);
    }
  }

  console.log('\n📊 بررسی با Anon Key:');
  console.log('=====================================');
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabaseAnon
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`❌ ${table}: خطا - ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} رکورد قابل دسترس`);
      }
    } catch (err) {
      console.log(`❌ ${table}: خطای اتصال - ${err.message}`);
    }
  }

  // بررسی RLS policies
  console.log('\n🔒 بررسی RLS Policies:');
  console.log('=====================================');
  
  try {
    const { data: policies, error } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE schemaname = 'public' 
          ORDER BY tablename, policyname;
        `
      });

    if (error) {
      console.log('❌ خطا در دریافت policies:', error.message);
    } else if (policies && policies.length > 0) {
      console.log(`✅ ${policies.length} policy موجود:`);
      policies.forEach(policy => {
        console.log(`   ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
    } else {
      console.log('⚠️ هیچ RLS policy موجود نیست');
    }
  } catch (err) {
    console.log('❌ خطا در بررسی policies:', err.message);
  }
}

checkDatabaseStatus();