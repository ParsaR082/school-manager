'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import type { Student, Class } from '@/lib/types';

const studentSchema = z.object({
  full_name: z.string().min(1, 'نام و نام خانوادگی الزامی است'),
  national_id: z.string().regex(/^\d{10}$/, 'کد ملی باید دقیقاً ۱۰ رقم باشد'),
  class_id: z.string().min(1, 'انتخاب کلاس الزامی است'),
  parent_full_name: z.string().min(1, 'نام والدین الزامی است'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentWithClass extends Omit<Student, 'parent'> {
  class?: Class;
  parent?: {
    full_name: string;
  };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithClass | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('Fetched students data:', data); // Debug log
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Handle form submission
  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        // Update existing student
        const response = await fetch('/api/students', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingStudent.id,
            full_name: data.full_name,
            national_id: data.national_id,
            class_id: data.class_id,
            parent_full_name: data.parent_full_name,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update student');
        }
      } else {
        // Create new student
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: data.full_name,
            national_id: data.national_id,
            class_id: data.class_id,
            parent_full_name: data.parent_full_name,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create student');
        }
      }

      await fetchStudents();
      setIsModalOpen(false);
      setEditingStudent(null);
      reset();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  // Handle delete
  const handleDelete = async (studentId: string) => {
    if (!confirm('آیا از حذف این دانش‌آموز اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/students?id=${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  // Handle edit
  const handleEdit = (student: StudentWithClass) => {
    setEditingStudent(student);
    reset({
      full_name: student.full_name,
      national_id: student.national_id,
      parent_full_name: student.parent?.full_name || '',
      class_id: student.class_id,
    });
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingStudent(null);
    reset({
      full_name: '',
      national_id: '',
      parent_full_name: '',
      class_id: '',
    });
    setIsModalOpen(true);
  };

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
            مدیریت دانش‌آموزان
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 persian-text text-sm sm:text-base"
          >
            افزودن دانش‌آموز جدید
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile view */}
          <div className="block sm:hidden">
            {students.length === 0 ? (
              <div className="p-6 text-center text-gray-500 persian-text">
                هیچ دانش‌آموزی یافت نشد
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {students.map((student) => (
                  <div key={student.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 persian-text text-sm">
                          {student.full_name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          کد ملی: {student.national_id}
                        </p>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900 persian-text text-xs px-2 py-1 bg-blue-50 rounded"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900 persian-text text-xs px-2 py-1 bg-red-50 rounded"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 persian-text">کلاس: </span>
                        <span className="text-gray-900 persian-text">
                          {student.class?.name || 'کلاس تخصیص نیافته'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 persian-text">والدین: </span>
                        <span className="text-gray-900 persian-text">
                          {student.parent?.full_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    نام دانش‌آموز
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    کد ملی
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    کلاس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    نام والدین
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 persian-text">
                      هیچ دانش‌آموزی یافت نشد
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 persian-text">
                        {student.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.national_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 persian-text">
                        {student.class?.name || 'کلاس تخصیص نیافته'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 persian-text">
                        {student.parent?.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 persian-text"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
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
                <h3 className="text-lg font-medium text-gray-900 persian-text mb-4">
                  {editingStudent ? 'ویرایش دانش‌آموز' : 'افزودن دانش‌آموز جدید'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      {...register('full_name')}
                      className="form-input"
                      placeholder="مثال: علی احمدی"
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      کد ملی
                    </label>
                    <input
                      type="text"
                      {...register('national_id')}
                      className="form-input"
                      placeholder="1234567890"
                      maxLength={10}
                    />
                    {errors.national_id && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.national_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      کلاس
                    </label>
                    <select
                      {...register('class_id')}
                      className="form-input"
                    >
                      <option value="">انتخاب کلاس</option>
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                    {errors.class_id && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.class_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      نام والدین
                    </label>
                    <input
                      type="text"
                      {...register('parent_full_name')}
                      className="form-input"
                      placeholder="مثال: محمد احمدی"
                    />
                    {errors.parent_full_name && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.parent_full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingStudent(null);
                        reset();
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
                      {isSubmitting ? 'در حال ذخیره...' : editingStudent ? 'ویرایش' : 'افزودن'}
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