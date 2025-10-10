import { supabase, supabaseAdmin } from './supabase';
import { Class, Subject, Student, Parent, Grade, SubjectClass } from './types';

// Classes CRUD operations
export async function getClasses() {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createClass(classData: Omit<Class, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateClass(id: string, classData: Partial<Class>) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .update(classData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteClass(id: string) {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Subjects CRUD operations
export async function getSubjects() {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createSubject(subjectData: Omit<Subject, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateSubject(id: string, subjectData: Partial<Subject>) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update(subjectData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteSubject(id: string) {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Subject-Class assignments
export async function getSubjectClasses(classId?: string, subjectId?: string) {
  try {
    let query = supabase
      .from('subject_classes')
      .select(`
        *,
        classes(name),
        subjects(name)
      `);
    
    if (classId) query = query.eq('class_id', classId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    
    const { data, error } = await query.order('created_at');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function assignSubjectToClass(subjectId: string, classId: string) {
  try {
    const { data, error } = await supabase
      .from('subject_classes')
      .insert([{ subject_id: subjectId, class_id: classId }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function removeSubjectFromClass(subjectId: string, classId: string) {
  try {
    const { error } = await supabase
      .from('subject_classes')
      .delete()
      .eq('subject_id', subjectId)
      .eq('class_id', classId);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Students CRUD operations
export async function getStudents(classId?: string) {
  try {
    let query = supabase
      .from('students')
      .select(`
        *,
        classes(name),
        parents(full_name, email)
      `);
    
    if (classId) query = query.eq('class_id', classId);
    
    const { data, error } = await query.order('full_name');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createStudent(studentData: Omit<Student, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateStudent(id: string, studentData: Partial<Student>) {
  try {
    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteStudent(id: string) {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Parents CRUD operations
export async function getParents() {
  try {
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createParent(parentData: Omit<Parent, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('parents')
      .insert([parentData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Grades CRUD operations
export async function getGrades(studentId?: string, subjectId?: string, month?: number, year?: number) {
  try {
    let query = supabase
      .from('grades')
      .select(`
        *,
        students(full_name),
        subjects(name)
      `);
    
    if (studentId) query = query.eq('student_id', studentId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createGrade(gradeData: Omit<Grade, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('grades')
      .insert([gradeData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateGrade(id: string, gradeData: Partial<Grade>) {
  try {
    const { data, error } = await supabase
      .from('grades')
      .update(gradeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteGrade(id: string) {
  try {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Get student grades report
export async function getStudentGradesReport(studentId: string, year: number) {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        subjects(name)
      `)
      .eq('student_id', studentId)
      .eq('year', year)
      .order('month');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}