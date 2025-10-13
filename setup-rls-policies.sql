-- حذف policies موجود
DROP POLICY IF EXISTS "Allow anonymous read access to classes" ON classes;
DROP POLICY IF EXISTS "Allow anonymous read access to subjects" ON subjects;
DROP POLICY IF EXISTS "Allow anonymous read access to parents" ON parents;
DROP POLICY IF EXISTS "Allow anonymous read access to students" ON students;
DROP POLICY IF EXISTS "Allow anonymous read access to grades" ON grades;

-- فعال کردن RLS روی جداول
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- ایجاد policies جدید برای دسترسی خواندن عمومی
CREATE POLICY "Allow anonymous read access to classes" ON classes
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to subjects" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to parents" ON parents
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to students" ON students
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to grades" ON grades
    FOR SELECT USING (true);

-- اجازه دسترسی کامل برای service role
CREATE POLICY "Allow service role full access to classes" ON classes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to subjects" ON subjects
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to parents" ON parents
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to students" ON students
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to grades" ON grades
    FOR ALL USING (auth.role() = 'service_role');