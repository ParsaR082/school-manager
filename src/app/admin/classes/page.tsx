'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import type { Class } from '@/lib/types';

const classSchema = z.object({
  name: z.string().min(1, 'نام کلاس الزامی است'),
});

type ClassFormData = z.infer<typeof classSchema>;

interface Student {
  id: string;
  full_name: string;
  national_id: string;
  class_id: string;
  class?: Class;
  parent?: {
    full_name: string;
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

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

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  // Handle class click to show students
  const handleClassClick = (classItem: Class) => {
    setSelectedClass(classItem);
    const filteredStudents = students.filter(student => student.class_id === classItem.id);
    setClassStudents(filteredStudents);
  };

  // Handle back to classes list
  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassStudents([]);
  };

  // Handle form submission
  const onSubmit = async (data: ClassFormData) => {
    try {
      if (editingClass) {
        // Update existing class
        const response = await fetch('/api/classes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingClass.id, name: data.name }),
        });

        if (!response.ok) {
          throw new Error('Failed to update class');
        }
      } else {
        // Create new class
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: data.name }),
        });

        if (!response.ok) {
          throw new Error('Failed to create class');
        }
      }

      await fetchClasses();
      setIsModalOpen(false);
      setEditingClass(null);
      reset();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  // Handle delete
  const handleDelete = async (classId: string) => {
    if (!confirm('آیا از حذف این کلاس اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/classes?id=${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete class');
      }

      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  // Handle edit
  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    reset({ name: classItem.name });
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingClass(null);
    reset({ name: '' });
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 persian-text">
            {selectedClass ? `دانش‌آموزان کلاس ${selectedClass.name}` : 'مدیریت کلاس‌ها'}
          </h1>
          {selectedClass ? (
            <button
              onClick={handleBackToClasses}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 persian-text text-sm sm:text-base"
            >
              بازگشت به لیست کلاس‌ها
            </button>
          ) : (
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 persian-text text-sm sm:text-base"
            >
              افزودن کلاس جدید
            </button>
          )}
        </div>

        {/* Students List (when a class is selected) */}
        {selectedClass && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Mobile view for students */}
            <div className="block sm:hidden">
              {classStudents.length === 0 ? (
                <div className="p-6 text-center text-gray-500 persian-text">
                  هیچ دانش‌آموزی در این کلاس یافت نشد
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {classStudents.map((student) => (
                    <div key={student.id} className="p-4 space-y-2">
                      <h3 className="font-medium text-gray-900 persian-text text-sm">
                        {student.full_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        کد ملی: {student.national_id}
                      </p>
                      {student.parent && (
                        <p className="text-xs text-gray-500 persian-text">
                          والد: {student.parent.full_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop view for students */}
            <div className="hidden sm:block">
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
                      نام والد
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500 persian-text">
                        هیچ دانش‌آموزی در این کلاس یافت نشد
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 persian-text">
                          {student.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.national_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 persian-text">
                          {student.parent?.full_name || 'نامشخص'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Classes Table (when no class is selected) */}
        {!selectedClass && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Mobile view */}
            <div className="block sm:hidden">
              {classes.length === 0 ? (
                <div className="p-6 text-center text-gray-500 persian-text">
                  هیچ کلاسی یافت نشد
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {classes.map((classItem) => (
                    <div key={classItem.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div 
                          onClick={() => handleClassClick(classItem)}
                          className="cursor-pointer flex-1"
                        >
                          <h3 className="font-medium text-gray-900 persian-text text-sm hover:text-blue-600">
                            {classItem.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            تاریخ ایجاد: {new Date(classItem.created_at).toLocaleDateString('fa-IR')}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {students.filter(s => s.class_id === classItem.id).length} دانش‌آموز
                          </p>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(classItem)}
                            className="text-blue-600 hover:text-blue-900 persian-text text-xs px-2 py-1 bg-blue-50 rounded"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDelete(classItem.id)}
                            className="text-red-600 hover:text-red-900 persian-text text-xs px-2 py-1 bg-red-50 rounded"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop view */}
            <div className="hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                      نام کلاس
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                      تعداد دانش‌آموز
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                      تاریخ ایجاد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 persian-text">
                        هیچ کلاسی یافت نشد
                      </td>
                    </tr>
                  ) : (
                    classes.map((classItem) => (
                      <tr key={classItem.id} className="hover:bg-gray-50">
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 persian-text cursor-pointer hover:text-blue-600"
                          onClick={() => handleClassClick(classItem)}
                        >
                          {classItem.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 persian-text">
                          {students.filter(s => s.class_id === classItem.id).length} دانش‌آموز
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(classItem.created_at).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleEdit(classItem)}
                              className="text-blue-600 hover:text-blue-900 persian-text"
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDelete(classItem.id)}
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
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white m-4">
              <div className="mt-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 persian-text mb-4">
                  {editingClass ? 'ویرایش کلاس' : 'افزودن کلاس جدید'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      نام کلاس
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="form-input"
                      placeholder="مثال: کلاس اول"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingClass(null);
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
                      {isSubmitting ? 'در حال ذخیره...' : editingClass ? 'ویرایش' : 'افزودن'}
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