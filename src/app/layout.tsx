import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سیستم مدیریت مدرسه",
  description: "وب‌اپلیکیشن مدیریت کلاس‌ها، دروس، دانش‌آموزان و نمرات",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مدیریت مدرسه",
    startupImage: [
      {
        url: "/apple-touch-icon.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "سیستم مدیریت مدرسه",
    title: "سیستم مدیریت مدرسه",
    description: "وب‌اپلیکیشن مدیریت کلاس‌ها، دروس، دانش‌آموزان و نمرات",
  },
  twitter: {
    card: "summary",
    title: "سیستم مدیریت مدرسه",
    description: "وب‌اپلیکیشن مدیریت کلاس‌ها، دروس، دانش‌آموزان و نمرات",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="مدیریت مدرسه" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Apple Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="مدیریت مدرسه" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icon-192x192.svg" />
        <link rel="mask-icon" href="/apple-touch-icon.svg" color="#2563eb" />
        
        {/* Splash Screens for iOS */}
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.svg" />
        
        {/* Prevent zoom on input focus (iOS) */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-vazir antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
