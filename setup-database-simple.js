const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase environment variables not found!');
  console.log('Make sure you have .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up database with sample data...\n');

  try {
    // Step 1: Insert classes (only name field)
    console.log('📋 Inserting classes...');
    const { error: classError } = await supabase
      .from('classes')
      .upsert([
        { name: 'اول ابتدایی' },
        { name: 'دوم ابتدایی' },
        { name: 'سوم ابتدایی' },
        { name: 'چهارم ابتدایی' },
        { name: 'پنجم ابتدایی' },
        { name: 'ششم ابتدایی' }
      ], { onConflict: 'name' });

    if (classError) {
      console.error('Classes error:', classError);
    } else {
      console.log('✅ Classes inserted');
    }

    // Step 2: Insert subjects (only name field)
    console.log('\n📚 Inserting subjects...');
    const { error: subjectError } = await supabase
      .from('subjects')
      .upsert([
        { name: 'ریاضی' },
        { name: 'فارسی' },
        { name: 'علوم' },
        { name: 'مطالعات اجتماعی' },
        { name: 'عربی' },
        { name: 'انگلیسی' },
        { name: 'تربیت بدنی' },
        { name: 'هنر' }
      ], { onConflict: 'name' });

    if (subjectError) {
      console.error('Subjects error:', subjectError);
    } else {
      console.log('✅ Subjects inserted');
    }

    // Step 3: Insert parents (without national_id field)
    console.log('\n👨‍👩‍👧‍👦 Inserting parents...');
    const { data: parents, error: parentError } = await supabase
      .from('parents')
      .insert([
        { full_name: 'احمد محمدی', phone: '09123456789' },
        { full_name: 'فاطمه احمدی', phone: '09123456790' },
        { full_name: 'علی رضایی', phone: '09123456791' },
        { full_name: 'مریم کریمی', phone: '09123456792' },
        { full_name: 'حسن موسوی', phone: '09123456793' },
        { full_name: 'زینب صادقی', phone: '09123456794' },
        { full_name: 'محمد حسینی', phone: '09143607301' }
      ])
      .select();

    if (parentError) {
      console.error('Parents error:', parentError);
      return;
    } else {
      console.log('✅ Parents inserted');
    }

    // Step 4: Get classes for student insertion
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name');

    // Step 5: Insert students
    console.log('\n👨‍🎓 Inserting students...');
    if (parents && classes) {
      const studentsData = [
        { 
          full_name: 'محمد احمدی', 
          national_id: '2234567890', 
          parent_id: parents[0].id, 
          class_id: classes.find(c => c.name === 'سوم ابتدایی')?.id
        },
        { 
          full_name: 'زهرا احمدی', 
          national_id: '2234567891', 
          parent_id: parents[1].id, 
          class_id: classes.find(c => c.name === 'دوم ابتدایی')?.id
        },
        { 
          full_name: 'حسین رضایی', 
          national_id: '2234567892', 
          parent_id: parents[2].id, 
          class_id: classes.find(c => c.name === 'اول ابتدایی')?.id
        },
        { 
          full_name: 'سارا کریمی', 
          national_id: '2234567893', 
          parent_id: parents[3].id, 
          class_id: classes.find(c => c.name === 'چهارم ابتدایی')?.id
        },
        { 
          full_name: 'امیر موسوی', 
          national_id: '2234567894', 
          parent_id: parents[4].id, 
          class_id: classes.find(c => c.name === 'پنجم ابتدایی')?.id
        },
        { 
          full_name: 'فاطمه صادقی', 
          national_id: '2234567895', 
          parent_id: parents[5].id, 
          class_id: classes.find(c => c.name === 'ششم ابتدایی')?.id
        },
        { 
          full_name: 'علی حسینی', 
          national_id: '1363721012', 
          parent_id: parents[6].id, 
          class_id: classes.find(c => c.name === 'سوم ابتدایی')?.id
        }
      ];

      const { error: studentError } = await supabase
        .from('students')
        .insert(studentsData);

      if (studentError) {
        console.error('Students error:', studentError);
      } else {
        console.log('✅ Students inserted');
      }
    }

    // Step 5: Verify data
    console.log('\n🔍 Verifying data...');
    const { count: parentCount } = await supabase
      .from('parents')
      .select('*', { count: 'exact', head: true });
    
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    const { count: classCount } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Data verification:`);
    console.log(`   - Classes: ${classCount || 0}`);
    console.log(`   - Parents: ${parentCount || 0}`);
    console.log(`   - Students: ${studentCount || 0}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Test login credentials:');
    console.log('Username (Student National ID): 2234567890');
    console.log('Password (Parent Phone): 09123456789');
    console.log('Student: محمد احمدی, Parent: احمد محمدی');
    console.log('');
    console.log('Username (Student National ID): 2234567891');
    console.log('Password (Parent Phone): 09123456790');
    console.log('Student: زهرا احمدی, Parent: فاطمه احمدی');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();