const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase environment variables not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  try {
    // Check if tables exist and their structure
    console.log('📋 Checking tables...');
    
    // Try to get table info using information_schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`
      });

    if (tablesError) {
      console.log('Cannot use exec_sql, trying direct table access...');
      
      // Try direct access to each table
      const tablesToCheck = ['classes', 'subjects', 'parents', 'students', 'grades'];
      
      for (const tableName of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`❌ Table '${tableName}': ${error.message}`);
          } else {
            console.log(`✅ Table '${tableName}': accessible`);
          }
        } catch (err) {
          console.log(`❌ Table '${tableName}': ${err.message}`);
        }
      }
    } else {
      console.log('Available tables:', tables);
    }

    // Try to insert a simple test record to parents table
    console.log('\n🧪 Testing parents table structure...');
    
    const testParent = {
      full_name: 'Test Parent',
      phone: '09999999999'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('parents')
      .insert([testParent])
      .select();

    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      
      // Try with different field names
      console.log('\n🔄 Trying alternative field names...');
      
      const alternativeFields = [
        { name: 'Test Parent', phone: '09999999999' },
        { fullname: 'Test Parent', phone: '09999999999' },
        { full_name: 'Test Parent', mobile: '09999999999' }
      ];

      for (const fields of alternativeFields) {
        const { error: altError } = await supabase
          .from('parents')
          .insert([fields])
          .select();
        
        if (!altError) {
          console.log('✅ Success with fields:', Object.keys(fields));
          break;
        } else {
          console.log(`❌ Failed with fields ${Object.keys(fields).join(', ')}: ${altError.message}`);
        }
      }
    } else {
      console.log('✅ Insert successful:', insertResult);
      
      // Clean up test record
      if (insertResult && insertResult[0]) {
        await supabase
          .from('parents')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🧹 Test record cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();