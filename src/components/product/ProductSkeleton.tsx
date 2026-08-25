import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col gap-0 py-0 overflow-hidden border-border bg-card">
      {/* Image skeleton - square to match ProductCard */}
      <Skeleton className="aspect-square w-full rounded-none" />
      {/* Content skeleton */}
      <div className="space-y-1.5 p-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/5" />
        </div>
        <div className="pt-1.5 border-t border-border/50">
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </Card>
  );
}
