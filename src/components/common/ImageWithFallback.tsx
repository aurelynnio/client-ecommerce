'use client';

import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

export interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholder-product.svg',
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {loading && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-inherit" />
      )}

      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/50">
          <ImageIcon className="h-8 w-8" />
        </div>
      ) : (
        <Image
          src={src || fallbackSrc}
          alt={alt || ''}
          className={cn(
            'transition-opacity duration-300',
            loading ? 'opacity-0' : 'opacity-100',
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          {...props}
        />
      )}
    </div>
  );
}
