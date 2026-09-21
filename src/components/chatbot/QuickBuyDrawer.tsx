'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParsedProduct } from './productParser';
import { useAddToCart } from '@/hooks/queries/useCart';
import { toast } from 'sonner';
import { ShoppingCart, Check, Tag, Plus, Minus } from 'lucide-react';

interface QuickBuyDrawerProps {
  product: ParsedProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickBuyDrawer({ product, isOpen, onClose }: QuickBuyDrawerProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const addToCartMutation = useAddToCart();

  if (!product) return null;

  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : product.size
        ? [product.size]
        : ['S', 'M', 'L', 'XL'];

  const availableColors =
    product.colors && product.colors.length > 0
      ? product.colors
      : ['Đen', 'Trắng', 'Xanh Navy'];

  const activeSize = selectedSize || availableSizes[0] || 'M';
  const activeColor = selectedColor || availableColors[0] || 'Mặc định';

  const handleAddToCart = async () => {
    const targetProductId = product.productId || product.id;
    if (!targetProductId) {
      window.location.href = product.productUrl;
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: targetProductId,
        shopId: '',
        quantity,
        size: activeSize,
      });

      setIsSuccess(true);
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        description: `Size: ${activeSize} • Màu: ${activeColor} • Số lượng: ${quantity}`,
        action: {
          label: 'Xem giỏ hàng',
          onClick: () => {
            window.location.href = '/cart';
          },
        },
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch {
      // If API requires product page selection
      toast.info('Vui lòng vào trang sản phẩm để hoàn tất đặt hàng nhé!', {
        action: {
          label: 'Xem chi tiết',
          onClick: () => {
            window.location.href = product.productUrl;
          },
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-5">
        <DialogHeader className="text-left pb-2 border-b border-border/80">
          <div className="flex gap-3 items-start">
            {product.image && (
              <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                {product.brand && (
                  <Badge variant="outline" className="h-4.5 px-1.5 text-[10px] font-semibold text-primary">
                    <Tag className="mr-0.5 h-2.5 w-2.5" />
                    {product.brand}
                  </Badge>
                )}
                {product.discountPercent !== undefined && product.discountPercent > 0 && (
                  <Badge className="h-4.5 bg-destructive text-white border-0 px-1 text-[10px] font-bold">
                    -{product.discountPercent}%
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                {product.name}
              </DialogTitle>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-primary">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Chọn kích cỡ và phân loại để thêm vào giỏ hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Size Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Kích cỡ (Size):</label>
              <span className="text-[11px] text-primary font-medium">Đã chọn: {activeSize}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-[42px] h-8 px-2 rounded-lg border text-xs font-bold transition-all ${
                    activeSize === sz
                      ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Màu sắc:</label>
              <span className="text-[11px] text-primary font-medium">Đã chọn: {activeColor}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 h-8 rounded-lg border text-xs font-medium transition-all ${
                    activeColor === color
                      ? 'border-primary bg-primary-light text-primary font-bold shadow-2xs'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-bold text-foreground">Số lượng:</label>
            <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-xs font-bold text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-border/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 h-9 text-xs font-medium"
          >
            Hủy
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={addToCartMutation.isPending || isSuccess}
            onClick={handleAddToCart}
            className="flex-2 h-9 text-xs font-bold gap-1.5 shadow-2xs"
          >
            {isSuccess ? (
              <>
                <Check className="h-4 w-4 text-white" />
                <span>Đã thêm thành công!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Thêm vào giỏ hàng</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
