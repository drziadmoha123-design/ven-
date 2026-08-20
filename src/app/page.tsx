"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StorefrontHeader } from "../components/storefront/StorefrontHeader";
import { CategoryFilter } from "../components/storefront/CategoryFilter";
import { FilterSidebar } from "../components/storefront/FilterSidebar";
import { ProductCard } from "../components/storefront/ProductCard";
import { ProductDetailModal } from "../components/storefront/ProductDetailModal";
import { ProductDTO, CategoryDTO, ProductVariantDTO } from "../domain/types/catalog";
import { Locale, translations } from "../lib/i18n";
import { Loader2, PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("ar");
  const [currentTab, setCurrentTab] = useState<"all" | "admin">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(5000);
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [page, setPage] = useState(1);

  // Data States
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Product for Modal
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cart State
  const [cartCount, setCartCount] = useState(0);

  const t = translations[locale];

  // Fetch Catalog
  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
      if (currentMaxPrice) params.set("maxPrice", currentMaxPrice.toString());
      if (inStockOnly) params.set("inStockOnly", "true");
      if (sortBy) params.set("sortBy", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setProducts(json.data.items || []);
        setTotalCount(json.data.total || 0);
        setTotalPages(json.data.totalPages || 1);
        if (json.data.priceRange?.max) {
          setMaxPriceLimit(Math.max(1000, json.data.priceRange.max));
        }
        if (json.data.availableCategories) {
          setCategories(json.data.availableCategories);
        }
      } else {
        setError(json.error?.message || "Failed to load catalog");
      }
    } catch (err) {
      console.error("Catalog fetch error:", err);
      setError("Network error while loading catalog.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategoryId, currentMaxPrice, inStockOnly, sortBy, page]);

  // Initial categories fetch
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
      }
    }
    fetchCategories();
  }, []);

  // Trigger catalog fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCatalog]);

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery("");
    setCurrentMaxPrice(maxPriceLimit);
    setInStockOnly(false);
    setSortBy("newest");
    setPage(1);
  };

  const handleSelectProduct = (prod: ProductDTO) => {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  const handleAddToCart = (
    prod: ProductDTO,
    variant?: ProductVariantDTO,
    quantity = 1
  ) => {
    setCartCount((prev) => prev + quantity);
    setIsModalOpen(false);
  };

  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#18181B] flex flex-col font-sans ${locale === "ar" ? "rtl" : "ltr"}`} dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Authoritative Navigation Header */}
      <StorefrontHeader
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        cartCount={cartCount}
        locale={locale}
        onLocaleChange={setLocale}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Category Navigation Pills */}
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              setPage(1);
            }}
            locale={locale}
          />

          {/* Layout: Sidebar + Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-3">
              <FilterSidebar
                maxPriceLimit={maxPriceLimit}
                currentMaxPrice={currentMaxPrice}
                onMaxPriceChange={setCurrentMaxPrice}
                inStockOnly={inStockOnly}
                onInStockOnlyChange={setInStockOnly}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onResetFilters={handleResetFilters}
                locale={locale}
              />
            </div>

            {/* Products Area */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              {/* Result count / active query bar */}
              <div className="flex items-center justify-between text-xs text-[#71717A] pb-2 border-b border-[#E4E4E7]">
                <div>
                  {t.showingResults}{" "}
                  <span className="font-bold text-[#18181B]">{products.length}</span> {t.of}{" "}
                  <span className="font-bold text-[#18181B]">{totalCount}</span> {t.productsCount}
                  {searchQuery && (
                    <span className="text-[#FF6B00] font-semibold mx-2">
                      • {t.searchResultsFor}: "{searchQuery}"
                    </span>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-[#71717A]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mb-3" />
                  <p className="text-xs font-semibold">جاري تحميل المنتجات المعتمدة...</p>
                </div>
              ) : products.length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-[#E4E4E7] rounded-3xl p-12 text-center text-[#71717A]">
                  <PackageSearch className="w-12 h-12 text-[#A1A1AA] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-[#18181B] mb-1">{t.noProductsFound}</h3>
                  <p className="text-xs mb-6 leading-relaxed">{t.noProductsHint}</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#18181B] text-white hover:bg-[#27272A] transition"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              ) : (
                /* Products Grid */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        locale={locale}
                        onSelect={handleSelectProduct}
                        onAddToCart={(p) => handleAddToCart(p)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#E4E4E7]">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#E4E4E7] text-[#18181B] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>السابق</span>
                      </button>

                      <span className="text-xs font-semibold text-[#71717A] px-3">
                        صفحة {page} من {totalPages}
                      </span>

                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#E4E4E7] text-[#18181B] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1"
                      >
                        <span>التالي</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locale={locale}
        onAddToCart={(prod, variant, qty) => handleAddToCart(prod, variant, qty)}
        onBuyNow={(prod, variant, qty) => {
          handleAddToCart(prod, variant, qty);
        }}
      />
    </div>
  );
}
