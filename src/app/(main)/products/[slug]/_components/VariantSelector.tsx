'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';
import { Variant, getVariantDisplay } from '@/types/product';

interface VariantSelectorProps {
  variants: Variant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  // Size selection props
  sizes?: string[];
  selectedSize?: string | null;
  onSizeSelect?: (size: string) => void;
}

export function VariantSelector({
  variants,
  selectedIndex,
  onSelect,
  sizes = [],
  selectedSize = null,
  onSizeSelect,
}: VariantSelectorProps) {
  const selectedVariant = variants[selectedIndex];
  const hasVariants = variants.length > 0;
  const hasSizes = sizes.length > 0;

  if (!hasVariants && !hasSizes) return null;

  return (
    <div className="space-y-5">
      {/* Variant/Color Selection */}
      {hasVariants && (
        <div className="flex items-start gap-4">
          <span className="text-sm text-gray-400 w-16 pt-2 shrink-0">Màu sắc</span>
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {variants.map((variant, index) => {
                const isOutOfStock = variant.stock <= 0;
                const isSelected = selectedIndex === index;

                return (
                  <button
                    key={variant._id}
                    onClick={() => !isOutOfStock && onSelect(index)}
                    disabled={isOutOfStock}
                    className={cn(
                      'flex items-center gap-2 p-1.5 border rounded-lg transition-[border-color,background-color,box-shadow] overflow-hidden bg-white text-left',
                      isSelected
                        ? 'border-primary ring-1 ring-primary bg-primary-light'
                        : 'border-border hover:border-muted-foreground/30',
                      isOutOfStock && 'opacity-50 cursor-not-allowed bg-muted',
                    )}
                  >
                    {/* Variant Image */}
                    {variant.images?.[0] && (
                      <div className="w-10 h-10 relative bg-muted/40 shrink-0 rounded overflow-hidden">
                        <Image
                          src={variant.images[0]}
                          alt={variant.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    )}

                    {/* Variant Name */}
                    <div className="flex-1 min-w-0 pr-1">
                      <span className="text-xs text-gray-700 line-clamp-2 font-medium">
                        {variant.name || getVariantDisplay(variant)}
                      </span>
                      {isOutOfStock && (
                        <span className="text-[10px] text-red-500 block">Hết hàng</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Size Selection */}
      {hasSizes && (
        <div className="flex items-start gap-4">
          <span className="text-sm text-gray-400 w-16 pt-2 shrink-0">Kích cỡ</span>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    onClick={() => onSizeSelect?.(size)}
                    className={cn(
                      'min-w-[48px] h-10 px-4 border rounded-lg text-sm font-medium transition-[border-color,background-color,color,box-shadow]',
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-card text-foreground hover:border-muted-foreground/30 hover:bg-muted/40',
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {!selectedSize && sizes.length > 0 && (
              <p className="text-xs text-orange-500 mt-2">Vui lòng chọn kích cỡ</p>
            )}
          </div>
        </div>
      )}

      {/* Selected Info Summary */}
      {(selectedVariant || selectedSize) && (
        <div className="flex items-center gap-3 text-sm text-gray-600 bg-muted/30 border border-border p-3 rounded-lg">
          <span className="text-gray-400">Đã chọn:</span>
          {selectedVariant && (
            <span className="font-medium text-gray-800">
              {selectedVariant.name || getVariantDisplay(selectedVariant)}
            </span>
          )}
          {selectedVariant && selectedSize && <span className="text-gray-300">•</span>}
          {selectedSize && (
            <span className="font-medium text-gray-800">Kích cỡ {selectedSize}</span>
          )}
          <span className="text-gray-300">|</span>
          <span>
            Kho:{' '}
            <strong
              className={
                selectedVariant && selectedVariant.stock <= 5 ? 'text-orange-500' : 'text-gray-800'
              }
            >
              {selectedVariant?.stock || 0}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

export default VariantSelector;
