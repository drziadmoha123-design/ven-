export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] text-[#18181B]">
      <div className="max-w-2xl w-full bg-white border border-[#E4E4E7] rounded-2xl p-8 shadow-sm text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#FF6B00] font-semibold text-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
          منصة VEN+ للتجارة والولاء — الإصدار الإنتاجي
        </div>
        <h1 className="text-3xl font-bold text-[#18181B] mb-2 tracking-tight">
          VEN<span className="text-[#FF6B00]">+</span> Platform
        </h1>
        <p className="text-[#71717A] text-base leading-relaxed mb-6">
          Next.js 15+ App Router • PostgreSQL • Prisma ORM • Append-Only Ledger Baseline
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="text-xs text-[#71717A] mb-1">بيئة التشغيل</div>
            <div className="text-sm font-semibold text-[#18181B]">Next.js 15 App Router</div>
          </div>
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="text-xs text-[#71717A] mb-1">قاعدة البيانات</div>
            <div className="text-sm font-semibold text-[#18181B]">PostgreSQL + Prisma</div>
          </div>
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="text-xs text-[#71717A] mb-1">حالة الهيكلة</div>
            <div className="text-sm font-semibold text-[#16A34A]">جاهز لـ Phase 01</div>
          </div>
        </div>
      </div>
    </main>
  );
}
