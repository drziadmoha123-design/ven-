import React from 'react';
import { Product, ViewType } from '../../types';
import { formatMoney, formatPoints } from '../../lib/utils';
import { ArrowLeft, Star, ShoppingCart, Laptop, Smartphone, Headphones, Gamepad2, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  products: Product[];
  onNavigate: (view: ViewType) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 mb-16 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=2000&auto=format&fit=crop"
            alt="Hero Tech"
            className="w-full h-full object-cover opacity-35 mix-blend-luminosity"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

        <div className="relative z-10 p-8 md:p-16 lg:p-20 w-full md:w-3/4 lg:w-2/3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-300 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-purple-500/25 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>الإطلاق الجديد 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.15] tracking-tight text-white"
          >
            مستقبل التقنية <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              بين يديك اليوم.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 mb-10 max-w-lg text-base md:text-lg leading-relaxed"
          >
            تسوق أحدث الأجهزة الذكية الفاخرة. ادفع بالطريقة التي تناسبك نقدياً أو استخدم نقاطك المكتسبة للحصول على مشترياتك بالكامل.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => onNavigate('products')}
              className="btn-primary px-8 py-4 rounded-xl font-bold text-base md:text-lg flex items-center gap-3"
            >
              <span>تسوّق التشكيلة الجديدة</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('account')}
              className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded-xl font-bold transition flex items-center gap-3 backdrop-blur"
            >
              <span>اكتشف برنامج الولاء</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Categories Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div
          onClick={() => onNavigate('products')}
          className="glass-card p-6 text-center hover-lift cursor-pointer group"
        >
          <div className="w-14 h-14 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center mb-4 text-purple-400 border border-slate-700/80 group-hover:bg-purple-600 group-hover:text-white transition">
            <Laptop className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">أجهزة كمبيوتر</h3>
          <p className="text-xs text-slate-400 mt-1">ماك بوك ولابتوبات</p>
        </div>

        <div
          onClick={() => onNavigate('products')}
          className="glass-card p-6 text-center hover-lift cursor-pointer group"
        >
          <div className="w-14 h-14 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center mb-4 text-purple-400 border border-slate-700/80 group-hover:bg-purple-600 group-hover:text-white transition">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">هواتف ذكية</h3>
          <p className="text-xs text-slate-400 mt-1">آيفون وأحدث الهواتف</p>
        </div>

        <div
          onClick={() => onNavigate('products')}
          className="glass-card p-6 text-center hover-lift cursor-pointer group"
        >
          <div className="w-14 h-14 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center mb-4 text-purple-400 border border-slate-700/80 group-hover:bg-purple-600 group-hover:text-white transition">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">صوتيات فاخرة</h3>
          <p className="text-xs text-slate-400 mt-1">سماعات عازلة للضوضاء</p>
        </div>

        <div
          onClick={() => onNavigate('products')}
          className="glass-card p-6 text-center hover-lift cursor-pointer group"
        >
          <div className="w-14 h-14 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center mb-4 text-purple-400 border border-slate-700/80 group-hover:bg-purple-600 group-hover:text-white transition">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">ألعاب ومنصات</h3>
          <p className="text-xs text-slate-400 mt-1">بلايستيشن وشاشات</p>
        </div>
      </div>

      {/* Featured Products */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">وصل حديثاً</h2>
          <p className="text-slate-400 text-sm">أحدث المنتجات المضافة للمتجر بأفضل الأسعار</p>
        </div>
        <button
          onClick={() => onNavigate('products')}
          className="text-purple-400 font-bold hover:text-purple-300 transition flex items-center gap-2 text-sm"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.slice(0, 4).map((p) => {
          const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
          return (
            <div key={p.id} className="glass-card overflow-hidden hover-lift flex flex-col group h-full">
              <div
                className="relative aspect-[4/3] overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => onSelectProduct(p)}
              >
                {discount && (
                  <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-purple-400/30 z-10">
                    خصم {discount}%
                  </div>
                )}
                {p.isNew && (
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 z-10">
                    جديد
                  </div>
                )}
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent h-1/2 opacity-60"></div>
                <button
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur border border-slate-700 flex items-center justify-center text-slate-300 hover:text-rose-400 transition z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col flex-grow bg-slate-900/40">
                <div className="text-[10px] text-purple-400 font-bold mb-1.5 uppercase tracking-wider">
                  {p.category}
                </div>
                <h3
                  onClick={() => onSelectProduct(p)}
                  className="font-bold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-purple-300 transition text-white leading-snug"
                >
                  {p.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-slate-200 font-bold">{p.rating}</span>
                  <span className="text-slate-500">({p.reviews})</span>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800">
                  <div className="flex items-end gap-2">
                    <span className="font-black text-lg text-white font-mono">{formatMoney(p.price)}</span>
                    {p.oldPrice && (
                      <span className="text-xs text-slate-500 line-through mb-0.5">{formatMoney(p.oldPrice)}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-yellow-400 mt-1 flex items-center gap-1 font-medium font-mono">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span>{formatPoints(p.pointsPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(p)}
                  className="w-full mt-4 bg-slate-800/80 hover:bg-purple-600 border border-slate-700 hover:border-purple-500 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>أضف للسلة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
