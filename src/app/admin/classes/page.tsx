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

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
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

  useEffect(() => {
    fetchClasses();
  }, []);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 persian-text">
            مدیریت کلاس‌ها
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 persian-text"
          >
            افزودن کلاس جدید
          </button>
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                  نام کلاس
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
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500 persian-text">
                    هیچ کلاسی یافت نشد
                  </td>
                </tr>
              ) : (
                classes.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 persian-text">
                      {classItem.name}
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 persian-text mb-4">
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

                  <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingClass(null);
                        reset();
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