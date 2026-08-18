import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] text-[#18181B]">
      <div className="max-w-md w-full bg-white border border-[#E4E4E7] rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold mb-2">404 - الصفحة غير موجودة</h2>
        <p className="text-[#71717A] mb-6">عذراً، الصفحة المطلوبة غير متوفرة.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#18181B] text-white font-medium hover:bg-[#27272A] transition"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
