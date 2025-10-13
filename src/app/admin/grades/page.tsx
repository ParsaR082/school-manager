'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import type { Grade, Student, Subject, Class, SubjectClass } from '@/lib/types';
import { PERSIAN_MONTHS } from '@/lib/types';

const gradeSchema = z.object({
  student_id: z.string().min(1, 'انتخاب دانش‌آموز الزامی است'),
  subject_id: z.string().min(1, 'انتخاب درس الزامی است'),
  month: z.number().min(1).max(12),
  school_year: z.number().min(1400).max(1450),
  score: z.number().min(0, 'نمره نمی‌تواند منفی باشد').max(20, 'نمره نمی‌تواند بیشتر از ۲۰ باشد'),
});

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeWithDetails extends Grade {
  student?: Student & { class?: Class };
  subject?: Subject;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeWithDetails[]>([]);
  const [students, setStudents] = useState<(Student & { class?: Class })[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectClasses, setSubjectClasses] = useState<SubjectClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeWithDetails | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);

  const currentYear = 1403; // Current Persian year

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      school_year: currentYear,
    },
  });

  const selectedStudentId = watch('student_id');

  // Get the selected student's class
  const selectedStudent = students.find(student => student.id === selectedStudentId);
  const selectedStudentClassId = selectedStudent?.class_id;

  // Filter subjects based on selected student's class
  const filteredSubjects = selectedStudentClassId 
    ? subjects.filter(subject => {
        // Check if this subject is assigned to the student's class
        return subjectClasses.some(sc => 
          sc.subject_id === subject.id && sc.class_id === selectedStudentClassId
        );
      })
    : [];

  // Fetch grades
  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Fetch subject-class relationships
  const fetchSubjectClasses = async () => {
    try {
      const response = await fetch('/api/subject-classes');
      if (!response.ok) {
        throw new Error('Failed to fetch subject-classes');
      }
      const data = await response.json();
      setSubjectClasses(data || []);
    } catch (error) {
      console.error('Error fetching subject-classes:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGrades(), fetchStudents(), fetchSubjects(), fetchClasses(), fetchSubjectClasses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: GradeFormData) => {
    try {
      if (editingGrade) {
        // Update existing grade
        const response = await fetch('/api/grades', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingGrade.id,
            student_id: data.student_id,
            subject_id: data.subject_id,
            month: data.month,
            school_year: data.school_year,
            score: data.score,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update grade');
        }
      } else {
        // Create new grade
        const response = await fetch('/api/grades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: data.student_id,
            subject_id: data.subject_id,
            month: data.month,
            school_year: data.school_year,
            score: data.score,
            created_by: 'admin',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create grade');
        }
      }

      await fetchGrades();
      setIsModalOpen(false);
      setEditingGrade(null);
      reset({ school_year: currentYear });
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  // Handle delete
  const handleDelete = async (gradeId: string) => {
    if (!confirm('آیا از حذف این نمره اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/grades?id=${gradeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete grade');
      }

      await fetchGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  // Handle edit
  const handleEdit = (grade: GradeWithDetails) => {
    setEditingGrade(grade);
    reset({
      student_id: grade.student_id,
      subject_id: grade.subject_id,
      month: grade.month,
      school_year: grade.school_year,
      score: grade.score,
    });
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingGrade(null);
    reset({
      student_id: '',
      subject_id: '',
      month: 7, // Start of Persian school year (Mehr)
      school_year: currentYear,
      score: 0,
    });
    setIsModalOpen(true);
  };

  // Filter students by selected class
  const filteredStudents = selectedClass
    ? students.filter(student => student.class_id === selectedClass)
    : students;

  // Filter grades by selected class
  const filteredGrades = selectedClass
    ? grades.filter(grade => grade.student?.class?.id === selectedClass)
    : grades;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 persian-text">
            مدیریت نمرات
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 persian-text text-sm sm:text-base"
          >
            ثبت نمره جدید
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
            <label className="text-sm font-medium text-gray-700 persian-text">
              فیلتر بر اساس کلاس:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه کلاس‌ها</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile View */}
          <div className="block md:hidden">
            <div className="space-y-4 p-4">
              {filteredGrades.length === 0 ? (
                <div className="text-center text-gray-500 persian-text py-8">
                  هیچ نمره‌ای یافت نشد
                </div>
              ) : (
                filteredGrades.map((grade) => (
                  <div key={grade.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-900 persian-text text-sm">
                          {grade.student?.full_name}
                        </h3>
                        <p className="text-xs text-gray-500 persian-text">
                          کلاس: {grade.student?.class?.name}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        grade.score >= 12 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {grade.score}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 persian-text">درس: </span>
                        <span className="text-gray-900 persian-text">{grade.subject?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 persian-text">ماه: </span>
                        <span className="text-gray-900 persian-text">
                          {PERSIAN_MONTHS[grade.month as keyof typeof PERSIAN_MONTHS]}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 persian-text">سال تحصیلی: </span>
                        <span className="text-gray-900">{grade.school_year}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 space-x-reverse pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(grade)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors persian-text"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-xs font-medium hover:bg-red-100 transition-colors persian-text"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    دانش‌آموز
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    کلاس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    درس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    ماه
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    سال تحصیلی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    نمره
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 persian-text">
                      هیچ نمره‌ای یافت نشد
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 persian-text">
                        {grade.student?.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 persian-text">
                        {grade.student?.class?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 persian-text">
                        {grade.subject?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 persian-text">
                        {PERSIAN_MONTHS[grade.month as keyof typeof PERSIAN_MONTHS]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.school_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          grade.score >= 12 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {grade.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(grade)}
                            className="text-blue-600 hover:text-blue-900 persian-text"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="text-red-600 hover:text-red-900 persian-text"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-5 border w-full max-w-md sm:max-w-lg shadow-lg rounded-md bg-white m-4">
              <div className="mt-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 persian-text mb-4">
                  {editingGrade ? 'ویرایش نمره' : 'ثبت نمره جدید'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      دانش‌آموز
                    </label>
                    <select
                      {...register('student_id')}
                      className="form-input text-sm"
                    >
                      <option value="">انتخاب دانش‌آموز</option>
                      {filteredStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.full_name} - {student.class?.name}
                        </option>
                      ))}
                    </select>
                    {errors.student_id && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.student_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      درس
                    </label>
                    <select
                      {...register('subject_id')}
                      className="form-input text-sm"
                    >
                      <option value="">انتخاب درس</option>
                      {filteredSubjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    {errors.subject_id && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.subject_id.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                        ماه
                      </label>
                      <select
                        {...register('month', { valueAsNumber: true })}
                        className="form-input text-sm"
                      >
                        {Object.entries(PERSIAN_MONTHS).map(([month, name]) => (
                          <option key={month} value={parseInt(month)}>
                            {name}
                          </option>
                        ))}
                      </select>
                      {errors.month && (
                        <p className="mt-1 text-sm text-red-600 persian-text">
                          {errors.month.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                        سال تحصیلی
                      </label>
                      <input
                        type="number"
                        {...register('school_year', { valueAsNumber: true })}
                        className="form-input text-sm"
                        min="1400"
                        max="1450"
                      />
                      {errors.school_year && (
                        <p className="mt-1 text-sm text-red-600 persian-text">
                          {errors.school_year.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      نمره (از ۰ تا ۲۰)
                    </label>
                    <input
                      type="number"
                      {...register('score', { valueAsNumber: true })}
                      className="form-input text-sm"
                      min="0"
                      max="20"
                      step="0.25"
                    />
                    {errors.score && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.score.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingGrade(null);
                        reset({ school_year: currentYear });
                      }}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 persian-text"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 persian-text"
                    >
                      {isSubmitting ? 'در حال ذخیره...' : editingGrade ? 'ویرایش' : 'ثبت'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}