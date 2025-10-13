require('dotenv').config({ path: '.env.local' });

async function testDirectAPI() {
  console.log('🧪 تست مستقیم API احراز هویت والدین...\n');

  const apiUrl = 'http://localhost:3000/api/parent/auth';
  
  const testCases = [
    {
      name: 'تست والد موجود - علی احمدی',
      data: {
        phone: '09123456789',
        national_id: '1234567801'
      }
    },
    {
      name: 'تست والد موجود - زهرا احمدی',
      data: {
        phone: '09123456790',
        national_id: '1234567802'
      }
    },
    {
      name: 'تست شماره نامعتبر',
      data: {
        phone: '09999999999',
        national_id: '1234567801'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}:`);
    console.log(`   📞 تلفن: ${testCase.data.phone}`);
    console.log(`   🆔 کد ملی: ${testCase.data.national_id}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ موفق: ${result.message || 'ورود موفق'}`);
        if (result.student) {
          console.log(`   🎓 دانش‌آموز: ${result.student.full_name}`);
          console.log(`   📊 تعداد نمرات: ${result.grades ? result.grades.length : 0}`);
        }
      } else {
        console.log(`   ❌ خطا: ${result.error || result.message}`);
      }
    } catch (error) {
      console.log(`   ❌ خطای اتصال: ${error.message}`);
    }
    
    console.log('');
  }
}

testDirectAPI();