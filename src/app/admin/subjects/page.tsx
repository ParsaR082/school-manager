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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      class_ids: [],
    },
  });

  const selectedClassIds = watch('class_ids') || [];

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
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
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjectClasses = async () => {
    try {
      const response = await fetch('/api/subject-classes');
      if (!response.ok) throw new Error('Failed to fetch subject-classes');
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

  const onSubmit = async (data: SubjectFormData) => {
    try {
      let subjectId: string;

      if (editingSubject) {
        const response = await fetch('/api/subjects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSubject.id, name: data.name }),
        });
        if (!response.ok) throw new Error('Failed to update subject');
        subjectId = editingSubject.id;

        // Remove existing relationships
        const existingRelations = subjectClasses.filter(sc => sc.subject_id === subjectId);
        for (const relation of existingRelations) {
          await fetch(`/api/subject-classes?id=${relation.id}`, { method: 'DELETE' });
        }
      } else {
        const response = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name }),
        });
        if (!response.ok) throw new Error('Failed to create subject');
        const newSubject = await response.json();
        subjectId = newSubject.id;
      }

      // Create new relationships
      for (const classId of data.class_ids) {
        await fetch('/api/subject-classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

  const handleDelete = async (subjectId: string) => {
    if (!confirm('آیا از حذف این درس اطمینان دارید؟')) return;

    try {
      const response = await fetch(`/api/subjects?id=${subjectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete subject');
      await fetchSubjects();
      await fetchSubjectClasses();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    const subjectClassIds = subjectClasses
      .filter(sc => sc.subject_id === subject.id)
      .map(sc => sc.class_id);

    reset({
      name: subject.name,
      class_ids: subjectClassIds,
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingSubject(null);
    reset({
      name: '',
      class_ids: [],
    });
    setIsModalOpen(true);
  };

  const toggleClassSelection = (classId: string) => {
    const current = selectedClassIds;
    if (current.includes(classId)) {
      setValue('class_ids', current.filter(id => id !== classId));
    } else {
      setValue('class_ids', [...current, classId]);
    }
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
          title="مدیریت دروس"
          description="تعریف سرفصل‌های درسی و تخصیص آن‌ها به کلاس‌ها و پایه‌های مختلف"
          action={
            <button
              onClick={handleAddNew}
              className="btn btn-primary btn-md shadow-xs"
            >
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              افزودن درس جدید
            </button>
          }
        />

        {/* Subjects Table */}
        <div className="table-wrapper">
          {subjects.length === 0 ? (
            <EmptyState
              title="هنوز درسی تعریف نشده است"
              description="برای شروع نمره‌دهی، ابتدا دروس آموزشی و کلاس‌های مرتبط با آن‌ها را تعریف کنید."
              actionText="افزودن اولین درس"
              onAction={handleAddNew}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="table-header-cell">نام درس</th>
                    <th className="table-header-cell">کلاس‌های ارائه‌شده</th>
                    <th className="table-header-cell">تاریخ ایجاد</th>
                    <th className="table-header-cell text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {subjects.map((subject) => {
                    const assignedClasses = subjectClasses
                      .filter(sc => sc.subject_id === subject.id)
                      .map(sc => classes.find(c => c.id === sc.class_id)?.name)
                      .filter(Boolean) as string[];

                    return (
                      <tr key={subject.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="table-body-cell font-medium text-slate-900 persian-text">
                          {subject.name}
                        </td>
                        <td className="table-body-cell">
                          <div className="flex flex-wrap gap-1.5">
                            {assignedClasses.length > 0 ? (
                              assignedClasses.map((className, idx) => (
                                <Badge key={idx} variant="blue">
                                  {className}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="amber">بدون کلاس</Badge>
                            )}
                          </div>
                        </td>
                        <td className="table-body-cell text-xs text-slate-500 font-mono">
                          {new Date(subject.created_at).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="table-body-cell text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="btn btn-ghost btn-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                              title="ویرایش درس"
                            >
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDelete(subject.id)}
                              className="btn btn-ghost btn-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              title="حذف درس"
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

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSubject(null);
            reset();
          }}
          title={editingSubject ? 'ویرایش درس' : 'افزودن درس جدید'}
          description="نام درس و کلاس‌هایی که این درس در آن تدریس می‌شود را انتخاب کنید"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="form-label">
                نام درس <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className="form-input"
                placeholder="مثال: فیزیک ۱"
                autoFocus
              />
              {errors.name && (
                <p className="form-error persian-text">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                کلاس‌های مرتبط با این درس <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2.5 persian-text">
                حداقل یک کلاس را انتخاب کنید:
              </p>
              
              {classes.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  ابتدا از بخش کلاس‌ها، کلاس تعریف کنید.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {classes.map((cls) => {
                    const isSelected = selectedClassIds.includes(cls.id);
                    return (
                      <div
                        key={cls.id}
                        onClick={() => toggleClassSelection(cls.id)}
                        className={`p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-center justify-between persian-text ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cls.name}</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.class_ids && (
                <p className="form-error persian-text">{errors.class_ids.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSubject(null);
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
                {isSubmitting ? 'در حال ذخیره...' : editingSubject ? 'ذخیره تغییرات' : 'افزودن درس'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}