const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTables() {
  console.log('🔍 Inspecting table structures...\n');

  const tables = ['parents', 'students', 'classes', 'subjects'];

  for (const tableName of tables) {
    console.log(`📋 Table: ${tableName}`);
    
    try {
      // Get a sample record to see the structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log('✅ Sample record structure:');
        console.log('   Fields:', Object.keys(data[0]).join(', '));
        console.log('   Sample:', data[0]);
      } else {
        // Try inserting a minimal record to see required fields
        console.log('📝 Table is empty, testing minimal insert...');
        
        let testRecord = {};
        if (tableName === 'parents') {
          testRecord = { full_name: 'Test' };
        } else if (tableName === 'students') {
          testRecord = { full_name: 'Test Student' };
        } else if (tableName === 'classes') {
          testRecord = { name: 'Test Class' };
        } else if (tableName === 'subjects') {
          testRecord = { name: 'Test Subject' };
        }

        const { data: insertData, error: insertError } = await supabase
          .from(tableName)
          .insert([testRecord])
          .select();

        if (insertError) {
          console.log(`❌ Insert error: ${insertError.message}`);
        } else {
          console.log('✅ Insert successful, structure:');
          console.log('   Fields:', Object.keys(insertData[0]).join(', '));
          
          // Clean up
          await supabase
            .from(tableName)
            .delete()
            .eq('id', insertData[0].id);
          console.log('🧹 Test record cleaned up');
        }
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

inspectTables();