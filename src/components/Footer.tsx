import React from 'react';
import { ViewType } from '../types';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-20 pt-12 pb-16 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">شحن سريع ومجاني</h4>
              <p className="text-xs text-slate-500">للطلبات فوق 500 رس</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">نقاط ومكافآت ولائيّة</h4>
              <p className="text-xs text-slate-500">ادفع كلياً بالنقاط أو الكاش</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">دفع آمن 100%</h4>
              <p className="text-xs text-slate-500">تشفير وحماية مصرفية للبيانات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">إرجاع سهل ومضمون</h4>
              <p className="text-xs text-slate-500">خلال 14 يوماً من الاستلام</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="text-2xl font-black text-white tracking-tighter mb-4 flex items-center gap-0.5">
              Ven<span className="text-purple-500">+</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-4">
              المنصة التقنية الأولى للتسوق الذكي مع نظام مكافآت نقاط فريد يتيح لك الشراء والاستبدال بأعلى درجات المرونة والسهولة.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-purple-400 transition">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-purple-400 transition">
                  المتجر والمنتجات
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-purple-400 transition">
                  برنامج الولاء والإحالة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-purple-400 transition">
                  لوحة تحكم الإدارة
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">طرق الدفع المدعومة</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                مدى (Mada)
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                Apple Pay
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                Visa / MasterCard
              </span>
              <span className="bg-purple-950/60 border border-purple-800/60 px-3 py-1.5 rounded-lg text-purple-300 font-bold">
                نقاط Ven+
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">خدمة العملاء</h4>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              فريق الدعم متواجد على مدار الساعة لمساعدتكم في كافة الاستفسارات والطلبات.
            </p>
            <div className="text-sm font-mono text-purple-400 font-bold">support@venplus.app</div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div>جميع الحقوق محفوظة © 2026 منصة Ven+.</div>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">سياسة الخصوصية</span>
            <span className="hover:text-slate-400 cursor-pointer">الشروط والأحكام</span>
            <span className="hover:text-slate-400 cursor-pointer">سياسة الاستبدال</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
