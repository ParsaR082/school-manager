'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import type { Grade, Student, Subject, Class } from '@/lib/types';
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

  // Fetch grades
  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          student:students(
            id,
            full_name,
            class:classes(id, name)
          ),
          subject:subjects(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name)
        `)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
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

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGrades(), fetchStudents(), fetchSubjects(), fetchClasses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: GradeFormData) => {
    try {
      if (editingGrade) {
        // Update existing grade
        const { error } = await supabase
          .from('grades')
          .update({
            student_id: data.student_id,
            subject_id: data.subject_id,
            month: data.month,
            school_year: data.school_year,
            score: data.score,
          })
          .eq('id', editingGrade.id);

        if (error) throw error;
      } else {
        // Create new grade
        const { error } = await supabase
          .from('grades')
          .insert([{
            student_id: data.student_id,
            subject_id: data.subject_id,
            month: data.month,
            school_year: data.school_year,
            score: data.score,
            created_by: 'admin', // In a real app, this would be the current user ID
          }]);

        if (error) throw error;
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
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 persian-text">
            مدیریت نمرات
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 persian-text"
          >
            ثبت نمره جدید
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <label className="text-sm font-medium text-gray-700 persian-text">
              فیلتر بر اساس کلاس:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="overflow-x-auto">
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
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 persian-text mb-4">
                  {editingGrade ? 'ویرایش نمره' : 'ثبت نمره جدید'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      دانش‌آموز
                    </label>
                    <select
                      {...register('student_id')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">انتخاب درس</option>
                      {subjects.map((subject) => (
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                        ماه
                      </label>
                      <select
                        {...register('month', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingGrade(null);
                        reset({ school_year: currentYear });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 persian-text"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 persian-text"
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