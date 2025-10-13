-- Migration to support multiple grades per month
-- Add grade_number field to allow multiple grades per student/subject/month

-- First, drop the unique constraint that prevents multiple grades per month
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_student_id_subject_id_month_school_year_key;

-- Add grade_number column (1-10 for up to 10 grades per month)
ALTER TABLE grades ADD COLUMN IF NOT EXISTS grade_number SMALLINT NOT NULL DEFAULT 1 
    CHECK (grade_number >= 1 AND grade_number <= 10);

-- Create new unique constraint that includes grade_number
ALTER TABLE grades ADD CONSTRAINT grades_student_subject_month_year_number_unique 
    UNIQUE(student_id, subject_id, month, school_year, grade_number);

-- Add index for better performance when querying by month and grade_number
CREATE INDEX IF NOT EXISTS idx_grades_month_grade_number 
    ON grades(student_id, subject_id, month, school_year, grade_number);

-- Add comment to explain the new structure
COMMENT ON COLUMN grades.grade_number IS 'Grade number within the month (1-10), allows multiple grades per subject per month';