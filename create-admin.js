// اسکریپت ایجاد کاربر ادمین
// برای اجرا: node create-admin.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ متغیرهای محیطی SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY را تنظیم کنید');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const adminEmail = 'admin@school.com';
  const adminPassword = 'admin123';
  const adminFullName = 'مدیر سیستم';

  try {
    console.log('🔄 در حال ایجاد کاربر ادمین...');

    // ایجاد کاربر در Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      user_metadata: {
        role: 'admin',
        full_name: adminFullName
      },
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  کاربر ادمین قبلاً ایجاد شده است');
        
        // بروزرسانی نقش کاربر موجود
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(user => user.email === adminEmail);
        
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                role: 'admin',
                full_name: adminFullName
              }
            }
          );
          
          if (updateError) {
            console.error('❌ خطا در بروزرسانی نقش کاربر:', updateError.message);
          } else {
            console.log('✅ نقش کاربر به ادمین بروزرسانی شد');
          }
        }
        
        return;
      }
      
      console.error('❌ خطا در ایجاد کاربر:', authError.message);
      return;
    }

    console.log('✅ کاربر ادمین با موفقیت ایجاد شد!');
    console.log('📧 ایمیل:', adminEmail);
    console.log('🔑 رمز عبور:', adminPassword);
    console.log('👤 نام:', adminFullName);
    console.log('🆔 شناسه کاربر:', authData.user.id);
    
    console.log('\n🎉 اکنون می‌توانید با این اطلاعات وارد پنل مدیریت شوید:');
    console.log('🌐 آدرس: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ خطای غیرمنتظره:', error.message);
  }
}

// اجرای اسکریپت
createAdminUser();