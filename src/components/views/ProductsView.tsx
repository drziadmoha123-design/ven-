import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { formatMoney, formatPoints } from '../../lib/utils';
import { Filter, Star, ShoppingCart, Heart, RotateCcw } from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  searchQuery: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [pointsOnly, setPointsOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => cats.add(p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesPrice = p.price <= maxPrice;
        const matchesSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.desc || p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPoints = !pointsOnly || p.pointsPrice <= 40000;
        return matchesCategory && matchesPrice && matchesSearch && matchesPoints;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      });
  }, [products, selectedCategory, maxPrice, searchQuery, pointsOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setMaxPrice(10000);
    setPointsOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="glass-card p-6 sticky top-28">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                <span>تصفية النتائج</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="font-bold text-sm text-slate-300 mb-3">التصنيفات</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 accent-purple-600 rounded bg-slate-800 border-slate-700"
                      />
                      <span
                        className={`text-sm transition ${
                          selectedCategory === cat ? 'text-purple-300 font-bold' : 'text-slate-400 group-hover:text-white'
                        }`}
                      >
                        {cat === 'all' ? 'جميع التصنيفات' : cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="border-t border-slate-800 pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm text-slate-300">الحد الأقصى للسعر</h4>
                  <span className="text-xs font-mono text-purple-400 font-bold">{formatMoney(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Points Filter */}
              <div className="border-t border-slate-800 pt-6">
                <label className="flex items-center justify-between cursor-pointer group bg-slate-900/60 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white font-medium">مناسب لرصيد نقاطك</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pointsOnly}
                    onChange={(e) => setPointsOnly(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Products Grid */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6 gap-4">
            <div className="text-sm text-slate-400">
              عرض <span className="text-white font-bold font-mono">{filteredProducts.length}</span> من أصل{' '}
              <span className="text-white font-bold font-mono">{products.length}</span> منتج
              {searchQuery && <span className="mr-2 text-purple-300">نتائج البحث عن: "{searchQuery}"</span>}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-400 shrink-0">ترتيب حسب:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-premium py-1.5 px-3 rounded-xl text-sm bg-slate-900 text-white outline-none cursor-pointer"
              >
                <option value="newest">الأحدث والمميز</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400">
              <p className="text-lg font-bold text-white mb-2">لم يتم العثور على أي منتجات مطابقة</p>
              <p className="text-sm mb-6">جرب تغيير معايير البحث أو تصفية السعر والتصنيفات.</p>
              <button onClick={resetFilters} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold">
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
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
          )}
        </div>
      </div>
    </div>
  );
};
