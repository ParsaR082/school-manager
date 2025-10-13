require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  console.log('🧹 Clearing database...');

  try {
    // Clear in order to avoid foreign key constraints
    console.log('Clearing students...');
    const { error: studentsError } = await supabase
      .from('students')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (studentsError) {
      console.error('Students clear error:', studentsError);
    } else {
      console.log('✅ Students cleared');
    }

    console.log('Clearing parents...');
    const { error: parentsError } = await supabase
      .from('parents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (parentsError) {
      console.error('Parents clear error:', parentsError);
    } else {
      console.log('✅ Parents cleared');
    }

    console.log('Clearing classes...');
    const { error: classesError } = await supabase
      .from('classes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (classesError) {
      console.error('Classes clear error:', classesError);
    } else {
      console.log('✅ Classes cleared');
    }

    console.log('Clearing subjects...');
    const { error: subjectsError } = await supabase
      .from('subjects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (subjectsError) {
      console.error('Subjects clear error:', subjectsError);
    } else {
      console.log('✅ Subjects cleared');
    }

    console.log('🎉 Database cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

clearDatabase();