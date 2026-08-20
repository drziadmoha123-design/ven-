"use client";

import React from "react";
import { Locale, translations, formatPrice } from "../../lib/i18n";
import { SlidersHorizontal, RotateCcw, Star, CheckCircle2 } from "lucide-react";

interface FilterSidebarProps {
  maxPriceLimit: number;
  currentMaxPrice: number;
  onMaxPriceChange: (price: number) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (enabled: boolean) => void;
  sortBy: string;
  onSortByChange: (sort: "newest" | "price-asc" | "price-desc") => void;
  onResetFilters: () => void;
  locale: Locale;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  maxPriceLimit,
  currentMaxPrice,
  onMaxPriceChange,
  inStockOnly,
  onInStockOnlyChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  locale,
}) => {
  const t = translations[locale];

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-xs flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2 font-bold text-sm text-[#18181B]">
          <SlidersHorizontal className="w-4 h-4 text-[#FF6B00]" />
          <span>{t.filterResults}</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-[#71717A] hover:text-[#18181B] flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t.resetFilters}</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-[#18181B] mb-2">{t.sortBy}</label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as any)}
          className="w-full bg-[#F4F4F5] border border-transparent focus:border-[#E4E4E7] focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-[#18181B] outline-none cursor-pointer transition"
        >
          <option value="newest">{t.sortNewest}</option>
          <option value="price-asc">{t.sortPriceAsc}</option>
          <option value="price-desc">{t.sortPriceDesc}</option>
        </select>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#18181B]">{t.maxPrice}</label>
          <span className="text-xs font-bold text-[#FF6B00]">{formatPrice(currentMaxPrice, locale)}</span>
        </div>
        <input
          type="range"
          min="50"
          max={Math.max(1000, maxPriceLimit)}
          step="50"
          value={currentMaxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full h-1.5 bg-[#E4E4E7] rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
        />
        <div className="flex justify-between text-[10px] text-[#A1A1AA] mt-1 font-medium">
          <span>{formatPrice(50, locale)}</span>
          <span>{formatPrice(Math.max(1000, maxPriceLimit), locale)}</span>
        </div>
      </div>

      {/* Toggle: In-Stock Only */}
      <div className="pt-2 border-t border-[#F4F4F5]">
        <label className="flex items-center justify-between cursor-pointer group select-none">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-xs font-semibold text-[#18181B] group-hover:text-[#16A34A] transition">
              {t.inStockOnly}
            </span>
          </div>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockOnlyChange(e.target.checked)}
            className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A] accent-[#16A34A] cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
