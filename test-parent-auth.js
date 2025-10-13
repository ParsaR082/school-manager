// استفاده از fetch داخلی Node.js (نسخه 18+)

async function testParentAuth() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 تست API ورود والدین جدید...\n');

  // تست‌های مختلف
  const testCases = [
    {
      name: 'تست موفق - علی احمدی',
      data: {
        phone: '09123456789',
        national_id: '1234567801'
      },
      expectedSuccess: true
    },
    {
      name: 'تست موفق - زهرا احمدی',
      data: {
        phone: '09123456790',
        national_id: '1234567802'
      },
      expectedSuccess: true
    },
    {
      name: 'تست موفق - حسین رضایی',
      data: {
        phone: '09123456791',
        national_id: '1234567803'
      },
      expectedSuccess: true
    },
    {
      name: 'تست خطا - شماره تلفن نامعتبر',
      data: {
        phone: '09999999999',
        national_id: '1234567801'
      },
      expectedSuccess: false
    },
    {
      name: 'تست خطا - کد ملی نامعتبر',
      data: {
        phone: '09123456789',
        national_id: '9999999999'
      },
      expectedSuccess: false
    },
    {
      name: 'تست خطا - عدم تطابق والد و دانش‌آموز',
      data: {
        phone: '09123456791',
        national_id: '1234567801'
      },
      expectedSuccess: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    console.log(`   📞 تلفن: ${testCase.data.phone}`);
    console.log(`   🆔 کد ملی: ${testCase.data.national_id}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/parent/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (testCase.expectedSuccess) {
        if (result.success) {
          console.log(`   ✅ موفق: ${result.message}`);
          console.log(`   👤 والد: ${result.data.parent.full_name}`);
          console.log(`   🎓 دانش‌آموز: ${result.data.student.full_name}`);
          console.log(`   📊 تعداد نمرات: ${result.data.grades.length}`);
          
          if (result.data.grades.length > 0) {
            console.log(`   📚 نمونه نمره: ${result.data.grades[0].subject?.name || 'نامشخص'} - ${result.data.grades[0].score}`);
          }
        } else {
          console.log(`   ❌ خطای غیرمنتظره: ${result.error}`);
        }
      } else {
        if (!result.success) {
          console.log(`   ✅ خطای مورد انتظار: ${result.error}`);
        } else {
          console.log(`   ❌ باید خطا می‌داد اما موفق شد!`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ خطای شبکه: ${error.message}`);
    }
    
    console.log('');
  }
}

// اجرای تست
testParentAuth().catch(console.error);