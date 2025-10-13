const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغیرهای محیطی Supabase یافت نشد!');
  console.log('مطمئن شوید که فایل .env.local دارای این متغیرها باشد:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeDbCheck() {
    console.log('🔍 شروع بررسی کامل دیتابیس...\n');
    
    try {
        // 1. بررسی ساختار جدول parents
        console.log('📋 بررسی ساختار جدول parents:');
        const { data: parentsData, error: parentsError } = await supabase
            .from('parents')
            .select('*')
            .limit(1);
        
        if (parentsError) {
            console.log('❌ خطا در دسترسی به جدول parents:', parentsError.message);
        } else {
            console.log('✅ جدول parents در دسترس است');
            if (parentsData && parentsData.length > 0) {
                console.log('📊 فیلدهای موجود در parents:', Object.keys(parentsData[0]));
                console.log('📄 نمونه رکورد parents:', parentsData[0]);
            } else {
                console.log('⚠️ جدول parents خالی است');
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 2. بررسی ساختار جدول students
        console.log('📋 بررسی ساختار جدول students:');
        const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .limit(1);
        
        if (studentsError) {
            console.log('❌ خطا در دسترسی به جدول students:', studentsError.message);
        } else {
            console.log('✅ جدول students در دسترس است');
            if (studentsData && studentsData.length > 0) {
                console.log('📊 فیلدهای موجود در students:', Object.keys(studentsData[0]));
                console.log('📄 نمونه رکورد students:', studentsData[0]);
            } else {
                console.log('⚠️ جدول students خالی است');
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 3. بررسی تعداد رکوردها
        console.log('📊 بررسی تعداد رکوردها:');
        
        const { count: parentsCount } = await supabase
            .from('parents')
            .select('*', { count: 'exact', head: true });
        console.log(`👥 تعداد والدین: ${parentsCount}`);
        
        const { count: studentsCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });
        console.log(`🎓 تعداد دانش‌آموزان: ${studentsCount}`);
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 4. بررسی رابطه بین جداول
        console.log('🔗 بررسی رابطه بین جداول:');
        const { data: joinData, error: joinError } = await supabase
            .from('students')
            .select(`
                id,
                full_name,
                national_id,
                parent_id,
                parents (
                    id,
                    full_name,
                    phone,
                    auth_user_id
                )
            `)
            .limit(3);
        
        if (joinError) {
            console.log('❌ خطا در JOIN:', joinError.message);
        } else {
            console.log('✅ JOIN موفق بود');
            console.log('📄 نمونه داده‌های مرتبط:');
            joinData.forEach((student, index) => {
                console.log(`\n${index + 1}. دانش‌آموز: ${student.full_name}`);
                console.log(`   کد ملی: ${student.national_id}`);
                console.log(`   والد: ${student.parents?.full_name || 'نامشخص'}`);
                console.log(`   تلفن والد: ${student.parents?.phone || 'نامشخص'}`);
            });
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 5. تست کوئری مشابه API
        console.log('🧪 تست کوئری مشابه API:');
        const testNationalId = '1363721011';
        const testPhone = '09143607301';
        
        console.log(`🔍 جستجو برای کد ملی: ${testNationalId} و تلفن: ${testPhone}`);
        
        const { data: apiTestData, error: apiTestError } = await supabase
            .from('students')
            .select(`
                id,
                full_name,
                national_id,
                parent_id,
                class_id,
                parents!inner (
                    id,
                    full_name,
                    phone
                )
            `)
            .eq('national_id', testNationalId)
            .eq('parents.phone', testPhone);
        
        if (apiTestError) {
            console.log('❌ خطا در تست API:', apiTestError.message);
        } else {
            console.log('✅ کوئری API موفق بود');
            console.log('📊 تعداد نتایج:', apiTestData.length);
            if (apiTestData.length > 0) {
                console.log('📄 نتیجه:', apiTestData[0]);
            } else {
                console.log('⚠️ هیچ نتیجه‌ای یافت نشد');
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 6. بررسی دقیق داده‌های تست
        console.log('🔍 بررسی دقیق داده‌های تست:');
        
        // جستجوی دانش‌آموز
        const { data: studentCheck } = await supabase
            .from('students')
            .select('*')
            .eq('national_id', testNationalId);
        
        console.log(`👤 دانش‌آموز با کد ملی ${testNationalId}:`, studentCheck);
        
        if (studentCheck && studentCheck.length > 0) {
            const student = studentCheck[0];
            // جستجوی والد
            const { data: parentCheck } = await supabase
                .from('parents')
                .select('*')
                .eq('id', student.parent_id);
            
            console.log(`👨‍👩‍👧‍👦 والد با ID ${student.parent_id}:`, parentCheck);
            
            if (parentCheck && parentCheck.length > 0) {
                const parent = parentCheck[0];
                console.log(`📞 تلفن والد در دیتابیس: "${parent.phone}"`);
                console.log(`📞 تلفن تست: "${testPhone}"`);
                console.log(`🔍 مقایسه تلفن: ${parent.phone === testPhone ? '✅ برابر' : '❌ نابرابر'}`);
                console.log(`📏 طول تلفن دیتابیس: ${parent.phone.length}`);
                console.log(`📏 طول تلفن تست: ${testPhone.length}`);
            }
        }
        
    } catch (error) {
        console.error('❌ خطای کلی:', error);
    }
}

completeDbCheck();