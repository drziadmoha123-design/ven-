import React, { useState } from 'react';
import { Product } from '../../types';
import { formatMoney } from '../../lib/utils';
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart, Share2 } from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;

  // Demo gallery images
  const galleryImages = [
    product.img,
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back Button */}
      <button
        onClick={onBack}
        className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm font-medium transition group"
      >
        <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>العودة إلى قائمة المنتجات</span>
      </button>

      <div className="glass-card p-6 md:p-10 lg:p-12 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <img
                src={galleryImages[selectedImgIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount && (
                <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-purple-400/30">
                  وفر {discount}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImgIndex === idx
                      ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Category & Stock */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-400 transition rounded-full hover:bg-slate-800">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="text-sm font-bold text-white mr-1">{product.rating}</span>
              </div>
              <span className="text-xs text-slate-400">({product.reviews} تقييم من العملاء)</span>
              <span className="text-xs text-slate-600">|</span>
              <span className={`text-xs font-bold ${product.stock < 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {product.stock < 5 ? `متبقي ${product.stock} فقط` : 'متوفر في المخزن'}
              </span>
            </div>

            {/* Price Box */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl mb-6">
              <div>
                <div className="text-xs text-slate-400 mb-1">السعر النقدي (الدفع عند الاستلام)</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white font-mono">{formatMoney(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-sm text-slate-500 line-through font-mono">
                      {formatMoney(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-sm leading-relaxed mb-8">{product.desc}</p>

            {/* Quantity Stepper & Actions */}
            <div className="space-y-4 mt-auto">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-300">الكمية:</span>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-white text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة إلى السلة</span>
                </button>
                <button
                  onClick={() => onBuyNow(product, quantity)}
                  className="btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                >
                  <span>شراء فوري الآن</span>
                </button>
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-slate-800 text-center text-slate-400 text-xs">
              <div className="flex flex-col items-center gap-1.5 p-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>شحن وتوصيل سريع</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 border-r border-l border-slate-800">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>ضمان الوكيل سنتين</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2">
                <RotateCcw className="w-4 h-4 text-purple-400" />
                <span>استرجاع خلال 14 يوم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
