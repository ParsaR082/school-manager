// Test the new parent login API
// const fetch = require('node-fetch'); // Commented out - Node.js 18+ has built-in fetch

const BASE_URL = 'http://localhost:3000';

async function testLogin(studentId, parentPhone, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`Student ID: ${studentId}, Parent Phone: ${parentPhone}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/parent/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_national_id: studentId,
        parent_phone: parentPhone
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);

    // Check for session cookie if login successful
    if (response.status === 200) {
      const cookies = response.headers.get('set-cookie');
      console.log('Cookies set:', cookies ? 'Yes' : 'No');
      
      // Test the verify endpoint
      if (cookies) {
        console.log('Testing verify endpoint...');
        const verifyResponse = await fetch(`${BASE_URL}/api/parent/verify`, {
          headers: {
            'Cookie': cookies
          }
        });
        const verifyData = await verifyResponse.json();
        console.log(`Verify Status: ${verifyResponse.status}`);
        console.log('Verify Response:', verifyData);
      }
    }

    return response.status === 200;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Parent Login API\n');
  
  // Test with valid credentials from our test data
  await testLogin('1234567890', '09123456789', 'Valid credentials - محمد احمدی & احمد محمدی');
  await testLogin('1234567891', '09123456790', 'Valid credentials - زهرا احمدی & فاطمه احمدی');
  await testLogin('1234567892', '09123456791', 'Valid credentials - حسین رضایی & علی رضایی');
  
  // Test with invalid credentials
  await testLogin('9999999999', '09123456789', 'Invalid student ID');
  await testLogin('1234567890', '09999999999', 'Invalid parent phone');
  
  // Test with empty fields
  await testLogin('', '09123456789', 'Empty student ID');
  await testLogin('1234567890', '', 'Empty parent phone');
  
  // Test with invalid formats
  await testLogin('123', '09123456789', 'Invalid student ID format');
  await testLogin('1234567890', '123', 'Invalid parent phone format');
  
  console.log('\n✅ All tests completed!');
}

runTests();