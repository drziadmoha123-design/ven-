import React, { useState } from 'react';
import { AdminStats, Order, Product, ViewType } from '../../types';
import { formatMoney } from '../../lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  Package,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  Layers,
} from 'lucide-react';

interface AdminViewProps {
  stats: AdminStats;
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onNavigate: (view: ViewType) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  stats,
  orders,
  products,
  onUpdateOrderStatus,
  onAddProduct,
  onNavigate,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(999);
  const [newProdCategory, setNewProdCategory] = useState('إلكترونيات');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdImg, setNewProdImg] = useState(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop'
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;
    onAddProduct({
      name: newProdName,
      price: newProdPrice,
      pointsPrice: newProdPrice * 10,
      category: newProdCategory,
      rating: 5.0,
      reviews: 1,
      img: newProdImg,
      desc: newProdDesc || 'منتج عالي الجودة مع ضمان شامل.',
      stock: newProdStock,
      isNew: true,
    });
    setShowAddModal(false);
    setNewProdName('');
    setNewProdDesc('');
  };

  const revenueData = [
    { day: 'السبت', val: 12500 },
    { day: 'الأحد', val: 15000 },
    { day: 'الإثنين', val: 11000 },
    { day: 'الثلاثاء', val: 18500 },
    { day: 'الأربعاء', val: 16000 },
    { day: 'الخميس', val: 24000 },
    { day: 'الجمعة', val: 32000 },
  ];
  const maxRev = Math.max(...revenueData.map((d) => d.val));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-slate-900/90 border border-indigo-500/30 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-black text-white">لوحة تحكم الإدارة (Ven+ Admin)</h1>
          </div>
          <p className="text-xs text-slate-400">إدارة العمليات، المبيعات المباشرة، وحركات نقاط الولاء</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>عرض المتجر</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">إجمالي المبيعات (نقدياً)</p>
              <h3 className="text-2xl font-black text-white font-mono">{formatMoney(stats.totalSales)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span>+18.4%</span>
            <span className="text-slate-500 font-normal">مقارنة بالشهر الماضي</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">إجمالي الطلبات</p>
              <h3 className="text-2xl font-black text-white font-mono">{stats.ordersCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-blue-400 font-bold">
            <span>{orders.filter((o) => o.status === 'Pending').length} طلبات جديدة قيد الانتظار</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">العملاء النشطون</p>
              <h3 className="text-2xl font-black text-white font-mono">{stats.customers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold">
            <span>94% نسبة إعادة الشراء</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">نقاط الولاء المصروفة</p>
              <h3 className="text-2xl font-black text-yellow-400 font-mono">
                {(stats.pointsSpent / 1000).toFixed(1)}k
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-yellow-400" />
            </div>
          </div>
          <div className="text-[11px] text-yellow-500/90 font-mono">
            من أصل {(stats.pointsIssued / 1000).toFixed(0)}k نقطة تم إصدارها
          </div>
        </div>
      </div>

      {/* Analytics Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Weekly Revenue Bar Chart */}
        <div className="lg:col-span-8 glass-card p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-white">حركة المبيعات اليومية (الأسبوع الحالي)</h3>
            <span className="text-xs text-purple-400 font-mono font-bold">إجمالي الأسبوع: 129,000 رس</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {revenueData.map((item, idx) => {
              const heightPercent = Math.round((item.val / maxRev) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-mono text-purple-300 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {item.val.toLocaleString('ar-SA')} رس
                  </div>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl transition-all duration-300 group-hover:from-purple-500 group-hover:to-indigo-400 relative"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-xs text-slate-400 mt-2 font-medium">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-4 glass-card p-6">
          <h3 className="text-base font-bold text-white mb-6">المنتجات الأكثر مبيعاً</h3>
          <div className="space-y-5">
            {stats.topProducts.map((p, idx) => {
              const maxSold = stats.topProducts[0].sold;
              const width = Math.max(20, Math.round((p.sold / maxSold) * 100));
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-white truncate max-w-[180px]">
                      {idx + 1}. {p.name}
                    </span>
                    <span className="text-purple-400 font-mono">{p.sold} قطعة</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="glass-card p-6 md:p-8 mb-12 overflow-hidden">
        <h3 className="text-base font-bold text-white mb-6">إدارة الطلبات الحالية وتغيير الحالات</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-3">
                <th className="py-3 px-4 font-bold">رقم الطلب</th>
                <th className="py-3 px-4 font-bold">التاريخ</th>
                <th className="py-3 px-4 font-bold">العناصر</th>
                <th className="py-3 px-4 font-bold">المبلغ</th>
                <th className="py-3 px-4 font-bold">طريقة الدفع</th>
                <th className="py-3 px-4 font-bold">الحالة الحالية</th>
                <th className="py-3 px-4 font-bold text-center">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((order) => {
                const statusColors = {
                  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                  Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  Shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                };

                const statusArabic = {
                  Pending: 'تم الاستلام',
                  Processing: 'قيد التجهيز',
                  Shipped: 'تم الشحن',
                  Delivered: 'تم التسليم',
                };

                return (
                  <tr key={order.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-4 font-mono font-bold text-white">{order.id}</td>
                    <td className="py-4 px-4 text-slate-400">{order.date}</td>
                    <td className="py-4 px-4 text-slate-300">{order.itemsCount} عناصر</td>
                    <td className="py-4 px-4 font-mono font-bold text-purple-300">{order.total}</td>
                    <td className="py-4 px-4">
                      {order.method === 'POINTS' ? (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400" /> نقاط
                        </span>
                      ) : (
                        <span className="text-slate-300">كاش / بطاقة</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full border font-bold ${statusColors[order.status]}`}>
                        {statusArabic[order.status]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="Pending">تم الاستلام (Pending)</option>
                        <option value="Processing">قيد التجهيز (Processing)</option>
                        <option value="Shipped">تم الشحن (Shipped)</option>
                        <option value="Delivered">تم التسليم (Delivered)</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 md:p-8 relative bg-slate-900 border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800">إضافة منتج جديد للمتجر</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full input-premium py-2 px-3 rounded-xl text-sm"
                  placeholder="مثال: سماعات رأس لاسلكية برو"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر النقدي (رس)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full input-premium py-2 px-3 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الكمية بالمخزن</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full input-premium py-2 px-3 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">التصنيف</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full input-premium py-2 px-3 rounded-xl text-sm bg-slate-900"
                >
                  <option value="إلكترونيات">إلكترونيات</option>
                  <option value="هواتف ذكية">هواتف ذكية</option>
                  <option value="صوتيات">صوتيات</option>
                  <option value="أجهزة كمبيوتر">أجهزة كمبيوتر</option>
                  <option value="ألعاب">ألعاب</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط الصورة (URL)</label>
                <input
                  type="url"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full input-premium py-2 px-3 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">وصف المنتج</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  rows={2}
                  className="w-full input-premium py-2 px-3 rounded-xl text-sm"
                  placeholder="وصف تفصيلي وميزات المنتج..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button type="submit" className="btn-primary flex-1 py-2.5 rounded-xl font-bold text-sm">
                  حفظ ونشر المنتج
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
