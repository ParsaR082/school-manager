'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import type { Student, Class } from '@/lib/types';

const studentSchema = z.object({
  full_name: z.string().min(1, 'نام و نام خانوادگی الزامی است'),
  national_id: z.string().min(10, 'کد ملی باید ۱۰ رقم باشد').max(10, 'کد ملی باید ۱۰ رقم باشد'),
  parent_full_name: z.string().min(1, 'نام والدین الزامی است'),
  parent_phone: z.string().min(11, 'شماره تلفن باید ۱۱ رقم باشد'),
  class_id: z.string().min(1, 'انتخاب کلاس الزامی است'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentWithClass extends Omit<Student, 'parent'> {
  class?: Class;
  parent?: {
    full_name: string;
    phone: string;
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
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name),
          parent:parents(full_name, phone)
        `)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
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
      await Promise.all([fetchStudents(), fetchClasses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        // Update existing student and parent
        const { error: parentError } = await supabase
          .from('parents')
          .update({
            full_name: data.parent_full_name,
            phone: data.parent_phone,
          })
          .eq('id', editingStudent.parent_id);

        if (parentError) throw parentError;

        const { error: studentError } = await supabase
          .from('students')
          .update({
            full_name: data.full_name,
            national_id: data.national_id,
            class_id: data.class_id,
          })
          .eq('id', editingStudent.id);

        if (studentError) throw studentError;
      } else {
        // Create new parent first
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .insert([{
            full_name: data.parent_full_name,
            phone: data.parent_phone,
          }])
          .select()
          .single();

        if (parentError) throw parentError;

        // Then create student
        const { error: studentError } = await supabase
          .from('students')
          .insert([{
            full_name: data.full_name,
            national_id: data.national_id,
            parent_id: parentData.id,
            class_id: data.class_id,
          }]);

        if (studentError) throw studentError;
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
  const handleDelete = async (student: StudentWithClass) => {
    if (!confirm('آیا از حذف این دانش‌آموز اطمینان دارید؟')) return;

    try {
      // Delete student first (due to foreign key constraint)
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (studentError) throw studentError;

      // Then delete parent
      const { error: parentError } = await supabase
        .from('parents')
        .delete()
        .eq('id', student.parent_id);

      if (parentError) throw parentError;

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
      parent_phone: student.parent?.phone || '',
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
      parent_phone: '',
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 persian-text">
            مدیریت دانش‌آموزان
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 persian-text"
          >
            افزودن دانش‌آموز جدید
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
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
                    تلفن والدین
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 persian-text">
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
                        {student.class?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 persian-text">
                        {student.parent?.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.parent?.phone}
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
                            onClick={() => handleDelete(student)}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: محمد احمدی"
                    />
                    {errors.parent_full_name && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.parent_full_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 persian-text mb-1">
                      شماره تلفن والدین
                    </label>
                    <input
                      type="text"
                      {...register('parent_phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="09123456789"
                    />
                    {errors.parent_phone && (
                      <p className="mt-1 text-sm text-red-600 persian-text">
                        {errors.parent_phone.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingStudent(null);
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