'use client';
import { memo, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlistManager } from '@/hooks/queries/useWishlist';
import { useAppSelector } from '@/hooks/redux';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

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

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const buttonSizes = {
    sm: 'icon-sm' as const,
    md: 'icon' as const,
    lg: 'icon-lg' as const,
  };

  const tooltipLabel = isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích';

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        onClick={handleClick}
        className={cn(
          'gap-2 transition-colors',
          isWishlisted
            ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
            : 'text-muted-foreground hover:text-primary',
          className,
        )}
      >
        <Heart className={cn(iconSizes[size], isWishlisted && 'fill-current')} />
        {showText && (
          <span className="text-sm font-medium">{isWishlisted ? 'Đã thích' : 'Yêu thích'}</span>
        )}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={buttonSizes[size]}
          onClick={handleClick}
          className={cn(
            'rounded-full transition-colors p-0',
            isWishlisted
              ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
              : 'bg-card/90 text-muted-foreground hover:bg-card hover:text-primary',
            className,
          )}
          aria-label={tooltipLabel}
        >
          <Heart className={cn(iconSizes[size], isWishlisted && 'fill-current')} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltipLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
});

export default WishlistButton;
