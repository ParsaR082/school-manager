'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import type { Subject, Class, SubjectClass } from '@/lib/types';

const subjectSchema = z.object({
  name: z.string().min(1, 'نام درس الزامی است'),
  class_ids: z.array(z.string()).min(1, 'انتخاب حداقل یک کلاس الزامی است'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjectClasses, setSubjectClasses] = useState<SubjectClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      class_ids: [],
    },
  });

  // Fetch subjects, classes, and subject-class relationships
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
    } finally {
      setLoading(false);
    }
  };

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
    fetchSubjects();
    fetchClasses();
    fetchSubjectClasses();
  }, []);

  // Handle form submission
  const onSubmit = async (data: SubjectFormData) => {
    try {
      let subjectId: string;

      if (editingSubject) {
        // Update existing subject
        const response = await fetch('/api/subjects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingSubject.id, name: data.name }),
        });

        if (!response.ok) {
          throw new Error('Failed to update subject');
        }

        subjectId = editingSubject.id;

        // Remove existing subject-class relationships
        const existingRelations = subjectClasses.filter(sc => sc.subject_id === subjectId);
        for (const relation of existingRelations) {
          await fetch(`/api/subject-classes?id=${relation.id}`, {
            method: 'DELETE',
          });
        }
      } else {
        // Create new subject
        const response = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: data.name }),
        });

        if (!response.ok) {
          throw new Error('Failed to create subject');
        }

        const newSubject = await response.json();
        subjectId = newSubject.id;
      }

      // Create new subject-class relationships
      for (const classId of data.class_ids) {
        await fetch('/api/subject-classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject_id: subjectId, class_id: classId }),
        });
      }

      await fetchSubjects();
      await fetchSubjectClasses();
      setIsModalOpen(false);
      setEditingSubject(null);
      reset();
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  // Handle delete
  const handleDelete = async (subjectId: string) => {
    if (!confirm('آیا از حذف این درس اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/subjects?id=${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }

      await fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  // Handle edit
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    
    // Get class IDs for this subject
    const subjectClassIds = subjectClasses
      .filter(sc => sc.subject_id === subject.id)
      .map(sc => sc.class_id);
    
    reset({ 
      name: subject.name,
      class_ids: subjectClassIds
    });
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingSubject(null);
    reset({ 
      name: '',
      class_ids: []
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
            مدیریت دروس
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 persian-text text-sm sm:text-base"
          >
            افزودن درس جدید
          </button>
        </div>

        {/* Subjects Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile view */}
          <div className="block sm:hidden">
            {subjects.length === 0 ? (
              <div className="p-6 text-center text-gray-500 persian-text">
                هیچ درسی یافت نشد
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {subjects.map((subject) => {
                  const assignedClasses = subjectClasses
                    .filter(sc => sc.subject_id === subject.id)
                    .map(sc => classes.find(c => c.id === sc.class_id)?.name)
                    .filter(Boolean);

                  return (
                    <div key={subject.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 persian-text text-sm">
                            {subject.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            کلاس‌ها: {assignedClasses.length > 0 ? assignedClasses.join('، ') : 'تخصیص نیافته'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            تاریخ ایجاد: {new Date(subject.created_at).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="text-blue-600 hover:text-blue-900 persian-text text-xs px-2 py-1 bg-blue-50 rounded"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="text-red-600 hover:text-red-900 persian-text text-xs px-2 py-1 bg-red-50 rounded"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    نام درس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    کلاس‌های تخصیص یافته
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
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 persian-text">
                      هیچ درسی یافت نشد
                    </td>
                  </tr>
                ) : (
                subjects.map((subject) => {
                  const assignedClasses = subjectClasses
                    .filter(sc => sc.subject_id === subject.id)
                    .map(sc => classes.find(c => c.id === sc.class_id)?.name)
                    .filter(Boolean);

                  return (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 persian-text">
                        {subject.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 persian-text">
                        {assignedClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedClasses.map((className, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {className}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">هیچ کلاسی تخصیص نیافته</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subject.created_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:text-blue-900 persian-text"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-600 hover:text-red-900 persian-text"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white m-4">
              <div className="mt-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 persian-text mb-4">
                  {editingSubject ? 'ویرایش درس' : 'افزودن درس جدید'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      نام درس
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="form-input"
                      placeholder="مثال: ریاضی"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-2">
                      انتخاب کلاس‌ها
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {classes.map((classItem) => (
                        <label key={classItem.id} className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            value={classItem.id}
                            {...register('class_ids')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 persian-text">
                            {classItem.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.class_ids && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.class_ids.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingSubject(null);
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
                      {isSubmitting ? 'در حال ذخیره...' : editingSubject ? 'ویرایش' : 'افزودن'}
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