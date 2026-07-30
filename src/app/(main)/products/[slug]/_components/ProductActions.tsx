'use client';

import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { FeedbackPop } from '@/components/motion/primitives';
import { cn } from '@/utils/cn';

interface ProductActionsProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ProductActions({
  onAddToCart,
  onBuyNow,
  disabled = false,
  loading = false,
}: ProductActionsProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAddClick = () => {
    onAddToCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const renderAddToCartLabel = () => {
    if (loading) return <SpinnerLoading size={16} noWrapper className="mr-2" />;
    if (justAdded) {
      return (
        <FeedbackPop show={justAdded} className="inline-flex items-center gap-2">
          <Check className="h-4 w-4" />
          Đã thêm
        </FeedbackPop>
      );
    }
    return (
      <span className="inline-flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        Thêm vào giỏ
      </span>
    );
  };

  return (
    <>
      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-4 mt-8 pb-6">
        <button
          onClick={handleAddClick}
          disabled={disabled || loading}
          className={cn(
            'w-[180px] h-12 rounded-lg border border-primary text-primary font-bold text-sm bg-primary-light hover:bg-primary/20 transition-colors flex items-center justify-center gap-2',
            (disabled || loading) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {renderAddToCartLabel()}
        </button>

        <button
          onClick={onBuyNow}
          disabled={disabled || loading}
          className={cn(
            'flex h-12 w-[180px] items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-95 motion-reduce:transition-none',
            (disabled || loading) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {loading ? <SpinnerLoading size={16} noWrapper className="mr-2" /> : 'Mua ngay'}
        </button>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex gap-3 z-50 safe-area-inset-bottom">
        <button
          onClick={handleAddClick}
          disabled={disabled || loading}
          className={cn(
            'flex-1 h-12 rounded-lg border border-primary text-primary font-bold text-sm bg-primary-light flex items-center justify-center gap-2',
            (disabled || loading) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {renderAddToCartLabel()}
        </button>

        <button
          onClick={onBuyNow}
          disabled={disabled || loading}
          className={cn(
            'flex-1 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2',
            (disabled || loading) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {loading ? <SpinnerLoading size={16} noWrapper className="mr-2" /> : 'Mua ngay'}
        </button>
      </div>
    </>
  );
}

export default ProductActions;
