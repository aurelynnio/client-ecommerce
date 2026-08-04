// Products page with URL-backed filters
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useInfiniteProducts } from '@/hooks/queries/useProducts';
import { useActiveCategories } from '@/hooks/queries/useCategories';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ChevronDown, Loader2, ChevronRight, Home } from 'lucide-react';
import ProductFilter from '@/components/product/ProductFilter';
import ProductGrid from '@/components/product/ProductGrid';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { ProductFilters, ProductUrlFilters } from '@/types/product';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: ProductUrlFilters = {
  search: '',
  minPrice: 0,
  maxPrice: 10000000,
  rating: '',
  colors: '',
  sizes: '',
  sortBy: 'newest',
  category: '',
};

// Available sort controls
const SORT_TABS = [
  { label: 'Phổ biến', value: 'popular' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Bán chạy', value: 'best_selling' },
  { label: 'Giá', value: 'price', hasDropdown: true },
];

const DEFAULT_MAX_PRICE = 10000000;

const formatCompactPrice = (value: number) =>
  value.toLocaleString('vi-VN', {
    maximumFractionDigits: 0,
  });

export default function ProductsPage() {
  const {
    filters: urlFilters,
    updateFilters,
    resetFilters,
  } = useUrlFilters<ProductUrlFilters>({
    defaultFilters: DEFAULT_FILTERS,
    basePath: '/products',
  });

  const { data: categoriesData } = useActiveCategories({});
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const activeCategory = (urlFilters.category as string) || null;

  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen]);

  const visibleCount = useMemo(() => {
    if (!mounted) return 7;
    if (windowWidth >= 1024) return 7;
    if (windowWidth >= 768) return 4;
    return 2;
  }, [mounted, windowWidth]);

  const visibleCategories = useMemo(() => {
    return categories.slice(0, visibleCount);
  }, [categories, visibleCount]);

  const dropdownCategories = useMemo(() => {
    return categories.slice(visibleCount);
  }, [categories, visibleCount]);

  const isActiveInDropdown = useMemo(() => {
    if (!activeCategory) return false;
    return dropdownCategories.some((cat) => cat._id === activeCategory);
  }, [activeCategory, dropdownCategories]);

  const filters: ProductFilters = useMemo(
    () => ({
      search: urlFilters.search as string,
      minPrice: Number(urlFilters.minPrice),
      maxPrice: Number(urlFilters.maxPrice),
      rating:
        (urlFilters.rating as string)
          ?.split(',')
          .map(Number)
          .filter((n) => n > 0) || [],
      colors: (urlFilters.colors as string)?.split(',').filter(Boolean) || [],
      sizes: (urlFilters.sizes as string)?.split(',').filter(Boolean) || [],
      sortBy: urlFilters.sortBy as string,
    }),
    [urlFilters],
  );

  const activeCategoryName = useMemo(() => {
    if (!activeCategory) return 'Tất cả danh mục';
    return (
      categories.find((category) => category._id === activeCategory)?.name || 'Danh mục đã chọn'
    );
  }, [activeCategory, categories]);

  const priceSort =
    filters.sortBy === 'price_desc' ? 'desc' : filters.sortBy === 'price_asc' ? 'asc' : null;

  // Debounced filters using custom hook
  const debouncedFilters = useDebounce(filters, 300);
  const debouncedCategory = useDebounce(activeCategory, 300);

  const infiniteParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = { limit: PAGE_SIZE };

    if (debouncedFilters.search) params.search = debouncedFilters.search;
    if (debouncedFilters.minPrice > 0) params.minPrice = debouncedFilters.minPrice;
    if (debouncedFilters.maxPrice < 10000000) params.maxPrice = debouncedFilters.maxPrice;
    if (debouncedFilters.sortBy !== 'newest') params.sort = debouncedFilters.sortBy;
    if (debouncedFilters.rating.length > 0) params.rating = debouncedFilters.rating.join(',');
    if (debouncedFilters.colors.length > 0) params.colors = debouncedFilters.colors.join(',');
    if (debouncedFilters.sizes.length > 0) params.sizes = debouncedFilters.sizes.join(',');
    if (debouncedCategory) params.category = debouncedCategory;

    return params;
  }, [debouncedFilters, debouncedCategory]);

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts(infiniteParams);

  const products = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.products) ?? [],
    [infiniteData?.pages],
  );
  const totalProducts = infiniteData?.pages?.[0]?.pagination.total ?? products.length;

  // Auto-fetch on scroll using IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.search ? 1 : 0) +
      filters.rating.length +
      filters.colors.length +
      filters.sizes.length +
      (filters.minPrice > 0 || filters.maxPrice < DEFAULT_MAX_PRICE ? 1 : 0) +
      (activeCategory ? 1 : 0)
    );
  }, [activeCategory, filters]);

  const appliedFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (activeCategory) labels.push(activeCategoryName);
    if (filters.search) labels.push(`Từ khóa: ${filters.search}`);
    if (filters.minPrice > 0 || filters.maxPrice < DEFAULT_MAX_PRICE) {
      labels.push(
        `Giá: ${formatCompactPrice(filters.minPrice)}đ - ${formatCompactPrice(filters.maxPrice)}đ`,
      );
    }
    if (filters.colors.length > 0) labels.push(`${filters.colors.length} màu`);
    if (filters.sizes.length > 0) labels.push(`${filters.sizes.length} kích thước`);
    if (filters.rating.length > 0) labels.push(`${filters.rating.length} mức đánh giá`);

    return labels;
  }, [activeCategory, activeCategoryName, filters]);

  const availableColors = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((product) =>
            (product.variants || [])
              .map((variant) => variant.color?.trim())
              .filter((color): color is string => Boolean(color)),
          ),
        ),
      ).slice(0, 20),
    [products],
  );

  const availableSizes = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((product) => (product.sizes || []).map((size) => size.trim()))),
      )
        .filter((size): size is string => Boolean(size))
        .slice(0, 20),
    [products],
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const updates: Partial<ProductUrlFilters> = {};

      if (newFilters.search !== undefined) updates.search = newFilters.search;
      if (newFilters.minPrice !== undefined) updates.minPrice = newFilters.minPrice;
      if (newFilters.maxPrice !== undefined) updates.maxPrice = newFilters.maxPrice;
      if (newFilters.rating !== undefined) updates.rating = newFilters.rating.join(',');
      if (newFilters.colors !== undefined) updates.colors = newFilters.colors.join(',');
      if (newFilters.sizes !== undefined) updates.sizes = newFilters.sizes.join(',');
      if (newFilters.sortBy !== undefined) updates.sortBy = newFilters.sortBy;

      updateFilters(updates);
    },
    [updateFilters],
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleSortTabClick = (value: string) => {
    if (value === 'price') {
      const newSort = priceSort === 'asc' ? 'desc' : 'asc';
      handleFilterChange({ sortBy: `price_${newSort}` });
    } else {
      handleFilterChange({ sortBy: value });
    }
  };

  const handleCategoryClick = (categoryId: string | null | undefined) => {
    updateFilters({ category: categoryId ?? '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 pt-4 pb-2 lg:px-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Home className="h-3 w-3" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">Sản phẩm</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-end justify-between border-b border-border pb-4 pt-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              {activeCategory ? activeCategoryName : 'Tất cả sản phẩm'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalProducts}</span> sản phẩm
              {activeCategory ? ` trong "${activeCategoryName}"` : ''}
            </p>
          </div>
        </div>

        {/* Category Tabs (Tmall/JD underline style) */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border no-scrollbar">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
              !activeCategory
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-current={!activeCategory ? 'page' : undefined}
          >
            Tất cả
            {!activeCategory && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          {visibleCategories.map((category) => {
            const isActive = activeCategory === category._id;
            return (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {category.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}

          {/* Dropdown for remaining categories */}
          {dropdownCategories.length > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                  isActiveInDropdown
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
              >
                Xem thêm
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    onClick={() => setIsDropdownOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div
                    className="absolute left-0 top-full z-50 mt-1 w-56 max-h-80 overflow-y-auto rounded-lg border border-border bg-card p-1 animate-in fade-in-50 zoom-in-95 duration-100"
                    role="menu"
                  >
                    {dropdownCategories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          handleCategoryClick(category._id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                          activeCategory === category._id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        role="menuitem"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md transition-colors md:top-[108px]">
        <div className="mx-auto max-w-[1440px] px-4 py-3 lg:px-6">
          <div className="w-full py-1">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">{totalProducts}</span>
                  <span className="text-muted-foreground">sản phẩm</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground">{activeCategoryName}</span>
                  {activeFiltersCount > 0 ? (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {activeFiltersCount} bộ lọc đang áp dụng
                      </span>
                    </>
                  ) : null}
                </div>
                {appliedFilterLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {appliedFilterLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {label}
                      </span>
                    ))}
                    <button
                      onClick={handleClearFilters}
                      className="rounded-full border border-transparent px-1 text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa áp dụng bộ lọc nào. Bạn có thể bắt đầu từ danh mục, giá hoặc màu sắc.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {SORT_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => handleSortTabClick(tab.value)}
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                        filters.sortBy === tab.value ||
                        (tab.value === 'price' && filters.sortBy?.startsWith('price'))
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                      {tab.hasDropdown ? (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            priceSort === 'desc' ? 'rotate-180' : ''
                          }`}
                        />
                      ) : null}
                    </button>
                  ))}
                </div>

                <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-border bg-card text-foreground hover:bg-muted lg:hidden"
                    >
                      <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] overflow-y-auto border-r border-border bg-card p-0"
                  >
                    <SheetHeader className="border-b border-border px-5 py-4">
                      <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                    </SheetHeader>
                    <div className="p-4">
                      <ProductFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        availableColors={availableColors}
                        availableSizes={availableSizes}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            availableColors={availableColors}
            availableSizes={availableSizes}
          />

          <div className="flex-1 min-h-[500px] relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
                <SpinnerLoading />
              </div>
            )}

            <div className="w-full">
              <ProductGrid products={products || []} isLoading={isLoading && !products?.length} />
            </div>

            {products.length > 0 && (
              <div
                ref={sentinelRef}
                className="mt-6 flex min-h-[3rem] items-center justify-center"
                aria-live="polite"
                aria-busy={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Đang tải thêm sản phẩm...
                  </div>
                ) : hasNextPage ? (
                  <Button
                    variant="outline"
                    className="h-11 rounded-lg border-primary/25 bg-card px-8 text-primary hover:bg-primary/10"
                    onClick={() => fetchNextPage()}
                  >
                    Xem thêm sản phẩm
                  </Button>
                ) : (
                  products.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Bạn đã xem tất cả {products.length} sản phẩm
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
