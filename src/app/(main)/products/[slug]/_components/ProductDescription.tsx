'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Product } from '@/types/product';

interface ProductDescriptionProps {
  product: Product;
}

export function ProductDescription({ product }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasImages = product.descriptionImages && product.descriptionImages.length > 0;
  const hasText = product.description && product.description.trim().length > 0;

  if (!hasImages && !hasText) {
    return (
      <section id="section-description" className="py-8">
        <h2 className="text-lg font-bold mb-6">Mô tả chi tiết</h2>
        <p className="text-muted-foreground text-sm">Chưa có mô tả sản phẩm</p>
      </section>
    );
  }

  return (
    <section id="section-description" className="py-8">
      <h2 className="text-lg font-bold mb-6">Mô tả chi tiết</h2>

      {/* Text Description - Always show if available */}
      {hasText && (
        <div className="prose prose-sm max-w-none p-6 bg-muted/50 rounded-lg mb-6">
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Description Images */}
      {hasImages && (
        <div
          className={cn(
            'relative flex flex-col overflow-hidden transition-[max-height] duration-300 motion-reduce:transition-none',
            !isExpanded && 'max-h-[600px] lg:max-h-none',
          )}
        >
          {product.descriptionImages!.map((img, index) => (
            <div key={index} className="w-full relative">
              <Image
                src={img}
                alt={`${product.name} - Mô tả ${index + 1}`}
                width={900}
                height={0}
                style={{ height: 'auto' }}
                className="w-full"
                loading="lazy"
              />
            </div>
          ))}

          {/* Fade overlay for collapsed state on mobile */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-card border-t border-border lg:hidden" />
          )}
        </div>
      )}

      {/* Expand/Collapse Button - Mobile only */}
      {hasImages && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-3 text-sm font-medium text-primary transition-colors hover:bg-muted lg:hidden"
        >
          {isExpanded ? (
            <>
              Thu gọn <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Xem thêm <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Price Explanation Block */}
      <div className="mt-8 space-y-6 border-t border-border bg-muted/30 p-6 text-xs leading-relaxed text-muted-foreground lg:p-10">
        <h3 className="font-bold text-foreground text-sm tracking-wide uppercase">Giải thích giá:</h3>
        <div className="space-y-4">
          <div>
            <strong className="text-foreground block mb-1">Giá gạch ngang</strong>
            <p>
              Giá gạch ngang là giá bán lẻ đề xuất, giá hướng dẫn của nhà sản xuất, hoặc giá bán
              trước đó. Đây không phải giá gốc và chỉ mang tính tham khảo.
            </p>
          </div>
          <div>
            <strong className="text-foreground block mb-1">Giá hiện tại</strong>
            <p>
              Đây là giá bán thực tế của sản phẩm. Giá có thể thay đổi tùy theo chương trình khuyến
              mãi hoặc mã giảm giá. Giá cuối cùng sẽ được hiển thị tại trang thanh toán.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDescription;
