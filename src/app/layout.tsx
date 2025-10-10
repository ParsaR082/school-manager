import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سیستم مدیریت مدرسه",
  description: "وب‌اپلیکیشن مدیریت کلاس‌ها، دروس، دانش‌آموزان و نمرات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-vazir antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
