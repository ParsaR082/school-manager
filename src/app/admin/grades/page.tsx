'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import type { Grade, Student, Subject, Class, SubjectClass } from '@/lib/types';
import { PERSIAN_MONTHS } from '@/lib/types';
import { getUserFromCookie } from '@/lib/auth-client';

interface GradeWithDetails extends Grade {
  student?: Student & { class?: Class };
  subject?: Subject;
}

interface MonthlyGrade {
  subject_id: string;
  subject_name: string;
  grades: { [gradeNumber: number]: { display: string; numeric: number } | null }; // Store both display format and numeric value
}

export default function GradesPage() {
  // State for data
  const [grades, setGrades] = useState<GradeWithDetails[]>([]);
  const [students, setStudents] = useState<(Student & { class?: Class })[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjectClasses, setSubjectClasses] = useState<SubjectClass[]>([]);
  const [loading, setLoading] = useState(true);

  // State for new grade registration flow
  const [isNewGradeMode, setIsNewGradeMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // New state for month filter
  const [currentStep, setCurrentStep] = useState<'class' | 'student' | 'grades'>('class');
  const [monthlyGrades, setMonthlyGrades] = useState<MonthlyGrade[]>([]);
  const [currentYear] = useState(1403);
  const [saving, setSaving] = useState(false);

  // State for filtering existing grades
  const [filterClass, setFilterClass] = useState<string>('');

  // Filtered data
  const filteredGrades = grades.filter(grade => 
    !filterClass || grade.student?.class?.id === filterClass
  );

  const classStudents = students.filter(student => 
    student.class?.id === selectedClass
  );

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const studentSubjects = useMemo(() => {
    return selectedStudentData?.class?.id 
      ? subjects.filter(subject => 
          subjectClasses.some(sc => 
            sc.subject_id === subject.id && sc.class_id === selectedStudentData.class?.id
          )
        )
      : [];
  }, [selectedStudentData, subjects, subjectClasses]);

  // Fetch functions
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
    }
  };

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
    const loadData = async () => {
      await Promise.all([fetchGrades(), fetchStudents(), fetchSubjects(), fetchClasses(), fetchSubjectClasses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Load existing grades for selected student
  useEffect(() => {
    if (selectedStudent && studentSubjects.length > 0 && selectedMonth) {
      const existingGrades = grades.filter(g => 
        g.student_id === selectedStudent && 
        g.school_year === currentYear && 
        g.month === selectedMonth
      );
      
      const monthlyGradesData: MonthlyGrade[] = studentSubjects.map(subject => {
        const subjectGrades: { [gradeNumber: number]: { display: string; numeric: number } | null } = {};
        
        // Initialize grade numbers 1-10 with null
        for (let gradeNum = 1; gradeNum <= 10; gradeNum++) {
          subjectGrades[gradeNum] = null;
        }
        
        // Fill existing grades for this month
        existingGrades
          .filter(g => g.subject_id === subject.id)
          .forEach(g => {
            const gradeNumber = (g as any).grade_number || 1; // Default to 1 if not set
            // For existing grades from database, display the original format
            // If it's a string (like "3/5"), use it as is
            // If it's a number, format it properly
            let displayValue: string;
            let numericValue: number;
            
            if (typeof g.score === 'string') {
              // It's already in string format (like "3/5")
              displayValue = g.score;
              // Calculate numeric value for validation
              if (g.score.includes('/')) {
                const [numerator, denominator] = g.score.split('/').map(Number);
                numericValue = denominator !== 0 ? (numerator / denominator) * 20 : 0;
              } else {
                numericValue = parseFloat(g.score) || 0;
              }
            } else {
              // It's a numeric value, format for display
              displayValue = g.score % 1 === 0 ? 
                g.score.toString() : 
                g.score.toFixed(2).replace(/\.?0+$/, '');
              numericValue = g.score;
            }
            
            subjectGrades[gradeNumber] = {
              display: displayValue,
              numeric: numericValue
            };
          });
        
        return {
          subject_id: subject.id,
          subject_name: subject.name,
          grades: subjectGrades
        };
      });
      
      setMonthlyGrades(monthlyGradesData);
    } else if (selectedStudent) {
      // Student selected but no subjects found - this might indicate a data loading issue
      setMonthlyGrades([]);
    }
  }, [selectedStudent, studentSubjects, grades, currentYear, selectedMonth]);

  // Handle new grade registration
  const startNewGradeRegistration = () => {
    setIsNewGradeMode(true);
    setCurrentStep('class');
    setSelectedClass('');
    setSelectedStudent('');
    setMonthlyGrades([]);
  };

  const handleClassSelection = (classId: string) => {
    setSelectedClass(classId);
    setCurrentStep('student');
    setSelectedStudent('');
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudent(studentId);
    setCurrentStep('grades');
  };

  const handleGradeChange = (subjectId: string, gradeNumber: number, score: string) => {
    let gradeData: { display: string; numeric: number } | null = null;
    
    if (score !== '') {
      let numericScore: number | null = null;
      
      // Check if the input contains a fraction (e.g., "3/5", "2/4")
      if (score.includes('/')) {
        const parts = score.split('/');
        if (parts.length === 2 && parts[1] !== '') {
          // Only process if both numerator and denominator are present
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          
          // Validate that both parts are numbers and denominator is not zero
          if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
            numericScore = numerator / denominator;
            
            // Ensure the result is within valid range (0-20)
            if (numericScore < 0) numericScore = 0;
            if (numericScore > 20) numericScore = 20;
            
            // Keep the original fraction format for display
            gradeData = { display: score, numeric: numericScore };
          } else {
            // If fraction is invalid but user is still typing, keep the display value
            gradeData = { display: score, numeric: 0 };
          }
        } else {
          // User is still typing the fraction (e.g., "3/" or "3/5"), keep the display value
          gradeData = { display: score, numeric: 0 };
        }
      } else {
        // Handle regular decimal input
        const parsed = parseFloat(score);
        if (!isNaN(parsed)) {
          numericScore = parsed;
          
          // Ensure the result is within valid range (0-20)
          if (numericScore < 0) numericScore = 0;
          if (numericScore > 20) numericScore = 20;
          
          // For decimal numbers, store as is
          gradeData = { display: score, numeric: numericScore };
        } else {
          // If input is not a valid number but user is still typing, keep the display value
          gradeData = { display: score, numeric: 0 };
        }
      }
    }
    
    setMonthlyGrades(prev => 
      prev.map(mg => 
        mg.subject_id === subjectId 
          ? { ...mg, grades: { ...mg.grades, [gradeNumber]: gradeData } }
          : mg
      )
    );
  };

  const saveGrades = async () => {
    setSaving(true);
    try {
      // Get current user ID
      const currentUser = getUserFromCookie();
      if (!currentUser) {
        throw new Error('کاربر احراز هویت نشده است');
      }

      // Prepare grades data
      const gradesToSave: any[] = [];
      
      monthlyGrades.forEach(mg => {
        Object.entries(mg.grades).forEach(([gradeNumber, gradeData]) => {
          if (gradeData !== null && gradeData.numeric >= 0 && gradeData.numeric <= 20) {
            gradesToSave.push({
              student_id: selectedStudent,
              subject_id: mg.subject_id,
              month: selectedMonth,
              school_year: currentYear,
              score: gradeData.display, // Store the original format (3/5 or 15.5)
              grade_number: parseInt(gradeNumber),
              created_by: currentUser.id,
              created_at: new Date().toISOString()
            });
          }
        });
      });

      // Delete existing grades for this student, month and year
      await fetch('/api/grades', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          month: selectedMonth,
          school_year: currentYear
        }),
      });

      // Save new grades
      if (gradesToSave.length > 0) {
        const response = await fetch('/api/grades/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grades: gradesToSave }),
        });

        if (!response.ok) {
          throw new Error('Failed to save grades');
        }
      }

      await fetchGrades();
      setIsNewGradeMode(false);
      setCurrentStep('class');
      setSelectedClass('');
      setSelectedStudent('');
      setSelectedMonth(7);
      setMonthlyGrades([]);
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('خطا در ذخیره نمرات');
    } finally {
      setSaving(false);
    }
  };

  const cancelGradeRegistration = () => {
    setIsNewGradeMode(false);
    setCurrentStep('class');
    setSelectedClass('');
    setSelectedStudent('');
    setMonthlyGrades([]);
  };

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این نمره اطمینان دارید؟')) {
      try {
        const response = await fetch('/api/grades', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete grade');
        }

        await fetchGrades();
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg persian-text">در حال بارگذاری...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900 persian-text">مدیریت نمرات</h1>
          <button
            onClick={startNewGradeRegistration}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium persian-text"
          >
            ثبت نمره جدید
          </button>
        </div>

        {/* New Grade Registration Modal */}
        {isNewGradeMode && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 persian-text mb-2 sm:mb-4">
                  ثبت نمرات جدید
                </h3>
                
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-4 sm:mb-6 px-2">
                  <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse overflow-x-auto">
                    <div className={`flex items-center ${currentStep === 'class' ? 'text-blue-600' : currentStep === 'student' || currentStep === 'grades' ? 'text-green-600' : 'text-gray-400'} flex-shrink-0`}>
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'class' ? 'bg-blue-100' : currentStep === 'student' || currentStep === 'grades' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        1
                      </div>
                      <span className="mr-1 sm:mr-2 text-xs sm:text-sm persian-text whitespace-nowrap">انتخاب کلاس</span>
                    </div>
                    <div className={`w-4 sm:w-8 h-0.5 ${currentStep === 'student' || currentStep === 'grades' ? 'bg-green-600' : 'bg-gray-300'} flex-shrink-0`}></div>
                    <div className={`flex items-center ${currentStep === 'student' ? 'text-blue-600' : currentStep === 'grades' ? 'text-green-600' : 'text-gray-400'} flex-shrink-0`}>
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'student' ? 'bg-blue-100' : currentStep === 'grades' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        2
                      </div>
                      <span className="mr-1 sm:mr-2 text-xs sm:text-sm persian-text whitespace-nowrap">انتخاب دانش‌آموز</span>
                    </div>
                    <div className={`w-4 sm:w-8 h-0.5 ${currentStep === 'grades' ? 'bg-green-600' : 'bg-gray-300'} flex-shrink-0`}></div>
                    <div className={`flex items-center ${currentStep === 'grades' ? 'text-blue-600' : 'text-gray-400'} flex-shrink-0`}>
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'grades' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        3
                      </div>
                      <span className="mr-1 sm:mr-2 text-xs sm:text-sm persian-text whitespace-nowrap">ثبت نمرات</span>
                    </div>
                  </div>
                </div>

                {/* Step 1: Class Selection */}
                {currentStep === 'class' && (
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-md font-medium text-gray-900 persian-text">انتخاب کلاس</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {classes.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => handleClassSelection(cls.id)}
                          className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center persian-text"
                        >
                          <div className="font-medium text-gray-900 text-sm sm:text-base">{cls.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            {students.filter(s => s.class?.id === cls.id).length} دانش‌آموز
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Student Selection */}
                {currentStep === 'student' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <h4 className="text-sm sm:text-md font-medium text-gray-900 persian-text">
                        انتخاب دانش‌آموز از کلاس {classes.find(c => c.id === selectedClass)?.name}
                      </h4>
                      <button
                        onClick={() => setCurrentStep('class')}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm persian-text self-start sm:self-auto"
                      >
                        تغییر کلاس
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
                      {classStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentSelection(student.id)}
                          className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-right persian-text"
                        >
                          <div className="font-medium text-gray-900 text-sm sm:text-base">{student.full_name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">{student.national_id}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Grades Table */}
                {currentStep === 'grades' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <h4 className="text-sm sm:text-md font-medium text-gray-900 persian-text">
                        ثبت نمرات برای {selectedStudentData?.full_name}
                      </h4>
                      <button
                        onClick={() => setCurrentStep('student')}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm persian-text self-start sm:self-auto"
                      >
                        تغییر دانش‌آموز
                      </button>
                    </div>
                    
                    {/* Month Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 persian-text mb-2">
                        انتخاب ماه:
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 persian-text text-gray-900"
                      >
                        {[7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(month => (
                          <option key={month} value={month} className="text-gray-900">
                            {PERSIAN_MONTHS[month as keyof typeof PERSIAN_MONTHS]}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="sticky right-0 bg-gray-50 px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text border-l border-gray-200">
                                  درس
                                </th>
                                {/* Grade columns 1-10 */}
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(gradeNum => (
                                  <th key={gradeNum} className="px-2 sm:px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider persian-text min-w-[60px]">
                                    <div className="truncate">
                                      نمره {gradeNum}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {monthlyGrades.map((mg) => (
                                <tr key={mg.subject_id}>
                                  <td className="sticky right-0 bg-white px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 persian-text border-l border-gray-200 max-w-[100px] sm:max-w-none">
                                    <div className="truncate" title={mg.subject_name}>
                                      {mg.subject_name}
                                    </div>
                                  </td>
                                  {Array.from({ length: 10 }, (_, i) => i + 1).map(gradeNum => (
                                    <td key={gradeNum} className="px-2 sm:px-3 py-4 whitespace-nowrap text-center">
                                      <input
                                        key={`${mg.subject_id}-${gradeNum}`}
                                        type="text"
                                        value={mg.grades[gradeNum] !== null ? 
                                          mg.grades[gradeNum]!.display : ''
                                        }
                                        onChange={(e) => handleGradeChange(mg.subject_id, gradeNum, e.target.value)}
                                        className="w-12 sm:w-16 px-1 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="-"
                                        title="می‌توانید نمره اعشاری (مثل 15.5) یا کسری (مثل 3/5) وارد کنید"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile scroll hint */}
                    <div className="text-xs text-gray-500 persian-text text-center sm:hidden">
                      برای مشاهده نمرات بیشتر، جدول را به چپ بکشید
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse pt-6 border-t">
                  <button
                    onClick={cancelGradeRegistration}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 persian-text"
                  >
                    انصراف
                  </button>
                  {currentStep === 'grades' && (
                    <button
                      onClick={saveGrades}
                      disabled={saving}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 persian-text"
                    >
                      {saving ? 'در حال ذخیره...' : 'ذخیره نمرات'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Grades List */}
        {!isNewGradeMode && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
                <h3 className="text-lg font-medium text-gray-900 persian-text">نمرات ثبت شده</h3>
                <div className="w-full sm:w-auto">
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="form-input text-sm w-full sm:w-48"
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
                            <button
                              onClick={() => handleDelete(grade.id)}
                              className="text-red-600 hover:text-red-900 persian-text"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}