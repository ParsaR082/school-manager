'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
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

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
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

  const handleClassClick = (classItem: Class) => {
    setSelectedClass(classItem);
    const filteredStudents = students.filter(student => student.class_id === classItem.id);
    setClassStudents(filteredStudents);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassStudents([]);
  };

  const onSubmit = async (data: ClassFormData) => {
    try {
      if (editingClass) {
        const response = await fetch('/api/classes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingClass.id, name: data.name }),
        });
        if (!response.ok) throw new Error('Failed to update class');
      } else {
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name }),
        });
        if (!response.ok) throw new Error('Failed to create class');
      }

      await fetchClasses();
      setIsModalOpen(false);
      setEditingClass(null);
      reset();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('آیا از حذف این کلاس و وابستگی‌های آن اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/classes?id=${classId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete class');
      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    reset({ name: classItem.name });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingClass(null);
    reset({ name: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 fade-in">
        {/* Page Header */}
        <PageHeader
          title={selectedClass ? `دانش‌آموزان ${selectedClass.name}` : 'مدیریت کلاس‌ها'}
          description={
            selectedClass
              ? `لیست کل دانش‌آموزان ثبت‌نام شده در کلاس ${selectedClass.name}`
              : 'تعریف، مشاهده و مدیریت کلاس‌ها و پایه‌های تحصیلی مدرسه'
          }
          action={
            selectedClass ? (
              <button
                onClick={handleBackToClasses}
                className="btn btn-secondary btn-md shadow-xs"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                بازگشت به لیست کلاس‌ها
              </button>
            ) : (
              <button
                onClick={handleAddNew}
                className="btn btn-primary btn-md shadow-xs"
              >
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                افزودن کلاس جدید
              </button>
            )
          }
        />

        {/* Selected Class Student List */}
        {selectedClass && (
          <div className="table-wrapper">
            {classStudents.length === 0 ? (
              <EmptyState
                title="دانش‌آموزی در این کلاس ثبت نشده است"
                description="می‌توانید از منوی دانش‌آموزان، دانش‌آموزان جدید را به این کلاس اختصاص دهید."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="table-header-cell">نام و نام خانوادگی</th>
                      <th className="table-header-cell">کد ملی</th>
                      <th className="table-header-cell">نام والدین</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {classStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="table-body-cell font-medium text-slate-900 persian-text">
                          {student.full_name}
                        </td>
                        <td className="table-body-cell font-mono text-slate-600">
                          {student.national_id}
                        </td>
                        <td className="table-body-cell text-slate-600 persian-text">
                          {student.parent?.full_name || 'نامشخص'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Classes Table */}
        {!selectedClass && (
          <div className="table-wrapper">
            {classes.length === 0 ? (
              <EmptyState
                title="هنوز کلاسی تعریف نشده است"
                description="برای شروع ثبت دانش‌آموزان و نمرات، ابتدا کلاس‌های مدرسه را تعریف کنید."
                actionText="افزودن اولین کلاس"
                onAction={handleAddNew}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="table-header-cell">نام کلاس</th>
                      <th className="table-header-cell">تعداد دانش‌آموزان</th>
                      <th className="table-header-cell">تاریخ ایجاد</th>
                      <th className="table-header-cell text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {classes.map((classItem) => {
                      const studentCount = students.filter(s => s.class_id === classItem.id).length;
                      return (
                        <tr key={classItem.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="table-body-cell">
                            <button
                              onClick={() => handleClassClick(classItem)}
                              className="font-medium text-slate-900 hover:text-blue-600 transition-colors text-right persian-text flex items-center gap-2 group"
                            >
                              <span>{classItem.name}</span>
                              <span className="text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-[-2px] transition-all">
                                &larr;
                              </span>
                            </button>
                          </td>
                          <td className="table-body-cell">
                            <Badge variant={studentCount > 0 ? 'blue' : 'slate'}>
                              {studentCount} دانش‌آموز
                            </Badge>
                          </td>
                          <td className="table-body-cell text-xs text-slate-500 font-mono">
                            {new Date(classItem.created_at).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="table-body-cell text-left">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(classItem)}
                                className="btn btn-ghost btn-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                title="ویرایش کلاس"
                              >
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                ویرایش
                              </button>
                              <button
                                onClick={() => handleDelete(classItem.id)}
                                className="btn btn-ghost btn-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                title="حذف کلاس"
                              >
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingClass(null);
            reset();
          }}
          title={editingClass ? 'ویرایش کلاس' : 'افزودن کلاس جدید'}
          description="نام پایه یا کلاس مورد نظر را وارد نمایید"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">
                نام کلاس <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className="form-input"
                placeholder="مثال: دهم تجربی ۱"
                autoFocus
              />
              {errors.name && (
                <p className="form-error persian-text">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClass(null);
                  reset();
                }}
                className="btn btn-secondary btn-md"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-md shadow-xs"
              >
                {isSubmitting ? 'در حال ذخیره...' : editingClass ? 'ذخیره تغییرات' : 'افزودن کلاس'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}