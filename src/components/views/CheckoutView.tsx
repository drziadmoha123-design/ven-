import React, { useState } from 'react';
import { CartItem, User } from '../../types';
import { formatMoney, formatPoints } from '../../lib/utils';
import { CreditCard, Star, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CheckoutViewProps {
  cart: CartItem[];
  user: User;
  onPlaceOrder: (orderData: {
    method: 'CASH' | 'POINTS';
    address: { name: string; phone: string; city: string; district: string; street: string };
    usedReferralCode?: string;
  }) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  user,
  onPlaceOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POINTS'>('CASH');
  const [name, setName] = useState('أحمد محمد');
  const [phone, setPhone] = useState('0501234567');
  const [city, setCity] = useState('الرياض');
  const [district, setDistrict] = useState('الملقا');
  const [street, setStreet] = useState('طريق أنس بن مالك');

  const [referralInput, setReferralInput] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const pointsTotal = cart.reduce((acc, item) => acc + item.pointsPrice * item.quantity, 0);

  const canAffordPoints = user.points >= pointsTotal;

  const handleApplyReferral = () => {
    if (!referralInput.trim()) return;
    if (referralInput.toUpperCase() === user.referralCode) {
      setReferralError('لا يمكنك استخدام كود الإحالة الخاص بك');
      return;
    }
    // Valid referral codes
    if (referralInput.toUpperCase().startsWith('VEN-') || referralInput.length >= 4) {
      setReferralApplied(true);
      setReferralError('');
    } else {
      setReferralError('كود الإحالة غير صالح أو منتهي الصلاحية');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'POINTS' && !canAffordPoints) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onPlaceOrder({
        method: paymentMethod,
        address: { name, phone, city, district, street },
        usedReferralCode: referralApplied ? referralInput.toUpperCase() : undefined,
      });
      setIsSubmitting(false);
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white mb-8">إتمام الطلب والدفع</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-mono">
                1
              </span>
              <span>عنوان الشحن والتوصيل</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input-premium py-2.5 px-4 rounded-xl text-sm"
                  placeholder="محمد السعد"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الجوال</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full input-premium py-2.5 px-4 rounded-xl text-sm font-mono text-right"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المدينة</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full input-premium py-2.5 px-4 rounded-xl text-sm bg-slate-900"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                  <option value="الخبر">الخبر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الحي</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full input-premium py-2.5 px-4 rounded-xl text-sm"
                  placeholder="اسم الحي"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الشارع والوصف التفصيلي</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full input-premium py-2.5 px-4 rounded-xl text-sm"
                  placeholder="اسم الشارع، رقم المبنى..."
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-mono">
                2
              </span>
              <span>طريقة الدفع</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cash / Card */}
              <div
                onClick={() => setPaymentMethod('CASH')}
                className={`p-5 rounded-2xl border cursor-pointer transition relative ${
                  paymentMethod === 'CASH'
                    ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-900/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-sm text-white">بطاقة بنكية / مدى</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'CASH' ? 'border-purple-500 bg-purple-500' : 'border-slate-600'
                    }`}
                  >
                    {paymentMethod === 'CASH' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  ادفع بواسطة مدى، فيزا، ماستركارد أو Apple Pay مع كاش باك 10% نقاط مجانية.
                </p>
                <div className="text-xs font-bold text-purple-300 font-mono">{formatMoney(subtotal)}</div>
              </div>

              {/* Option 2: Ven+ Points */}
              <div
                onClick={() => {
                  if (canAffordPoints) setPaymentMethod('POINTS');
                }}
                className={`p-5 rounded-2xl border transition relative ${
                  !canAffordPoints
                    ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-900/30'
                    : paymentMethod === 'POINTS'
                    ? 'border-yellow-500 bg-yellow-950/20 shadow-lg shadow-yellow-900/20 cursor-pointer'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-sm text-white">استبدال نقاط الولاء</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'POINTS' ? 'border-yellow-500 bg-yellow-500' : 'border-slate-600'
                    }`}
                  >
                    {paymentMethod === 'POINTS' && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  ادفع كلياً باستخدام رصيد نقاطك المحفوظة دون دفع أي مبلغ نقدي إضافي.
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-yellow-400 font-mono">{formatPoints(pointsTotal)}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (رصيدك: {user.points.toLocaleString('ar-SA')})
                  </span>
                </div>

                {!canAffordPoints && (
                  <div className="mt-3 text-[10px] text-rose-400 bg-rose-950/30 border border-rose-900/50 p-1.5 rounded-lg flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>رصيد نقاطك غير كافٍ لهذا الطلب</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-sm font-bold text-white mb-3">هل لديك كود إحالة أو خصم من صديق؟</h3>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={referralApplied}
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                placeholder="أدخل كود الإحالة (مثال: VEN-2026)"
                className="input-premium py-2.5 px-4 rounded-xl text-sm flex-grow font-mono uppercase"
              />
              <button
                type="button"
                disabled={referralApplied}
                onClick={handleApplyReferral}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap"
              >
                {referralApplied ? 'تم التطبيق' : 'تطبيق'}
              </button>
            </div>
            {referralApplied && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم قبول كود الإحالة بنجاح! ستحصل على 500 نقطة إضافية عند تأكيد الطلب.</span>
              </div>
            )}
            {referralError && (
              <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{referralError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary Box */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 md:p-8 sticky top-28 space-y-6">
            <h2 className="text-lg font-bold text-white pb-4 border-b border-slate-800">محتويات الطلب</h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pl-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {item.quantity} × {formatMoney(item.price)}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-white shrink-0">
                    {formatMoney(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>المجموع:</span>
                <span className="font-mono text-white">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>الشحن:</span>
                <span className="text-emerald-400 font-bold">مجاني</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-white">المبلغ المطلوب للدفع:</span>
                <div className="text-left">
                  {paymentMethod === 'CASH' ? (
                    <span className="text-2xl font-black text-purple-400 font-mono">{formatMoney(subtotal)}</span>
                  ) : (
                    <span className="text-xl font-black text-yellow-400 font-mono">{formatPoints(pointsTotal)}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (paymentMethod === 'POINTS' && !canAffordPoints)}
              className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-base shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري معالجة وتأكيد الطلب...</span>
                </>
              ) : (
                <span>تأكيد الطلب والدفع الفوري</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>بياناتك ومشترياتك محمية ومشفرة</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
