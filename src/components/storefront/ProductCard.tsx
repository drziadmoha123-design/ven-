"use client";

import React from "react";
import { ProductDTO } from "../../domain/types/catalog";
import { Locale, translations, getLocalizedText, formatPrice } from "../../lib/i18n";
import { ShoppingBag, AlertCircle } from "lucide-react";

interface ProductCardProps {
  product: ProductDTO;
  locale: Locale;
  onSelect: (product: ProductDTO) => void;
  onAddToCart?: (product: ProductDTO) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  locale,
  onSelect,
  onAddToCart,
}) => {
  const t = translations[locale];
  const title = getLocalizedText(product.titleAr, product.title, locale);
  const categoryName = product.category
    ? getLocalizedText(product.category.nameAr, product.category.name, locale)
    : "";

  const isOutOfStock = product.totalStock <= 0;
  const imageSrc =
    product.primaryImage?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop";

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white border border-[#E4E4E7] rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#D4D4D8] transition-all flex flex-col cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-[#F4F4F5] overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Stock Status Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#DC2626] text-[11px] font-bold px-2 py-0.5 rounded-md border border-[#FEE2E2] shadow-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{t.outOfStock}</span>
            </span>
          ) : product.totalStock <= 3 ? (
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#D97706] text-[11px] font-bold px-2 py-0.5 rounded-md border border-[#FEF3C7] shadow-xs">
              <span>{t.onlyLeft} {product.totalStock}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {categoryName && (
          <div className="text-[11px] font-semibold text-[#71717A] mb-1 truncate">
            {categoryName}
          </div>
        )}

        <h3 className="font-bold text-sm text-[#18181B] group-hover:text-[#FF6B00] transition line-clamp-2 leading-snug mb-2">
          {title}
        </h3>

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-[#F4F4F5] flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-[#71717A] font-medium">{t.cashPrice}</div>
            <div className="text-base font-black text-[#18181B]">
              {formatPrice(product.minPrice, locale)}
              {product.minPrice !== product.maxPrice && (
                <span className="text-xs font-normal text-[#71717A] mx-1">- {formatPrice(product.maxPrice, locale)}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) onAddToCart(product);
              else onSelect(product);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              isOutOfStock
                ? "bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed"
                : "bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-xs"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.addToCart}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
