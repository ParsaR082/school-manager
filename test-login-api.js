require('dotenv').config({ path: '.env.local' });

async function testParentLogin() {
  console.log('🧪 Testing Parent Login API...\n');

  const testCredentials = [
    {
      national_id: '2234567890',
      phone: '09123456789',
      description: 'محمد احمدی - احمد محمدی'
    },
    {
      national_id: '2234567891', 
      phone: '09123456790',
      description: 'زهرا احمدی - فاطمه احمدی'
    },
    {
      national_id: '1363721012',
      phone: '09143607301', 
      description: 'علی حسینی - محمد حسینی'
    }
  ];

  for (const cred of testCredentials) {
    console.log(`\n🔍 Testing: ${cred.description}`);
    console.log(`   National ID: ${cred.national_id}`);
    console.log(`   Phone: ${cred.phone}`);

    try {
      const response = await fetch('http://localhost:3000/api/auth/parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          national_id: cred.national_id,
          phone: cred.phone
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('   ✅ Login successful!');
        console.log(`   Student: ${result.student?.full_name}`);
        console.log(`   Parent: ${result.parent?.full_name}`);
        console.log(`   Class: ${result.student?.class?.name || 'N/A'}`);
      } else {
        console.log('   ❌ Login failed!');
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log('   ❌ Request failed!');
      console.log(`   Error: ${error.message}`);
    }
  }

  // Test with invalid credentials
  console.log('\n\n🔍 Testing invalid credentials:');
  try {
    const response = await fetch('http://localhost:3000/api/auth/parent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        national_id: '9999999999',
        phone: '09999999999'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('   ⚠️ Unexpected success with invalid credentials!');
    } else {
      console.log('   ✅ Correctly rejected invalid credentials');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('   ❌ Request failed!');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎉 Login API test completed!');
}

testParentLogin();