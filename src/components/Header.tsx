import React from 'react';
import { ViewType, User } from '../types';
import { ShoppingBag, Star, Search, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  cartCount: number;
  user: User;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  cartCount,
  user,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <>
      {/* Top Demo Bar */}
      <div className="fixed top-0 left-0 w-full bg-slate-950/95 backdrop-blur border-b border-purple-500/30 z-[100] py-2 px-4 flex items-center justify-between text-xs font-mono shadow-2xl">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-1.5 ml-3 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white font-bold tracking-wider uppercase font-sans">Ven+ Prototype</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
                currentView === 'home'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('products')}
              className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
                currentView === 'products' || currentView === 'product-details'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              المتجر
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className={`px-2.5 py-1 rounded transition whitespace-nowrap flex items-center gap-1 ${
                currentView === 'cart'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              السلة <span className="text-purple-300 font-bold font-mono">({cartCount})</span>
            </button>
            <button
              onClick={() => onNavigate('checkout')}
              className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
                currentView === 'checkout'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              الدفع
            </button>
            <button
              onClick={() => onNavigate('account')}
              className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
                currentView === 'account'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              حسابي
            </button>
          </div>
        </div>

        <button
          onClick={() => onNavigate(currentView === 'admin' ? 'home' : 'admin')}
          className="bg-indigo-900/60 text-indigo-200 border border-indigo-500/40 px-3 py-1 rounded hover:bg-indigo-800/80 transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ml-2"
        >
          {currentView === 'admin' ? (
            <>
              <ArrowRight className="w-3.5 h-3.5" /> العودة للمتجر
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" /> لوحة الإدارة (Admin)
            </>
          )}
        </button>
      </div>

      {/* Main Header (Storefront) */}
      {currentView !== 'admin' && (
        <header className="glass fixed top-[41px] left-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div
                onClick={() => onNavigate('home')}
                className="text-3xl font-black text-white tracking-tighter cursor-pointer flex items-center gap-0.5 select-none"
              >
                Ven<span className="text-purple-500 font-extrabold">+</span>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-8">
                <button
                  onClick={() => onNavigate('home')}
                  className={`text-sm font-bold transition ${
                    currentView === 'home' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الرئيسية
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className={`text-sm font-medium transition ${
                    currentView === 'products' ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  المنتجات
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className="text-sm font-medium text-slate-400 hover:text-white transition"
                >
                  التصنيفات
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> العروض والنقاط
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-full max-w-[260px] hidden md:block">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (currentView !== 'products') onNavigate('products');
                  }}
                  placeholder="ابحث عن أحدث المنتجات..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-white placeholder-slate-500"
                />
              </div>

              {/* Points Wallet Badge */}
              <div
                onClick={() => onNavigate('account')}
                className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-700/80 cursor-pointer hover:border-yellow-500/50 transition shadow-inner group"
                title="محفظة نقاط الولاء الخاصة بك"
              >
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-yellow-50 font-mono">
                    {user.points.toLocaleString('ar-SA')}
                  </span>
                  <span className="text-[10px] text-yellow-400/80 font-medium">نقطة</span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="p-2 text-slate-400 hover:text-rose-400 transition"
                  title="المفضلة"
                >
                  <Heart className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onNavigate('cart')}
                  className="relative p-2 text-slate-300 hover:text-white transition group"
                  title="سلة المشتريات"
                >
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold border-2 border-[#020617] animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('account')}
                  className="p-1.5 text-slate-300 hover:text-white transition mr-1"
                  title="حسابي"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    أم
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
};
