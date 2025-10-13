require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLSPolicies() {
  console.log('🔒 بررسی RLS Policies موجود...\n');

  try {
    // بررسی policies با query مستقیم
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public');

    if (error) {
      console.log('❌ خطا در دریافت policies از pg_policies:', error.message);
      
      // تلاش با روش دیگر
      console.log('\n🔄 تلاش با query مستقیم...');
      
      const { data: directQuery, error: directError } = await supabase
        .rpc('sql', {
          query: `
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            ORDER BY tablename, policyname;
          `
        });

      if (directError) {
        console.log('❌ خطا در query مستقیم:', directError.message);
        
        // بررسی وضعیت RLS روی جداول
        console.log('\n📋 بررسی وضعیت RLS روی جداول:');
        const tables = ['classes', 'subjects', 'parents', 'students', 'grades'];
        
        for (const table of tables) {
          try {
            const { data: tableInfo, error: tableError } = await supabase
              .rpc('sql', {
                query: `
                  SELECT relname, relrowsecurity 
                  FROM pg_class 
                  WHERE relname = '${table}' AND relkind = 'r';
                `
              });

            if (tableError) {
              console.log(`❌ ${table}: خطا در بررسی - ${tableError.message}`);
            } else if (tableInfo && tableInfo.length > 0) {
              const rls_enabled = tableInfo[0].relrowsecurity;
              console.log(`${rls_enabled ? '🔒' : '🔓'} ${table}: RLS ${rls_enabled ? 'فعال' : 'غیرفعال'}`);
            }
          } catch (err) {
            console.log(`❌ ${table}: خطا - ${err.message}`);
          }
        }
      } else {
        console.log(`✅ ${directQuery.length} policy موجود:`);
        directQuery.forEach(policy => {
          console.log(`   ${policy.tablename}.${policy.policyname} (${policy.cmd}) - ${policy.roles}`);
        });
      }
    } else {
      console.log(`✅ ${policies.length} policy موجود:`);
      policies.forEach(policy => {
        console.log(`   ${policy.tablename}.${policy.policyname} (${policy.cmd}) - ${policy.roles}`);
      });
    }

  } catch (error) {
    console.error('❌ خطای عمومی:', error.message);
  }
}

checkRLSPolicies();