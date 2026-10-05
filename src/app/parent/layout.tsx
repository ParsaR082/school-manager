import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سامانه والدین - مدیریت مدرسه',
  description: 'سامانه مخصوص والدین برای مشاهده اطلاعات فرزندان',
};

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {children}
    </div>
  );
}