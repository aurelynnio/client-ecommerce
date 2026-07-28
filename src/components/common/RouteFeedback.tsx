'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function RouteLoading() {
  return (
    <main className="min-h-[55vh] bg-background">
      <div className="aura-container space-y-6 py-8">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function RouteError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[55vh] items-center bg-background">
      <div className="aura-container">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Không thể tải trang này</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Dữ liệu có thể tạm thời không sẵn sàng. Bạn có thể thử lại mà không làm mất vị trí hiện
            tại.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
            <Button asChild>
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
