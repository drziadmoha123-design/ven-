"use client";

import React from "react";
import { Locale, translations } from "../../lib/i18n";
import { Search, ShoppingBag, Languages } from "lucide-react";

interface StorefrontHeaderProps {
  currentTab: "all" | "admin";
  onTabChange: (tab: "all" | "admin") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  locale: Locale;
  onLocaleChange: (loc: Locale) => void;
  onOpenCart?: () => void;
  onOpenAccount?: () => void;
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  cartCount,
  locale,
  onLocaleChange,
  onOpenCart,
  onOpenAccount,
}) => {
  const t = translations[locale];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E4E7] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-6 sm:gap-8">
          <div
            onClick={() => onTabChange("all")}
            className="cursor-pointer select-none flex items-baseline gap-1 font-black text-2xl tracking-tight text-[#09090B]"
          >
            <span>VEN</span>
            <span className="text-[#FF6B00] text-3xl font-extrabold leading-none">+</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange("all")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                currentTab === "all"
                  ? "bg-[#18181B] text-white"
                  : "text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5]"
              }`}
            >
              {t.store}
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[#F4F4F5] border border-transparent focus:border-[#E4E4E7] focus:bg-white rounded-xl py-2 pr-10 pl-4 text-sm text-[#18181B] placeholder-[#A1A1AA] outline-none transition"
            />
          </div>
        </div>

        {/* Right Actions: Language Switcher, Cart, Account */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => onLocaleChange(locale === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B] transition border border-[#E4E4E7]"
            title={locale === "ar" ? "Switch to English" : "التحويل للعربية"}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "English" : "عربي"}</span>
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-lg text-[#18181B] hover:bg-[#F4F4F5] transition"
            title={t.cart}
          >
            <ShoppingBag className="w-5 h-5 text-[#18181B]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[11px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
