import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ven+ | Production Commerce & Loyalty Platform',
  description: 'Production-grade commerce, loyalty points, and referral platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#FAFAFA] text-[#18181B] antialiased">
        {children}
      </body>
    </html>
  );
}
