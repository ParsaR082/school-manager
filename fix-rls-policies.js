require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 تنظیم RLS policies برای دسترسی anonymous...\n');

  try {
    // حذف policies قدیمی (اگر وجود دارند)
    console.log('🗑️ حذف policies قدیمی...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Allow anonymous login access to students" ON students;',
      'DROP POLICY IF EXISTS "Allow anonymous login access to parents" ON parents;',
      'DROP POLICY IF EXISTS "Allow anonymous login access to classes" ON classes;',
      'DROP POLICY IF EXISTS "Allow anonymous login access to subjects" ON subjects;',
      'DROP POLICY IF EXISTS "Allow anonymous login access to grades" ON grades;'
    ];

    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.log(`   ⚠️ ${error.message}`);
      } else {
        console.log(`   ✅ Policy dropped`);
      }
    }

    // ایجاد policies جدید
    console.log('\n🔐 ایجاد policies جدید...');
    
    const createPolicies = [
      `CREATE POLICY "Allow anonymous read access to parents" ON parents FOR SELECT USING (true);`,
      `CREATE POLICY "Allow anonymous read access to students" ON students FOR SELECT USING (true);`,
      `CREATE POLICY "Allow anonymous read access to classes" ON classes FOR SELECT USING (true);`,
      `CREATE POLICY "Allow anonymous read access to subjects" ON subjects FOR SELECT USING (true);`,
      `CREATE POLICY "Allow anonymous read access to grades" ON grades FOR SELECT USING (true);`
    ];

    for (const policy of createPolicies) {
      console.log(`اجرای: ${policy}`);
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.log(`   ❌ خطا: ${error.message}`);
      } else {
        console.log(`   ✅ موفق`);
      }
    }

    console.log('\n🧪 تست دسترسی پس از تنظیم policies...');
    
    // تست با anon key
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: testParents, error: testError } = await anonClient
      .from('parents')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ هنوز مشکل دسترسی وجود دارد:', testError);
    } else {
      console.log('✅ دسترسی anonymous به والدین موفق است');
      console.log(`📊 تعداد والدین قابل دسترس: ${testParents.length}`);
    }

  } catch (error) {
    console.error('❌ خطای عمومی:', error);
  }
}

fixRLSPolicies();