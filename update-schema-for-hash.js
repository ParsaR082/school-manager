const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSchemaForHash() {
  console.log('🔧 تغییر ساختار جدول برای پشتیبانی از هش...\n');

  try {
    // تغییر نوع ستون national_id از VARCHAR(10) به TEXT
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE students 
        ALTER COLUMN national_id TYPE TEXT;
      `
    });

    if (error) {
      console.error('❌ خطا در تغییر ساختار جدول:', error);
      
      // روش جایگزین: استفاده از SQL مستقیم
      console.log('🔄 تلاش با روش مستقیم...');
      
      const { error: directError } = await supabase
        .from('students')
        .select('id')
        .limit(1);

      if (directError) {
        console.error('❌ خطا در اتصال:', directError);
        return;
      }

      console.log('⚠️ نمی‌توان ساختار جدول را از طریق API تغییر داد.');
      console.log('💡 لطفاً دستور SQL زیر را در Supabase Dashboard اجرا کنید:');
      console.log('');
      console.log('ALTER TABLE students ALTER COLUMN national_id TYPE TEXT;');
      console.log('');
      return;
    }

    console.log('✅ ساختار جدول با موفقیت تغییر یافت.');
    
  } catch (error) {
    console.error('❌ خطای کلی:', error);
    console.log('💡 لطفاً دستور SQL زیر را در Supabase Dashboard اجرا کنید:');
    console.log('');
    console.log('ALTER TABLE students ALTER COLUMN national_id TYPE TEXT;');
    console.log('');
  }
}

// اجرای اسکریپت
updateSchemaForHash();