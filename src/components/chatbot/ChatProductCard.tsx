'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  onQuickBuy?: (product: ParsedProduct) => void;
}

export default function ChatProductCard({
  product,
  className,
  onQuickBuy,
}: ChatProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addToCartMutation = useAddToCart();

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If quick-buy sheet handler is provided, prioritize it for variant selection
    if (onQuickBuy) {
      onQuickBuy(product);
      return;
    }

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
        shopId: '',
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
        'group relative flex flex-col rounded-xl border border-border/70 bg-card p-3 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-xs',
        className,
      )}
    >
      {/* Top badges */}
      <div className="mb-2 flex items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {product.brand && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-semibold text-primary border-primary/30"
            >
              <Tag className="mr-0.5 h-2.5 w-2.5" />
              {product.brand}
            </Badge>
          )}
          {product.category && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground">
              {product.category}
            </Badge>
          )}
          {product.size && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
            >
              Size: {product.size}
            </Badge>
          )}
        </div>

        {product.discountPercent !== undefined && product.discountPercent > 0 && (
          <Badge className="h-5 bg-destructive/10 text-destructive border-0 px-1.5 text-[10px] font-bold">
            -{product.discountPercent}%
          </Badge>
        )}
      </div>

      {/* Main product row with optional thumbnail */}
      <div className="flex gap-2.5 items-start">
        {product.image && (
          <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/60">
            <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {/* Product Title */}
          <Link
            href={product.productUrl}
            className="line-clamp-2 text-xs font-semibold text-foreground transition-colors hover:text-primary"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Price section */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            {product.price && (
              <span className="text-sm font-bold text-primary">{product.price}</span>
            )}
            {product.originalPrice && (
              <span className="text-[11px] text-muted-foreground line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-border/60">
        <Link
          href={product.productUrl}
          className="flex-1 inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Chi tiết</span>
        </Link>

        {onQuickBuy ? (
          <Button
            size="sm"
            variant="default"
            onClick={() => onQuickBuy(product)}
            className="flex-1 h-7 text-[11px] px-2 font-semibold shadow-2xs rounded-lg gap-1"
          >
            <ShoppingBag className="h-3 w-3" />
            <span>Mua nhanh</span>
          </Button>
        ) : product.checkoutUrl ? (
          <Link
            href={product.checkoutUrl}
            className="flex-1 inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-primary px-2 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover shadow-2xs"
          >
            <ShoppingBag className="h-3 w-3" />
            <span>Mua ngay</span>
          </Link>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={handleAction}
            disabled={addToCartMutation.isPending || isAdded}
            className="flex-1 h-7 text-[11px] px-2 font-semibold shadow-2xs rounded-lg"
          >
            {isAdded ? (
              <>
                <Check className="h-3 w-3 text-white" />
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
