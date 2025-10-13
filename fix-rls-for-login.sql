-- Add policy to allow anonymous access for parent login
-- This allows the login API to query students and parents without authentication

-- Allow anonymous users to read students for login purposes
CREATE POLICY "Allow anonymous login access to students" ON students
  FOR SELECT USING (true);

-- Allow anonymous users to read parents for login purposes  
CREATE POLICY "Allow anonymous login access to parents" ON parents
  FOR SELECT USING (true);

-- Allow anonymous users to read classes for login response
CREATE POLICY "Allow anonymous login access to classes" ON classes
  FOR SELECT USING (true);