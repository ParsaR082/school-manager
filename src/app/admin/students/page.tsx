'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
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

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
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

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        student.full_name.includes(searchQuery.trim()) ||
        student.national_id.includes(searchQuery.trim()) ||
        (student.parent?.full_name && student.parent.full_name.includes(searchQuery.trim()));

      const matchesClass =
        !selectedClassFilter || student.class_id === selectedClassFilter;

      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, selectedClassFilter]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        const response = await fetch('/api/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStudent.id,
            full_name: data.full_name,
            national_id: data.national_id,
            class_id: data.class_id,
            parent_full_name: data.parent_full_name,
          }),
        });
        if (!response.ok) throw new Error('Failed to update student');
      } else {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: data.full_name,
            national_id: data.national_id,
            class_id: data.class_id,
            parent_full_name: data.parent_full_name,
          }),
        });
        if (!response.ok) throw new Error('Failed to create student');
      }

      await fetchStudents();
      setIsModalOpen(false);
      setEditingStudent(null);
      reset();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('آیا از حذف این دانش‌آموز و نمرات ثبت‌شده او اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/students?id=${studentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete student');
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleEdit = (student: StudentWithClass) => {
    setEditingStudent(student);
    reset({
      full_name: student.full_name,
      national_id: student.national_id,
      class_id: student.class_id,
      parent_full_name: student.parent?.full_name || '',
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    reset({
      full_name: '',
      national_id: '',
      class_id: '',
      parent_full_name: '',
    });
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
          title="مدیریت دانش‌آموزان"
          description="ثبت، ویرایش و مدیریت پرونده تحصیلی دانش‌آموزان و مشخصات والدین"
          badge={
            <Badge variant="blue">
              {students.length} دانش‌آموز
            </Badge>
          }
          action={
            <button
              onClick={handleAddNew}
              className="btn btn-primary btn-md shadow-xs"
            >
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              ثبت دانش‌آموز جدید
            </button>
          }
        />

        {/* Filter and Search Bar */}
        <div className="app-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام یا کد ملی..."
              className="form-input pr-9 text-xs sm:text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="form-input text-xs sm:text-sm"
            >
              <option value="">همه کلاس‌ها</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="table-wrapper">
          {filteredStudents.length === 0 ? (
            <EmptyState
              title={students.length === 0 ? 'هنوز دانش‌آموزی ثبت نشده است' : 'موردی یافت نشد'}
              description={
                students.length === 0
                  ? 'مشخصات اولین دانش‌آموز را برای ورود به سیستم ثبت کنید.'
                  : 'هیچ دانش‌آموزی با معیارهای جستجوی شما مطابقت ندارد.'
              }
              actionText={students.length === 0 ? 'ثبت دانش‌آموز' : undefined}
              onAction={students.length === 0 ? handleAddNew : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="table-header-cell">نام دانش‌آموز</th>
                    <th className="table-header-cell">کد ملی</th>
                    <th className="table-header-cell">کلاس</th>
                    <th className="table-header-cell">نام والدین</th>
                    <th className="table-header-cell text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-body-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 border border-slate-200/60">
                            {student.full_name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 persian-text">
                            {student.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="table-body-cell font-mono text-slate-600 text-xs">
                        {student.national_id}
                      </td>
                      <td className="table-body-cell">
                        {student.class ? (
                          <Badge variant="blue">{student.class.name}</Badge>
                        ) : (
                          <Badge variant="amber">بدون کلاس</Badge>
                        )}
                      </td>
                      <td className="table-body-cell text-slate-600 persian-text">
                        {student.parent?.full_name || 'ثبت نشده'}
                      </td>
                      <td className="table-body-cell text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="btn btn-ghost btn-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="ویرایش مشخصات"
                          >
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="btn btn-ghost btn-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="حذف دانش‌آموز"
                          >
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStudent(null);
            reset();
          }}
          title={editingStudent ? 'ویرایش دانش‌آموز' : 'ثبت دانش‌آموز جدید'}
          description="مشخصات هویتی دانش‌آموز و اطلاعات والدین را وارد کنید"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">
                نام و نام خانوادگی دانش‌آموز <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('full_name')}
                className="form-input"
                placeholder="مثال: علی احمدی"
                autoFocus
              />
              {errors.full_name && (
                <p className="form-error persian-text">{errors.full_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  کد ملی (۱۰ رقم) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('national_id')}
                  className="form-input font-mono text-left"
                  dir="ltr"
                  placeholder="1234567890"
                  maxLength={10}
                />
                {errors.national_id && (
                  <p className="form-error persian-text">{errors.national_id.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  کلاس <span className="text-rose-500">*</span>
                </label>
                <select {...register('class_id')} className="form-input">
                  <option value="">انتخاب کلاس</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                {errors.class_id && (
                  <p className="form-error persian-text">{errors.class_id.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">
                نام و نام خانوادگی والد <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('parent_full_name')}
                className="form-input"
                placeholder="مثال: محمد احمدی (پدر)"
              />
              {errors.parent_full_name && (
                <p className="form-error persian-text">{errors.parent_full_name.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStudent(null);
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
                {isSubmitting ? 'در حال ذخیره...' : editingStudent ? 'ذخیره تغییرات' : 'ثبت دانش‌آموز'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}