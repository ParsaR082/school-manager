-- School Management System Database Schema
-- Created for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subject-Classes relationship table
CREATE TABLE subject_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subject_id, class_id)
);

-- 4. Parents table
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    national_id VARCHAR(10) NOT NULL UNIQUE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Grades table
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month >= 7 AND month <= 12 OR month >= 1 AND month <= 3),
    school_year INTEGER NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 20),
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id, month, school_year)
);

-- Create indexes for better performance
CREATE INDEX idx_subject_classes_subject_id ON subject_classes(subject_id);
CREATE INDEX idx_subject_classes_class_id ON subject_classes(class_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_national_id ON students(national_id);
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
CREATE INDEX idx_grades_school_year ON grades(school_year);
CREATE INDEX idx_parents_auth_user_id ON parents(auth_user_id);

-- Insert sample data for testing
INSERT INTO classes (name) VALUES 
    ('دهم تجربی ۱'),
    ('دهم تجربی ۲'),
    ('یازدهم ریاضی ۱'),
    ('دوازدهم انسانی ۱');

INSERT INTO subjects (name) VALUES 
    ('ریاضی ۱'),
    ('فیزیک'),
    ('شیمی'),
    ('زیست‌شناسی'),
    ('زبان انگلیسی'),
    ('ادبیات فارسی'),
    ('تاریخ'),
    ('جغرافیا');

-- Sample subject-class assignments
INSERT INTO subject_classes (subject_id, class_id) 
SELECT s.id, c.id 
FROM subjects s, classes c 
WHERE s.name IN ('ریاضی ۱', 'فیزیک', 'شیمی', 'زیست‌شناسی', 'زبان انگلیسی', 'ادبیات فارسی') 
AND c.name LIKE '%تجربی%';

INSERT INTO subject_classes (subject_id, class_id) 
SELECT s.id, c.id 
FROM subjects s, classes c 
WHERE s.name IN ('ریاضی ۱', 'زبان انگلیسی', 'ادبیات فارسی') 
AND c.name LIKE '%ریاضی%';

INSERT INTO subject_classes (subject_id, class_id) 
SELECT s.id, c.id 
FROM subjects s, classes c 
WHERE s.name IN ('تاریخ', 'جغرافیا', 'زبان انگلیسی', 'ادبیات فارسی') 
AND c.name LIKE '%انسانی%';

-- Enable Row Level Security (RLS)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be added in a separate step after authentication setup