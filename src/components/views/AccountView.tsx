import React from 'react';
import { User, Order, ViewType } from '../../types';
import { Copy, Check, Package, Gift, ArrowLeft, ExternalLink, UserCheck } from 'lucide-react';

interface AccountViewProps {
  user: User;
  orders: Order[];
  onNavigate: (view: ViewType) => void;
  onSelectOrderForTracking: (order: Order) => void;
  onCopyReferral: () => void;
  copied: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  orders,
  onNavigate,
  onSelectOrderForTracking,
  onCopyReferral,
  copied,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* User Header Profile */}
      <div className="glass-card p-6 md:p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-purple-600/20">
            {user.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <p className="text-sm text-slate-400 font-mono mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                حساب موثق
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('products')}
          className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold whitespace-nowrap"
        >
          تصفح المتجر
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Orders History List */}
        <div className="lg:col-span-8">
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 pb-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span>سجل الطلبات السابقة</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{orders.length} طلبات</span>
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">لم تقم بإجراء أي طلبات حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusColors: Record<string, string> = {
                    Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                    Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    Shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
                  };

                  const statusArabic: Record<string, string> = {
                    Pending: 'تم الاستلام',
                    Processing: 'قيد التجهيز',
                    Shipped: 'تم الشحن',
                    Delivered: 'تم التسليم',
                    Cancelled: 'ملغي',
                  };

                  return (
                    <div
                      key={order.id}
                      onClick={() => onSelectOrderForTracking(order)}
                      className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 p-5 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-black text-white text-base">{order.id}</span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                statusColors[order.status]
                              }`}
                            >
                              {statusArabic[order.status]}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-4">
                            <span>{order.date}</span>
                            <span>•</span>
                            <span>{order.itemsCount} منتجات</span>
                            <span>•</span>
                            <span>دفع نقد / بطاقة</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-left">
                            <div className="font-mono font-black text-base text-white">{order.total}</div>
                          </div>
                          <div className="text-xs text-purple-400 group-hover:text-purple-300 font-bold flex items-center gap-1">
                            <span>تتبع الطلب</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Referral System Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 md:p-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">برنامج إحالة الأصدقاء</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              شارك كود الإحالة الخاص بك مع أصدقائك للحصول على خصومات وعروض حصرية على طلباتهم القادمة.
            </p>

            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mb-4">
              <div className="text-[10px] text-slate-400 mb-1">كود الإحالة الحصري الخاص بك:</div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black font-mono text-purple-400 tracking-wider">
                  {user.referralCode}
                </span>
                <button
                  onClick={onCopyReferral}
                  className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
