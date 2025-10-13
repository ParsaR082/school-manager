const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  console.log('Environment variables:');
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    // Test with service role key
    console.log('\n🔑 Testing with service role key...');
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('classes')
      .select('*')
      .limit(1);
      
    if (serviceError) {
      console.error('❌ Service role error:', serviceError);
    } else {
      console.log('✅ Service role connection successful');
      console.log('Classes data:', serviceData);
    }
    
    // Test with anon key
    console.log('\n🔓 Testing with anon key...');
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('classes')
      .select('*')
      .limit(1);
      
    if (anonError) {
      console.error('❌ Anon key error:', anonError);
    } else {
      console.log('✅ Anon key connection successful');
      console.log('Classes data:', anonData);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();