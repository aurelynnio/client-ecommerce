// Reusable restrained filter rail; displayed in a Sheet on compact viewports.
'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ProductFilters } from '@/types/product';

interface ProductFilterProps {
  filters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onClearFilters: () => void;
  availableColors?: string[];
  availableSizes?: string[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#6B7280',
  navy: '#1E3A8A',
  beige: '#E5E0D6',
  brown: '#92400E',
  green: '#065F46',
  blue: '#1E40AF',
  red: '#DC2626',
  yellow: '#F59E0B',
  purple: '#7C3AED',
  pink: '#EC4899',
  orange: '#F97316',
};

const getColorHex = (color: string) => {
  const normalized = color.trim().toLowerCase();
  return COLOR_HEX_MAP[normalized] || '#9CA3AF';
};

export default function ProductFilter({
  filters,
  onFilterChange,
  onClearFilters,
  availableColors = [],
  availableSizes = [],
  isMobileOpen = false,
  onMobileClose,
}: ProductFilterProps) {
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const handlePriceCommit = () => {
    onFilterChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const handleRatingChange = (rating: number) => {
    const newRatings = filters.rating.includes(rating)
      ? filters.rating.filter((r) => r !== rating)
      : [...filters.rating, rating];
    onFilterChange({ rating: newRatings });
  };

  const handleColorChange = (colorValue: string) => {
    const newColors = filters.colors.includes(colorValue)
      ? filters.colors.filter((c) => c !== colorValue)
      : [...filters.colors, colorValue];
    onFilterChange({ colors: newColors });
  };

  const handleSizeChange = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ sizes: newSizes });
  };

  const activeFiltersCount =
    filters.rating.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.search ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 10000000 ? 1 : 0);

  const [searchTerm, setSearchTerm] = useState(filters.search);

  useEffect(() => {
    if (filters.search === searchTerm) return;

    // Sync local input value to external filter changes (e.g. "clear filters")
    // without setting state directly inside an effect body.
    const id = setTimeout(() => {
      setSearchTerm(filters.search);
    }, 0);

    return () => clearTimeout(id);
  }, [filters.search, searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange({ search: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm, onFilterChange, filters.search]);

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: true,
    color: true,
    size: true,
  });

  const colorOptions = Array.from(
    new Set([...availableColors, ...filters.colors].map((color) => color.trim()).filter(Boolean)),
  ).slice(0, 20);

  const sizeOptions = Array.from(
    new Set([...availableSizes, ...filters.sizes].map((size) => size.trim()).filter(Boolean)),
  ).slice(0, 20);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filterContent = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Bộ lọc tìm kiếm</h2>
          {activeFiltersCount > 0 && (
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="h-7 w-7 rounded-lg hover:bg-muted lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm trong danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 rounded-lg border-border bg-card pl-8 text-sm"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-border pt-3">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <Label className="cursor-pointer text-sm font-semibold text-foreground">Khoảng giá</Label>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.price && (
          <div className="mt-3 space-y-3">
            <div className="px-1">
              <Slider
                min={0}
                max={10000000}
                step={100000}
                value={priceRange}
                onValueChange={handlePriceChange}
                onValueCommit={handlePriceCommit}
                className="my-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₫
                </span>
                <Input
                  type="text"
                  value={priceRange[0].toLocaleString('vi-VN')}
                  readOnly
                  className="h-8 rounded-lg border-border bg-card pl-5 text-xs"
                />
              </div>
              <span className="text-xs text-muted-foreground">-</span>
              <div className="flex-1 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₫
                </span>
                <Input
                  type="text"
                  value={priceRange[1].toLocaleString('vi-VN')}
                  readOnly
                  className="h-8 rounded-lg border-border bg-card pl-5 text-xs"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePriceCommit}
              className="h-8 w-full rounded-lg border-primary/20 bg-primary/5 text-xs text-primary hover:bg-primary/10"
            >
              Áp dụng
            </Button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-t border-border pt-3">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left"
        >
          <Label className="cursor-pointer text-sm font-semibold text-foreground">Đánh giá</Label>
          {expandedSections.rating ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.rating && (
          <div className="mt-3 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  filters.rating.includes(rating) ? 'bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex">
                  {Array.from({ length: rating }).map((_, i) => (
                    <span key={i} className="text-star text-sm">
                      ★
                    </span>
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <span key={i} className="text-muted-foreground/40 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">trở lên</span>
                {filters.rating.includes(rating) && (
                  <Check className="ml-auto h-3 w-3 text-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="border-t border-border pt-3">
        <button
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full text-left"
        >
          <Label className="cursor-pointer text-sm font-semibold text-foreground">Màu sắc</Label>
          {expandedSections.color ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.color && (
          <div className="mt-3 flex flex-wrap gap-2">
            {colorOptions.length > 0 ? (
              colorOptions.map((colorValue) => (
                <button
                  key={colorValue}
                  type="button"
                  onClick={() => handleColorChange(colorValue)}
                  className={`
                  relative flex h-7 w-7 items-center justify-center rounded transition-[border-color,background-color,box-shadow] duration-200
                  ${
                    filters.colors.includes(colorValue)
                      ? 'ring-2 ring-primary ring-offset-1 ring-offset-card'
                      : 'hover:scale-[1.02]'
                  }
                `}
                  style={{ backgroundColor: getColorHex(colorValue) }}
                  title={colorValue}
                >
                  {filters.colors.includes(colorValue) && (
                    <Check
                      className={`h-3 w-3 ${
                        getColorHex(colorValue) === '#FFFFFF' ||
                        getColorHex(colorValue) === '#E5E0D6'
                          ? 'text-foreground'
                          : 'text-white'
                      }`}
                      strokeWidth={3}
                    />
                  )}
                </button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Không có tùy chọn màu</span>
            )}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="border-t border-border pt-3">
        <button
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full text-left"
        >
          <Label className="cursor-pointer text-sm font-semibold text-foreground">Kích thước</Label>
          {expandedSections.size ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.size && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizeOptions.length > 0 ? (
              sizeOptions.map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSizeChange(size)}
                  className={`
                  h-7 rounded px-3 text-xs transition-[border-color,background-color,color,box-shadow]
                  ${
                    filters.sizes.includes(size)
                      ? 'border-primary bg-primary text-primary-foreground hover:bg-primary-hover'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }
                `}
                >
                  {size}
                </Button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Không có tùy chọn size</span>
            )}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="mt-2 h-9 w-full rounded-lg border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted"
          onClick={onClearFilters}
        >
          <X className="h-3.5 w-3.5 mr-1.5" />
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  );

  // Mobile version
  if (isMobileOpen) {
    return (
      <>
        <div onClick={onMobileClose} className="fixed inset-0 z-40 bg-black/35 lg:hidden" />
        <div className="fixed top-0 bottom-0 left-0 z-50 w-[280px] overflow-y-auto border-r border-border bg-card lg:hidden">
          <div className="p-4">{filterContent}</div>
        </div>
      </>
    );
  }

  // Desktop version - Sidebar only
  return (
    <div className="hidden lg:block w-full shrink-0">
      <div className="sticky top-[150px] h-fit max-h-[calc(100vh-170px)] overflow-y-auto pr-6 py-2">
        {filterContent}
      </div>
    </div>
  );
}
