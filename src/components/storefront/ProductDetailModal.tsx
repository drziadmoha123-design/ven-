"use client";

import React, { useState, useMemo } from "react";
import { ProductDTO, ProductVariantDTO } from "../../domain/types/catalog";
import { Locale, translations, getLocalizedText, formatPrice } from "../../lib/i18n";
import {
  X,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";

interface ProductDetailModalProps {
  product: ProductDTO | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onAddToCart: (product: ProductDTO, variant: ProductVariantDTO, quantity: number) => void;
  onBuyNow?: (product: ProductDTO, variant: ProductVariantDTO, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  locale,
  onAddToCart,
  onBuyNow,
}) => {
  const t = translations[locale];

  if (!isOpen || !product) return null;

  // Image Selection State
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const images = product.images.length > 0
    ? product.images.map((img) => img.url)
    : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"];

  // Variant Selection State
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ""
  );
  const [quantity, setQuantity] = useState<number>(1);

  const selectedVariant = useMemo(() => {
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0] || null;
  }, [product.variants, selectedVariantId]);

  const activeStock = selectedVariant?.stock || 0;
  const isOutOfStock = activeStock <= 0;
  const effectiveCashPrice = selectedVariant?.cashPrice || product.baseCashPrice;

  const title = getLocalizedText(product.titleAr, product.title, locale);
  const description = getLocalizedText(product.descriptionAr, product.description, locale);
  const categoryName = product.category
    ? getLocalizedText(product.category.nameAr, product.category.name, locale)
    : "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E4E4E7] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#71717A] hover:text-[#18181B] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Gallery Column */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4F4F5] border border-[#E4E4E7]">
              <img
                src={images[selectedImgIndex] || images[0]}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImgIndex === idx
                        ? "border-[#FF6B00] ring-2 ring-[#FFEDD5]"
                        : "border-[#E4E4E7] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-6 flex flex-col">
            {categoryName && (
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
                {categoryName}
              </span>
            )}

            <h1 className="text-xl sm:text-2xl font-black text-[#18181B] mb-3 leading-snug">
              {title}
            </h1>

            {/* Stock */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-[#F4F4F5]">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] px-2.5 py-1 rounded-md">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t.outOfStock}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#DCFCE7] px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.inStock} ({activeStock} قطعة)</span>
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-4 mb-5">
              <div className="flex flex-col gap-2">
                <div>
                  <div className="text-xs text-[#71717A] font-semibold mb-0.5">{t.cashPrice}</div>
                  <div className="text-2xl font-black text-[#18181B]">
                    {formatPrice(effectiveCashPrice, locale)}
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Selector */}
            {product.variants.length > 1 && (
              <div className="mb-5">
                <label className="block text-xs font-bold text-[#18181B] mb-2">
                  اختر النوع / المقاس / اللون:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    const variantLabel = [v.color, v.size].filter(Boolean).join(" - ") || v.sku;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border ${
                          isSelected
                            ? "bg-[#18181B] text-white border-[#18181B] shadow-xs"
                            : "bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#A1A1AA]"
                        }`}
                      >
                        <span className="truncate w-full text-center">{variantLabel}</span>
                        <span className={`text-[10px] font-normal ${isSelected ? "text-white/80" : "text-[#A1A1AA]"}`}>
                          {v.stock > 0 ? `${v.stock} متبقي` : t.outOfStock}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed mb-6">
              {description}
            </p>

            {/* Quantity and Actions */}
            <div className="mt-auto space-y-4 pt-4 border-t border-[#F4F4F5]">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#18181B]">{t.quantity}:</span>
                <div className="flex items-center bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl p-0.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-white hover:text-[#18181B] transition disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#18181B]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                    disabled={quantity >= activeStock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-white hover:text-[#18181B] transition disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    if (selectedVariant) onAddToCart(product, selectedVariant, quantity);
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isOutOfStock
                      ? "bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed border border-[#E4E4E7]"
                      : "bg-[#18181B] hover:bg-[#27272A] text-white shadow-xs"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.addToCart}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    if (selectedVariant && onBuyNow) onBuyNow(product, selectedVariant, quantity);
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isOutOfStock
                      ? "bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed border border-[#E4E4E7]"
                      : "bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs"
                  }`}
                >
                  <span>{t.buyNow}</span>
                </button>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-[#F4F4F5] text-center text-[#71717A] text-[10px]">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>{t.fastDelivery}</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-r border-l border-[#E4E4E7]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>{t.twoYearsWarranty}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>{t.fourteenDaysReturn}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
