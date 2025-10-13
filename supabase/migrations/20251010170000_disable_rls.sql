-- Disable RLS for all tables to allow anonymous access
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous read access to classes" ON classes;
DROP POLICY IF EXISTS "Allow anonymous read access to subjects" ON subjects;
DROP POLICY IF EXISTS "Allow anonymous read access to parents" ON parents;
DROP POLICY IF EXISTS "Allow anonymous read access to students" ON students;
DROP POLICY IF EXISTS "Allow anonymous read access to grades" ON grades;

DROP POLICY IF EXISTS "Allow service role full access to classes" ON classes;
DROP POLICY IF EXISTS "Allow service role full access to subjects" ON subjects;
DROP POLICY IF EXISTS "Allow service role full access to parents" ON parents;
DROP POLICY IF EXISTS "Allow service role full access to students" ON students;
DROP POLICY IF EXISTS "Allow service role full access to grades" ON grades;