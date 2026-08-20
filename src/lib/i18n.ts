export type Locale = "ar" | "en";

export interface Translations {
  siteTitle: string;
  tagline: string;
  home: string;
  store: string;
  categories: string;
  cart: string;
  checkout: string;
  account: string;
  adminPanel: string;
  searchPlaceholder: string;
  searchResultsFor: string;
  showingResults: string;
  of: string;
  productsCount: string;
  allCategories: string;
  filterResults: string;
  resetFilters: string;
  priceFilter: string;
  maxPrice: string;
  minPrice: string;
  inStockOnly: string;
  sortBy: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  addToCart: string;
  buyNow: string;
  outOfStock: string;
  inStock: string;
  onlyLeft: string;
  cashPrice: string;
  discount: string;
  newBadge: string;
  backToProducts: string;
  specifications: string;
  quantity: string;
  color: string;
  size: string;
  fastDelivery: string;
  twoYearsWarranty: string;
  fourteenDaysReturn: string;
  noProductsFound: string;
  noProductsHint: string;
  egp: string;
}

export const translations: Record<Locale, Translations> = {
  ar: {
    siteTitle: "منصة VEN+ للتجارة الإلكترونية",
    tagline: "أفضل الإلكترونيات والمنتجات الأصلية مع شحن وتوصيل فوري",
    home: "الرئيسية",
    store: "المتجر",
    categories: "التصنيفات",
    cart: "السلة",
    checkout: "إتمام الطلب",
    account: "حسابي",
    adminPanel: "لوحة الإدارة",
    searchPlaceholder: "ابحث عن المنتجات والتصنيفات...",
    searchResultsFor: "نتائج البحث عن",
    showingResults: "عرض",
    of: "من أصل",
    productsCount: "منتج",
    allCategories: "جميع التصنيفات",
    filterResults: "تصفية النتائج",
    resetFilters: "إعادة ضبط",
    priceFilter: "تصفية السعر",
    maxPrice: "الحد الأقصى للسعر",
    minPrice: "الحد الأدنى للسعر",
    inStockOnly: "المتوفر في المخزن فقط",
    sortBy: "ترتيب حسب",
    sortNewest: "الأحدث والمميز",
    sortPriceAsc: "السعر: من الأقل للأعلى",
    sortPriceDesc: "السعر: من الأعلى للأقل",
    addToCart: "إضافة إلى السلة",
    buyNow: "شراء فوري الآن",
    outOfStock: "نفذت الكمية",
    inStock: "متوفر بالمخزن",
    onlyLeft: "متبقي",
    cashPrice: "السعر النقدي (شامل الضريبة)",
    discount: "خصم",
    newBadge: "جديد",
    backToProducts: "العودة لقائمة المنتجات",
    specifications: "المواصفات التقنية",
    quantity: "الكمية",
    color: "اللون",
    size: "المقاس",
    fastDelivery: "شحن وتوصيل سريع (2-3 أيام)",
    twoYearsWarranty: "ضمان محلي معتمد",
    fourteenDaysReturn: "استرجاع خلال 14 يوم",
    noProductsFound: "لم يتم العثور على أي منتجات مطابقة",
    noProductsHint: "جرب تغيير كلمات البحث أو إعادة تعيين الفلاتر.",
    egp: "ج.م",
  },
  en: {
    siteTitle: "VEN+ E-Commerce Platform",
    tagline: "Premium original electronics with fast instant shipping",
    home: "Home",
    store: "Store",
    categories: "Categories",
    cart: "Cart",
    checkout: "Checkout",
    account: "Account",
    adminPanel: "Admin Panel",
    searchPlaceholder: "Search products and categories...",
    searchResultsFor: "Search results for",
    showingResults: "Showing",
    of: "of",
    productsCount: "products",
    allCategories: "All Categories",
    filterResults: "Filter Results",
    resetFilters: "Reset Filters",
    priceFilter: "Price Filter",
    maxPrice: "Max Price",
    minPrice: "Min Price",
    inStockOnly: "In-stock only",
    sortBy: "Sort by",
    sortNewest: "Newest & Featured",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    onlyLeft: "Only",
    cashPrice: "Cash Price (VAT Incl.)",
    discount: "OFF",
    newBadge: "NEW",
    backToProducts: "Back to Products",
    specifications: "Technical Specifications",
    quantity: "Quantity",
    color: "Color",
    size: "Size",
    fastDelivery: "Fast Shipping (2-3 Days)",
    twoYearsWarranty: "Certified Local Warranty",
    fourteenDaysReturn: "14-Day Easy Return",
    noProductsFound: "No matching products found",
    noProductsHint: "Try adjusting your search criteria or resetting filters.",
    egp: "EGP",
  },
};

export function getLocalizedText(
  arValue: string | null | undefined,
  enValue: string | null | undefined,
  locale: Locale
): string {
  if (locale === "ar") {
    return arValue?.trim() || enValue?.trim() || "";
  }
  return enValue?.trim() || arValue?.trim() || "";
}

export function formatPrice(amount: number, locale: Locale = "ar"): string {
  if (locale === "ar") {
    return `${amount.toLocaleString("ar-EG")} ج.م`;
  }
  return `${amount.toLocaleString("en-US")} EGP`;
}
