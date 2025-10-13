require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRLSPolicies() {
  console.log('🔒 اعمال RLS Policies...\n');

  try {
    // خواندن فایل SQL
    const sqlContent = fs.readFileSync('setup-rls-policies.sql', 'utf8');
    
    // تقسیم دستورات SQL
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 اجرای ${sqlCommands.length} دستور SQL...\n`);

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      console.log(`${i + 1}. اجرای: ${command.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command
        });

        if (error) {
          console.log(`   ❌ خطا: ${error.message}`);
        } else {
          console.log(`   ✅ موفق`);
        }
      } catch (err) {
        console.log(`   ❌ خطای اجرا: ${err.message}`);
      }
    }

    // تست دسترسی با anon key
    console.log('\n🧪 تست دسترسی با anon key...');
    
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const tables = ['classes', 'subjects', 'parents', 'students', 'grades'];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabaseAnon
          .from(table)
          .select('*', { count: 'exact' });

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count || 0} رکورد قابل دسترس`);
        }
      } catch (err) {
        console.log(`❌ ${table}: خطای اتصال - ${err.message}`);
      }
    }

    // تست خاص برای والدین
    console.log('\n🔍 تست جستجوی والد خاص...');
    try {
      const { data: parent, error } = await supabaseAnon
        .from('parents')
        .select('*')
        .eq('phone', '09123456789')
        .single();

      if (error) {
        console.log('❌ خطا در جستجوی والد:', error.message);
      } else {
        console.log('✅ والد پیدا شد:', parent.full_name);
      }
    } catch (err) {
      console.log('❌ خطای جستجوی والد:', err.message);
    }

  } catch (error) {
    console.error('❌ خطای عمومی:', error.message);
  }
}

applyRLSPolicies();