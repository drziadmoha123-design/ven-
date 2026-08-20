"use client";

import React from "react";
import { CategoryDTO } from "../../domain/types/catalog";
import { Locale, translations, getLocalizedText } from "../../lib/i18n";
import { LayoutGrid } from "lucide-react";

interface CategoryFilterProps {
  categories: CategoryDTO[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  locale: Locale;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  locale,
  }) => {
  const t = translations[locale];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
          selectedCategoryId === null
            ? "bg-[#18181B] text-white shadow-xs"
            : "bg-white border border-[#E4E4E7] text-[#71717A] hover:text-[#18181B] hover:border-[#D4D4D8]"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>{t.allCategories}</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        const name = getLocalizedText(cat.nameAr, cat.name, locale);

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shrink-0 ${
              isSelected
                ? "bg-[#18181B] text-white shadow-xs"
                : "bg-white border border-[#E4E4E7] text-[#71717A] hover:text-[#18181B] hover:border-[#D4D4D8]"
            }`}
          >
            <span>{name}</span>
            {cat.productCount !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#F4F4F5] text-[#71717A]"
                }`}
              >
                {cat.productCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
