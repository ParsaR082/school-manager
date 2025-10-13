const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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
  console.log('🚀 Setting up database...\n');

  try {
    // Step 1: Create tables using schema.sql
    console.log('📋 Creating tables...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL commands and execute them
    const commands = schemaSQL.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: command.trim() + ';' });
        if (error && !error.message.includes('already exists')) {
          console.error('Schema error:', error);
        }
      }
    }
    
    console.log('✅ Tables created successfully');

    // Step 2: Insert sample data
    console.log('\n📊 Inserting sample data...');
    
    // Insert classes
    const { error: classError } = await supabase
      .from('classes')
      .upsert([
        { name: 'اول ابتدایی', description: 'کلاس اول دوره ابتدایی' },
        { name: 'دوم ابتدایی', description: 'کلاس دوم دوره ابتدایی' },
        { name: 'سوم ابتدایی', description: 'کلاس سوم دوره ابتدایی' },
        { name: 'چهارم ابتدایی', description: 'کلاس چهارم دوره ابتدایی' },
        { name: 'پنجم ابتدایی', description: 'کلاس پنجم دوره ابتدایی' },
        { name: 'ششم ابتدایی', description: 'کلاس ششم دوره ابتدایی' }
      ], { onConflict: 'name' });

    if (classError) {
      console.error('Classes error:', classError);
    } else {
      console.log('✅ Classes inserted');
    }

    // Insert subjects
    const { error: subjectError } = await supabase
      .from('subjects')
      .upsert([
        { name: 'ریاضی', description: 'درس ریاضیات' },
        { name: 'فارسی', description: 'زبان و ادبیات فارسی' },
        { name: 'علوم', description: 'علوم تجربی' },
        { name: 'مطالعات اجتماعی', description: 'تاریخ و جغرافیا' },
        { name: 'عربی', description: 'زبان عربی' },
        { name: 'انگلیسی', description: 'زبان انگلیسی' },
        { name: 'تربیت بدنی', description: 'ورزش و تربیت بدنی' },
        { name: 'هنر', description: 'هنرهای تجسمی و کاردستی' }
      ], { onConflict: 'name' });

    if (subjectError) {
      console.error('Subjects error:', subjectError);
    } else {
      console.log('✅ Subjects inserted');
    }

    // Insert parents
    const { data: parents, error: parentError } = await supabase
      .from('parents')
      .upsert([
        { full_name: 'احمد محمدی', national_id: '1234567890', phone: '09123456789', email: 'ahmad.mohammadi@email.com' },
        { full_name: 'فاطمه احمدی', national_id: '1234567891', phone: '09123456790', email: 'fatemeh.ahmadi@email.com' },
        { full_name: 'علی رضایی', national_id: '1234567892', phone: '09123456791', email: 'ali.rezaei@email.com' },
        { full_name: 'مریم کریمی', national_id: '1234567893', phone: '09123456792', email: 'maryam.karimi@email.com' },
        { full_name: 'حسن موسوی', national_id: '1234567894', phone: '09123456793', email: 'hasan.mousavi@email.com' },
        { full_name: 'زینب صادقی', national_id: '1234567895', phone: '09123456794', email: 'zeinab.sadeghi@email.com' }
      ], { onConflict: 'national_id' })
      .select();

    if (parentError) {
      console.error('Parents error:', parentError);
    } else {
      console.log('✅ Parents inserted');
    }

    // Get classes for student insertion
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name');

    // Insert students
    if (parents && classes) {
      const studentsData = [
        { full_name: 'محمد احمدی', national_id: '2234567890', parent_id: parents[0].id, class_id: classes.find(c => c.name === 'سوم ابتدایی')?.id, birth_date: '2015-07-10' },
        { full_name: 'زهرا احمدی', national_id: '2234567891', parent_id: parents[1].id, class_id: classes.find(c => c.name === 'دوم ابتدایی')?.id, birth_date: '2016-05-20' },
        { full_name: 'حسین رضایی', national_id: '2234567892', parent_id: parents[2].id, class_id: classes.find(c => c.name === 'اول ابتدایی')?.id, birth_date: '2017-03-15' },
        { full_name: 'سارا کریمی', national_id: '2234567893', parent_id: parents[3].id, class_id: classes.find(c => c.name === 'چهارم ابتدایی')?.id, birth_date: '2014-02-12' },
        { full_name: 'امیر موسوی', national_id: '2234567894', parent_id: parents[4].id, class_id: classes.find(c => c.name === 'پنجم ابتدایی')?.id, birth_date: '2013-09-08' },
        { full_name: 'فاطمه صادقی', national_id: '2234567895', parent_id: parents[5].id, class_id: classes.find(c => c.name === 'ششم ابتدایی')?.id, birth_date: '2012-11-25' }
      ];

      const { error: studentError } = await supabase
        .from('students')
        .upsert(studentsData, { onConflict: 'national_id' });

      if (studentError) {
        console.error('Students error:', studentError);
      } else {
        console.log('✅ Students inserted');
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Test login credentials:');
    console.log('Student ID: 2234567890, Parent Phone: 09123456789 (محمد احمدی)');
    console.log('Student ID: 2234567891, Parent Phone: 09123456790 (زهرا احمدی)');
    console.log('Student ID: 2234567892, Parent Phone: 09123456791 (حسین رضایی)');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();