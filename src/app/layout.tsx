import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';

// Toaster 동적 로드 (코드 분할)
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

export const metadata: Metadata = {
  title: '송가네 미션 앱',
  description: '우리 가족 미션 관리 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '송가네 미션',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#235390',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto min-h-screen bg-white">
          {children}
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '16px',
              fontWeight: 600,
            },
          }}
        />
      </body>
    </html>
  );
}
