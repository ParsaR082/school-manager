// Database types for the school management system

export interface Class {
  id: string;
  name: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  created_at: string;
}

export interface SubjectClass {
  id: string;
  subject_id: string;
  class_id: string;
  created_at: string;
  subject?: Subject;
  class?: Class;
}

export interface Parent {
  id: string;
  full_name: string;
  phone: string;
  auth_user_id?: string;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  national_id: string;
  parent_id: string;
  class_id: string;
  created_at: string;
  parent?: Parent;
  class?: Class;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  month: number;
  school_year: number;
  score: number;
  created_by: string;
  created_at: string;
  student?: Student;
  subject?: Subject;
}

// Form types
export interface CreateClassForm {
  name: string;
}

export interface CreateSubjectForm {
  name: string;
}

export interface CreateStudentForm {
  full_name: string;
  national_id: string;
  parent_full_name: string;
  parent_phone: string;
  class_id: string;
}

export interface CreateGradeForm {
  student_id: string;
  subject_id: string;
  month: number;
  school_year: number;
  score: number;
}

// Utility types
export interface MonthlyGrades {
  [subjectId: string]: {
    subject_name: string;
    grades: {
      [month: number]: number | null;
    };
    average: number | null;
  };
}

export interface StudentGradeReport {
  student: Student;
  grades: MonthlyGrades;
}

// Persian month names
export const PERSIAN_MONTHS = {
  7: 'مهر',
  8: 'آبان', 
  9: 'آذر',
  10: 'دی',
  11: 'بهمن',
  12: 'اسفند',
  1: 'فروردین',
  2: 'اردیبهشت',
  3: 'خرداد'
} as const;

export type SchoolMonth = keyof typeof PERSIAN_MONTHS;