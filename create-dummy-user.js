require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDummyUser() {
  console.log('🔧 ایجاد کاربر dummy برای created_by...\n');

  try {
    // ایجاد کاربر dummy در auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'dummy@test.com',
      password: 'dummy123456',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'کاربر تست'
      }
    });

    if (authError) {
      console.error('❌ خطا در ایجاد کاربر dummy:', authError);
      return null;
    }

    console.log('✅ کاربر dummy ایجاد شد:', authUser.user.id);
    return authUser.user.id;

  } catch (error) {
    console.error('❌ خطای عمومی:', error);
    return null;
  }
}

module.exports = { createDummyUser };

// اگر فایل مستقیماً اجرا شود
if (require.main === module) {
  createDummyUser();
}