-- RLS Policies for School Management System

-- Create policies for classes table
-- Admins can do everything
CREATE POLICY "Admins can manage classes" ON classes
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Parents can only view classes
CREATE POLICY "Parents can view classes" ON classes
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'parent'
  );

-- Create policies for subjects table
-- Admins can do everything
CREATE POLICY "Admins can manage subjects" ON subjects
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Parents can only view subjects
CREATE POLICY "Parents can view subjects" ON subjects
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'parent'
  );

-- Create policies for subject_classes table
-- Admins can do everything
CREATE POLICY "Admins can manage subject_classes" ON subject_classes
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Parents can only view subject_classes
CREATE POLICY "Parents can view subject_classes" ON subject_classes
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'parent'
  );

-- Create policies for parents table
-- Admins can do everything
CREATE POLICY "Admins can manage parents" ON parents
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Parents can only view and update their own record
CREATE POLICY "Parents can view their own record" ON parents
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'parent' AND 
    auth_user_id = auth.uid()
  );

CREATE POLICY "Parents can update their own record" ON parents
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'parent' AND 
    auth_user_id = auth.uid()
  );

-- Create policies for students table
-- Admins can do everything
CREATE POLICY "Admins can manage students" ON students
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Parents can only view their own children
CREATE POLICY "Parents can view their children" ON students
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'parent' AND 
    parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  );

-- Create policies for grades table
-- Admins can do everything
CREATE POLICY "Admins can manage grades" ON grades
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Parents can only view their children's grades
CREATE POLICY "Parents can view their children's grades" ON grades
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'parent' AND 
    student_id IN (
      SELECT s.id FROM students s
      JOIN parents p ON s.parent_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Create function to automatically create parent record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create parent record if role is 'parent'
  IF NEW.raw_user_meta_data ->> 'role' = 'parent' THEN
    INSERT INTO public.parents (auth_user_id, full_name, phone)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create parent record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;