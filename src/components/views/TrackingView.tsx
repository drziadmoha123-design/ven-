import React from 'react';
import { Order, ViewType } from '../../types';
import { CheckCircle2, Clock, Truck, Package, ArrowLeft, ArrowRight, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface TrackingViewProps {
  order: Order | null;
  onNavigate: (view: ViewType) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ order, onNavigate }) => {
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="glass-card p-12">
          <p className="text-slate-400 mb-6">لا يوجد طلب محدد للتتبع حالياً.</p>
          <button onClick={() => onNavigate('account')} className="btn-primary px-8 py-3 rounded-xl font-bold">
            عرض قائمة طلباتي
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: 'تم استلام الطلب', desc: 'تم تسجيل طلبك واعتماد عملية الدفع', icon: CheckCircle2 },
    { key: 'Processing', label: 'قيد التجهيز والتغليف', desc: 'يقوم المستودع بتجهيز المنتجات وفحص الجودة', icon: Package },
    { key: 'Shipped', label: 'تم الشحن والتسليم لمندوب التوصيل', desc: 'الطلب في طريقه إليك عبر الشحن السريع', icon: Truck },
    { key: 'Delivered', label: 'تم التسليم بنجاح', desc: 'تم استلام الشحنة من قبل العميل', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb */}
      <button
        onClick={() => onNavigate('account')}
        className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-medium transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة لحسابي وطلباتي</span>
      </button>

      {/* Success Badge Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-10 mb-8 text-center relative overflow-hidden"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-2">شكراً لطلبك من Ven+!</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
          تم اعتماد طلبك بنجاح ونعمل الآن على تجهيزه وتسليمه في أسرع وقت.
        </p>
        <div className="inline-flex items-center gap-3 bg-slate-900 px-5 py-2 rounded-full border border-slate-800 text-sm">
          <span className="text-slate-400">رقم الطلب:</span>
          <span className="text-purple-400 font-mono font-bold">{order.id}</span>
        </div>
      </motion.div>

      {/* Tracking Timeline Card */}
      <div className="glass-card p-6 md:p-10 mb-8">
        <h2 className="text-lg font-bold text-white mb-8 pb-4 border-b border-slate-800">
          مراحل ومسار الشحنة المباشر
        </h2>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute right-6 top-6 bottom-6 w-0.5 bg-slate-800 hidden sm:block"></div>
          <div
            className="absolute right-6 top-6 w-0.5 bg-purple-500 transition-all duration-700 hidden sm:block"
            style={{ height: `${(activeIndex / 3) * 100}%` }}
          ></div>

          <div className="space-y-8 relative">
            {steps.map((step, idx) => {
              const isCompleted = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all z-10 ${
                      isCurrent
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40 ring-4 ring-purple-600/20'
                        : isCompleted
                        ? 'bg-slate-900 border-purple-500/50 text-purple-400'
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>

                  <div className="pt-1">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-base font-bold transition ${
                          isCurrent ? 'text-purple-300 font-black' : isCompleted ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 animate-pulse">
                          المرحلة الحالية
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="glass-card p-6 md:p-8 mb-12">
        <h3 className="text-sm font-bold text-white mb-4 pb-3 border-b border-slate-800">تفاصيل الطلب المسجل</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">تاريخ الطلب:</span>
            <span className="font-bold text-white font-mono">{order.date}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">طريقة الدفع:</span>
            <span className="font-bold text-white">
              {order.method === 'POINTS' ? 'نقاط الولاء Ven+' : 'بطاقة مدى / ائتمانية'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">المبلغ الإجمالي:</span>
            <span className="font-bold text-purple-400 font-mono text-sm">{order.total}</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-4 justify-between">
          <button
            onClick={() => onNavigate('products')}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <span>متابعة التسوق</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('account')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            <span>عرض كل طلباتي في الحساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
