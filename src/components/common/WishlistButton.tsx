'use client';
import { memo, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWishlistManager } from '@/hooks/queries/useWishlist';
import { useAppSelector } from '@/hooks/redux';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  showText?: boolean;
}

export const WishlistButton = memo(function WishlistButton({
  productId,
  productName,
  className,
  size = 'md',
  variant = 'icon',
  showText = false,
}: WishlistButtonProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { isInWishlist, toggleWishlist } = useWishlistManager(isAuthenticated);
  const isWishlisted = isInWishlist(productId);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(productId, productName);
    },
    [productId, productName, toggleWishlist],
  );

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const tooltipLabel = isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích';

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors',
          isWishlisted
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary',
          className,
        )}
      >
        <Heart className={cn(iconSizes[size], isWishlisted && 'fill-current')} />
        {showText && (
          <span className="text-sm font-medium">{isWishlisted ? 'Đã thích' : 'Yêu thích'}</span>
        )}
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center justify-center rounded-full transition-colors',
            sizeClasses[size],
            isWishlisted
              ? 'bg-primary/10 text-primary'
              : 'bg-card/90 text-muted-foreground hover:bg-card hover:text-primary',
            className,
          )}
          aria-label={tooltipLabel}
        >
          <Heart className={cn(iconSizes[size], isWishlisted && 'fill-current')} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltipLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
});

export default WishlistButton;
