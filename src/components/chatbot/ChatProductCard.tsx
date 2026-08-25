'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ExternalLink, Check, ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { ParsedProduct } from './productParser';
import { toast } from 'sonner';
import { useAddToCart } from '@/hooks/queries/useCart';

interface ChatProductCardProps {
  product: ParsedProduct;
  className?: string;
}

export default function ChatProductCard({ product, className }: ChatProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.productId) {
      toast.info('Vui lòng xem chi tiết sản phẩm để chọn size và màu sắc nhé!', {
        action: {
          label: 'Xem chi tiết',
          onClick: () => {
            window.location.href = product.productUrl;
          },
        },
      });
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product.productId,
        shopId: '', // Default or resolved by backend
        quantity: 1,
      });
      setIsAdded(true);
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        description: 'Bạn có thể xem giỏ hàng bất cứ lúc nào.',
        action: {
          label: 'Xem giỏ hàng',
          onClick: () => {
            window.location.href = '/cart';
          },
        },
      });
      setTimeout(() => setIsAdded(false), 2500);
    } catch {
      // If mutation requires options like size/model, guide user to product page
      toast.info('Vui lòng xem chi tiết để chọn kích cỡ & phân loại phù hợp!', {
        action: {
          label: 'Xem ngay',
          onClick: () => {
            window.location.href = product.productUrl;
          },
        },
      });
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border border-border/80 bg-card p-3 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md',
        className,
      )}
    >
      {/* Top badges */}
      <div className="mb-2 flex items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {product.brand && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold text-primary">
              <Tag className="mr-0.5 h-2.5 w-2.5" />
              {product.brand}
            </Badge>
          )}
          {product.category && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground">
              {product.category}
            </Badge>
          )}
        </div>

        {product.discountPercent !== undefined && product.discountPercent > 0 && (
          <Badge className="h-5 bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
            -{product.discountPercent}%
          </Badge>
        )}
      </div>

      {/* Product Title */}
      <Link
        href={product.productUrl}
        className="line-clamp-2 text-xs font-bold text-foreground transition-colors hover:text-primary hover:underline"
        title={product.name}
      >
        {product.name}
      </Link>

      {/* Price section */}
      <div className="mt-2 flex items-baseline gap-1.5">
        {product.price && (
          <span className="text-sm font-extrabold text-primary">
            {product.price}
          </span>
        )}
        {product.originalPrice && (
          <span className="text-[11px] text-muted-foreground line-through">
            {product.originalPrice}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-border/60">
        <Link
          href={product.productUrl}
          className="flex-1 inline-flex h-7 items-center justify-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Chi tiết</span>
        </Link>

        {product.checkoutUrl ? (
          <Link
            href={product.checkoutUrl}
            className="flex-1 inline-flex h-7 items-center justify-center gap-1 rounded-md bg-primary px-2 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover shadow-xs"
          >
            <ShoppingBag className="h-3 w-3" />
            <span>Mua ngay</span>
          </Link>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || isAdded}
            className="flex-1 h-7 text-[11px] px-2 font-semibold shadow-xs"
          >
            {isAdded ? (
              <>
                <Check className="h-3 w-3 text-success" />
                <span>Đã thêm</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3" />
                <span>Thêm giỏ</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
