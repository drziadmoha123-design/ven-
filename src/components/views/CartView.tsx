import React from 'react';
import { CartItem, ViewType } from '../../types';
import { formatMoney, formatPoints } from '../../lib/utils';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onNavigate: (view: ViewType) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}) => {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal; // price is already tax-inclusive in SA or subtotal
  const pointsTotal = cart.reduce((acc, item) => acc + item.pointsPrice * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-12 md:p-16 text-center">
          <div className="w-20 h-20 mx-auto bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-500 border border-slate-800">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">سلة المشتريات فارغة</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف أحدث الأجهزة الذكية وأضف ما يعجبك.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="btn-primary px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 text-sm"
          >
            <span>تصفح المتجر الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white mb-8">سلة المشتريات ({cart.length} عناصر)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="glass-card p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-grow">
                <div className="text-[11px] text-purple-400 font-bold mb-1">{item.category}</div>
                <h3 className="font-bold text-white text-base mb-2 leading-snug line-clamp-1">{item.name}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="font-mono font-black text-white text-base">{formatMoney(item.price)}</div>
                  <div className="text-yellow-400 font-mono font-medium">أو {formatPoints(item.pointsPrice)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 mt-2 sm:mt-0">
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold font-mono text-white text-sm">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10"
                  title="حذف من السلة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="glass-card p-6 sticky top-28 space-y-6">
            <h2 className="text-lg font-bold text-white pb-4 border-b border-slate-800">ملخص الطلب</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>المجموع الفرعي:</span>
                <span className="font-mono text-white font-medium">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ضريبة القيمة المضافة (15% مشمولة):</span>
                <span className="font-mono text-white font-medium">{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>رسوم الشحن والتوصيل:</span>
                <span className="text-emerald-400 font-bold">مجاناً</span>
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
                <span className="font-bold text-white text-base">المجموع الكلي:</span>
                <div className="text-left">
                  <div className="text-2xl font-black text-purple-400 font-mono">{formatMoney(total)}</div>
                  <div className="text-xs text-yellow-400 font-mono mt-0.5">أو {formatPoints(pointsTotal)}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-xl"
            >
              <span>متابعة الشراء وإنهاء الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>دفع مشفر وآمن 100% بأحدث المعايير</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
