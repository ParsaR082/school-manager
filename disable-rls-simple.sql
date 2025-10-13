-- Disable RLS for students table to allow anonymous access
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Also disable for other tables that might be needed
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Parents can view their children" ON students;
DROP POLICY IF EXISTS "Admins can manage students" ON students;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('students', 'classes', 'subjects', 'grades');