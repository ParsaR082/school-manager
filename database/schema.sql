-- School Management System Database Schema
-- This file contains the SQL commands to set up the database structure in Supabase

-- Enable Row Level Security (RLS) for all tables
-- This ensures data security and proper access control

-- 1. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Subject-Class Relationship Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS subject_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, class_id)
);

-- 4. Parents Table
CREATE TABLE IF NOT EXISTS parents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(10) NOT NULL UNIQUE,
    phone VARCHAR(11) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(10) NOT NULL UNIQUE,
    birth_date DATE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE RESTRICT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    score DECIMAL(4,2) NOT NULL CHECK (score >= 0 AND score <= 20),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    school_year INTEGER NOT NULL CHECK (school_year >= 1400 AND school_year <= 1450),
    created_by VARCHAR(100) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one grade per student per subject per month per year
    UNIQUE(student_id, subject_id, month, school_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_school_year ON grades(school_year);
CREATE INDEX IF NOT EXISTS idx_grades_month ON grades(month);
CREATE INDEX IF NOT EXISTS idx_subject_classes_subject_id ON subject_classes(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_classes_class_id ON subject_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_parents_national_id ON parents(national_id);
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- For now, we'll create permissive policies for development
-- In production, these should be more restrictive

-- Classes policies
CREATE POLICY "Allow all operations on classes" ON classes
    FOR ALL USING (true) WITH CHECK (true);

-- Subjects policies
CREATE POLICY "Allow all operations on subjects" ON subjects
    FOR ALL USING (true) WITH CHECK (true);

-- Subject-Classes policies
CREATE POLICY "Allow all operations on subject_classes" ON subject_classes
    FOR ALL USING (true) WITH CHECK (true);

-- Parents policies
CREATE POLICY "Allow all operations on parents" ON parents
    FOR ALL USING (true) WITH CHECK (true);

-- Students policies
CREATE POLICY "Allow all operations on students" ON students
    FOR ALL USING (true) WITH CHECK (true);

-- Grades policies
CREATE POLICY "Allow all operations on grades" ON grades
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for testing
-- Classes
INSERT INTO classes (name, description) VALUES
    ('اول ابتدایی', 'کلاس اول دوره ابتدایی'),
    ('دوم ابتدایی', 'کلاس دوم دوره ابتدایی'),
    ('سوم ابتدایی', 'کلاس سوم دوره ابتدایی'),
    ('چهارم ابتدایی', 'کلاس چهارم دوره ابتدایی'),
    ('پنجم ابتدایی', 'کلاس پنجم دوره ابتدایی'),
    ('ششم ابتدایی', 'کلاس ششم دوره ابتدایی')
ON CONFLICT (name) DO NOTHING;

-- Subjects
INSERT INTO subjects (name, description) VALUES
    ('ریاضی', 'درس ریاضیات'),
    ('فارسی', 'زبان و ادبیات فارسی'),
    ('علوم', 'علوم تجربی'),
    ('مطالعات اجتماعی', 'تاریخ و جغرافیا'),
    ('عربی', 'زبان عربی'),
    ('انگلیسی', 'زبان انگلیسی'),
    ('تربیت بدنی', 'ورزش و تربیت بدنی'),
    ('هنر', 'هنرهای تجسمی و کاردستی')
ON CONFLICT (name) DO NOTHING;

-- Sample Parents
INSERT INTO parents (full_name, national_id, phone, email) VALUES
    ('احمد محمدی', '1234567890', '09123456789', 'ahmad.mohammadi@email.com'),
    ('فاطمه احمدی', '1234567891', '09123456790', 'fatemeh.ahmadi@email.com'),
    ('علی رضایی', '1234567892', '09123456791', 'ali.rezaei@email.com')
ON CONFLICT (national_id) DO NOTHING;

-- Sample Students (you'll need to get the actual UUIDs from the inserted classes and parents)
-- This is just a template - actual insertion should be done with proper UUID references

-- Note: To complete the sample data insertion, you would need to:
-- 1. Get the UUIDs of the inserted classes and parents
-- 2. Insert students with proper foreign key references
-- 3. Create subject-class relationships
-- 4. Insert sample grades

-- Example of how to get UUIDs and insert students:
-- WITH class_data AS (SELECT id FROM classes WHERE name = 'اول ابتدایی'),
--      parent_data AS (SELECT id FROM parents WHERE national_id = '1234567890')
-- INSERT INTO students (full_name, national_id, class_id, parent_id)
-- SELECT 'محمد احمدی', '2234567890', class_data.id, parent_data.id
-- FROM class_data, parent_data;

-- Remember to run this schema in your Supabase SQL editor
-- and adjust the sample data as needed for your specific requirements.