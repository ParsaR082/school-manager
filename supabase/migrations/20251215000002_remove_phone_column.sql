-- Remove phone column from parents table
-- This migration removes the phone column as authentication will now be based on 
-- the last 6 digits of student's national ID

-- First, drop any policies that reference the phone column
DROP POLICY IF EXISTS "Parents can update their own record" ON parents;

-- Remove the phone column from parents table
ALTER TABLE parents DROP COLUMN IF EXISTS phone;

-- Update the handle_new_user function to not include phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create parent record if role is 'parent'
  IF NEW.raw_user_meta_data ->> 'role' = 'parent' THEN
    INSERT INTO public.parents (auth_user_id, full_name)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'full_name'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the parent update policy without phone reference
CREATE POLICY "Parents can update their own record" ON parents
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'parent' AND 
    auth_user_id = auth.uid()
  );