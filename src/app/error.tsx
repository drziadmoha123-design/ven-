'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] text-[#18181B]">
      <div className="max-w-md w-full bg-white border border-[#E4E4E7] rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-[#71717A] mb-6">يرجى المحاولة مرة أخرى أو تحديث الصفحة.</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B00] text-white font-medium hover:bg-[#FF8C00] transition cursor-pointer"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
