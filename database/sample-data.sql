-- Sample Data for School Management System
-- Run this after the main schema.sql has been executed

-- First, let's create some subject-class relationships
-- Get class and subject IDs and create relationships
WITH class_ids AS (
    SELECT id, name FROM classes
),
subject_ids AS (
    SELECT id, name FROM subjects
)
INSERT INTO subject_classes (subject_id, class_id)
SELECT s.id, c.id
FROM subject_ids s
CROSS JOIN class_ids c
WHERE 
    -- All classes have these core subjects
    s.name IN ('ریاضی', 'فارسی', 'علوم', 'تربیت بدنی', 'هنر')
    OR 
    -- Higher grades have additional subjects
    (c.name IN ('چهارم ابتدایی', 'پنجم ابتدایی', 'ششم ابتدایی') AND s.name IN ('مطالعات اجتماعی', 'عربی'))
    OR
    -- Only 6th grade has English
    (c.name = 'ششم ابتدایی' AND s.name = 'انگلیسی')
ON CONFLICT (subject_id, class_id) DO NOTHING;

-- Insert sample students
WITH class_data AS (
    SELECT id as class_id, name as class_name FROM classes
),
parent_data AS (
    SELECT id as parent_id, full_name as parent_name, national_id FROM parents
)
INSERT INTO students (full_name, national_id, class_id, parent_id, birth_date)
SELECT 
    CASE 
        WHEN p.national_id = '1234567890' THEN 'محمد احمدی'
        WHEN p.national_id = '1234567891' THEN 'زهرا احمدی'
        WHEN p.national_id = '1234567892' THEN 'حسین رضایی'
    END as full_name,
    CASE 
        WHEN p.national_id = '1234567890' THEN '2234567890'
        WHEN p.national_id = '1234567891' THEN '2234567891'
        WHEN p.national_id = '1234567892' THEN '2234567892'
    END as national_id,
    c.class_id,
    p.parent_id,
    CASE 
        WHEN c.class_name = 'اول ابتدایی' THEN '2017-03-15'::date
        WHEN c.class_name = 'دوم ابتدایی' THEN '2016-05-20'::date
        WHEN c.class_name = 'سوم ابتدایی' THEN '2015-07-10'::date
    END as birth_date
FROM parent_data p
CROSS JOIN class_data c
WHERE 
    (p.national_id = '1234567890' AND c.class_name = 'سوم ابتدایی')
    OR (p.national_id = '1234567891' AND c.class_name = 'دوم ابتدایی')
    OR (p.national_id = '1234567892' AND c.class_name = 'اول ابتدایی')
ON CONFLICT (national_id) DO NOTHING;

-- Insert sample grades for the current school year (1403)
-- This will create grades for each student in their respective subjects
WITH student_subject_data AS (
    SELECT 
        s.id as student_id,
        s.full_name as student_name,
        sub.id as subject_id,
        sub.name as subject_name,
        c.name as class_name
    FROM students s
    JOIN classes c ON s.class_id = c.id
    JOIN subject_classes sc ON c.id = sc.class_id
    JOIN subjects sub ON sc.subject_id = sub.id
)
INSERT INTO grades (student_id, subject_id, score, month, school_year, created_by)
SELECT 
    ssd.student_id,
    ssd.subject_id,
    -- Generate realistic grades between 12-20
    CASE 
        WHEN ssd.subject_name = 'ریاضی' THEN 
            CASE 
                WHEN months.month IN (1,2,3) THEN 16.5 + (RANDOM() * 2)
                WHEN months.month IN (4,5,6) THEN 17.0 + (RANDOM() * 2)
                ELSE 15.5 + (RANDOM() * 3)
            END
        WHEN ssd.subject_name = 'فارسی' THEN 17.0 + (RANDOM() * 2.5)
        WHEN ssd.subject_name = 'علوم' THEN 16.0 + (RANDOM() * 3)
        WHEN ssd.subject_name = 'مطالعات اجتماعی' THEN 15.5 + (RANDOM() * 3.5)
        WHEN ssd.subject_name = 'عربی' THEN 14.0 + (RANDOM() * 4)
        WHEN ssd.subject_name = 'انگلیسی' THEN 15.0 + (RANDOM() * 4)
        WHEN ssd.subject_name = 'تربیت بدنی' THEN 18.0 + (RANDOM() * 2)
        WHEN ssd.subject_name = 'هنر' THEN 17.5 + (RANDOM() * 2.5)
        ELSE 15.0 + (RANDOM() * 4)
    END as score,
    months.month,
    1403 as school_year,
    'معلم نمونه' as created_by
FROM student_subject_data ssd
CROSS JOIN (
    SELECT generate_series(1, 8) as month  -- Months 1-8 (مهر to اردیبهشت)
) months
WHERE 
    -- Only create grades for months that have passed or current month
    months.month <= 8
ON CONFLICT (student_id, subject_id, month, school_year) DO NOTHING;

-- Add some additional sample parents and students for testing
INSERT INTO parents (full_name, national_id, phone, email) VALUES
    ('مریم کریمی', '1234567893', '09123456792', 'maryam.karimi@email.com'),
    ('حسن موسوی', '1234567894', '09123456793', 'hasan.mousavi@email.com'),
    ('زینب صادقی', '1234567895', '09123456794', 'zeinab.sadeghi@email.com')
ON CONFLICT (national_id) DO NOTHING;

-- Add more students for different classes
WITH new_parent_data AS (
    SELECT id as parent_id, national_id FROM parents 
    WHERE national_id IN ('1234567893', '1234567894', '1234567895')
),
class_data AS (
    SELECT id as class_id, name as class_name FROM classes
)
INSERT INTO students (full_name, national_id, class_id, parent_id, birth_date)
SELECT 
    CASE 
        WHEN p.national_id = '1234567893' THEN 'سارا کریمی'
        WHEN p.national_id = '1234567894' THEN 'امیر موسوی'
        WHEN p.national_id = '1234567895' THEN 'فاطمه صادقی'
    END as full_name,
    CASE 
        WHEN p.national_id = '1234567893' THEN '2234567893'
        WHEN p.national_id = '1234567894' THEN '2234567894'
        WHEN p.national_id = '1234567895' THEN '2234567895'
    END as national_id,
    c.class_id,
    p.parent_id,
    CASE 
        WHEN c.class_name = 'چهارم ابتدایی' THEN '2014-02-12'::date
        WHEN c.class_name = 'پنجم ابتدایی' THEN '2013-09-08'::date
        WHEN c.class_name = 'ششم ابتدایی' THEN '2012-11-25'::date
    END as birth_date
FROM new_parent_data p
CROSS JOIN class_data c
WHERE 
    (p.national_id = '1234567893' AND c.class_name = 'چهارم ابتدایی')
    OR (p.national_id = '1234567894' AND c.class_name = 'پنجم ابتدایی')
    OR (p.national_id = '1234567895' AND c.class_name = 'ششم ابتدایی')
ON CONFLICT (national_id) DO NOTHING;

-- Add grades for the new students
WITH new_student_subject_data AS (
    SELECT 
        s.id as student_id,
        s.full_name as student_name,
        sub.id as subject_id,
        sub.name as subject_name,
        c.name as class_name
    FROM students s
    JOIN classes c ON s.class_id = c.id
    JOIN subject_classes sc ON c.id = sc.class_id
    JOIN subjects sub ON sc.subject_id = sub.id
    WHERE s.national_id IN ('2234567893', '2234567894', '2234567895')
)
INSERT INTO grades (student_id, subject_id, score, month, school_year, created_by)
SELECT 
    nssd.student_id,
    nssd.subject_id,
    -- Generate realistic grades with some variation
    CASE 
        WHEN nssd.subject_name = 'ریاضی' THEN 15.0 + (RANDOM() * 4)
        WHEN nssd.subject_name = 'فارسی' THEN 16.5 + (RANDOM() * 3)
        WHEN nssd.subject_name = 'علوم' THEN 15.5 + (RANDOM() * 3.5)
        WHEN nssd.subject_name = 'مطالعات اجتماعی' THEN 16.0 + (RANDOM() * 3)
        WHEN nssd.subject_name = 'عربی' THEN 14.5 + (RANDOM() * 4)
        WHEN nssd.subject_name = 'انگلیسی' THEN 15.5 + (RANDOM() * 3.5)
        WHEN nssd.subject_name = 'تربیت بدنی' THEN 17.5 + (RANDOM() * 2.5)
        WHEN nssd.subject_name = 'هنر' THEN 17.0 + (RANDOM() * 2.5)
        ELSE 15.0 + (RANDOM() * 4)
    END as score,
    months.month,
    1403 as school_year,
    'معلم نمونه' as created_by
FROM new_student_subject_data nssd
CROSS JOIN (
    SELECT generate_series(1, 8) as month
) months
ON CONFLICT (student_id, subject_id, month, school_year) DO NOTHING;

-- Create a view for easier grade reporting
CREATE OR REPLACE VIEW grade_report AS
SELECT 
    s.full_name as student_name,
    s.national_id as student_national_id,
    c.name as class_name,
    sub.name as subject_name,
    g.score,
    g.month,
    g.school_year,
    p.full_name as parent_name,
    p.national_id as parent_national_id,
    p.phone as parent_phone,
    g.created_by,
    g.created_at
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN classes c ON s.class_id = c.id
JOIN subjects sub ON g.subject_id = sub.id
JOIN parents p ON s.parent_id = p.id
ORDER BY s.full_name, g.school_year DESC, g.month DESC, sub.name;

-- Create a view for student averages
CREATE OR REPLACE VIEW student_averages AS
SELECT 
    s.id as student_id,
    s.full_name as student_name,
    s.national_id as student_national_id,
    c.name as class_name,
    g.school_year,
    ROUND(AVG(g.score), 2) as overall_average,
    COUNT(g.id) as total_grades,
    p.full_name as parent_name,
    p.national_id as parent_national_id
FROM students s
JOIN classes c ON s.class_id = c.id
JOIN parents p ON s.parent_id = p.id
LEFT JOIN grades g ON s.id = g.student_id
GROUP BY s.id, s.full_name, s.national_id, c.name, g.school_year, p.full_name, p.national_id
ORDER BY s.full_name, g.school_year DESC;

-- Display summary of inserted data
SELECT 'Data Summary' as info;
SELECT COUNT(*) as total_classes FROM classes;
SELECT COUNT(*) as total_subjects FROM subjects;
SELECT COUNT(*) as total_parents FROM parents;
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_grades FROM grades;
SELECT COUNT(*) as total_subject_class_relations FROM subject_classes;