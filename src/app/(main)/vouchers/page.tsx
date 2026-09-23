'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, Home, Search, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { VoucherCard } from '@/components/vouchers/VoucherCard';
import { usePlatformVouchers, useSavedVoucherIds, useSaveVoucher } from '@/hooks/queries';
import { useAppSelector } from '@/hooks/redux';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function VouchersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed_amount'>('all');

  const { data: vouchers = [], isLoading, error } = usePlatformVouchers();
  const { data: savedIds = [] } = useSavedVoucherIds({ enabled: isAuthenticated });
  const saveVoucherMutation = useSaveVoucher();

  const savedIdSet = useMemo(() => new Set(savedIds), [savedIds]);

  const filtered = useMemo(
    () =>
      vouchers.filter(
        (voucher) =>
          (filterType === 'all' || voucher.type === filterType) &&
          (!searchQuery ||
            voucher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            voucher.code.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [filterType, searchQuery, vouchers],
  );

  const collect = async (voucherId: string) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu voucher vào ví cá nhân');
      router.push('/login');
      return;
    }
    try {
      await saveVoucherMutation.mutateAsync(voucherId);
      toast.success('Đã lưu voucher vào ví của bạn.');
    } catch {
      toast.error('Không thể lưu voucher vào ví');
    }
  };
  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container">
        <Breadcrumb className="mb-3">
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  <span>Trang chủ</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Voucher</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="border-b border-border pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Voucher công khai</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Lưu mã phù hợp để dùng khi thanh toán
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="gap-2 self-start sm:self-auto border-border/80">
            <Link href="/profile?tab=vouchers">
              <Ticket className="h-4 w-4 text-primary" />
              <span>Ví voucher của tôi ({savedIds.length})</span>
            </Link>
          </Button>
        </header>
        <section className="flex flex-col gap-3 border-b border-border py-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc mã voucher"
              className="h-10 rounded-lg border-border pl-9 focus:border-primary focus:ring-primary/20"
            />
          </div>
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value as typeof filterType)}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm focus:border-primary focus:ring-primary/20 focus:outline-none"
          >
            <option value="all">Tất cả loại</option>
            <option value="percentage">Giảm phần trăm</option>
            <option value="fixed_amount">Giảm số tiền</option>
          </select>
        </section>
        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <SpinnerLoading />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Không thể tải voucher công khai lúc này.
          </div>
        ) : filtered.length ? (
          <section className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((voucher) => (
              <VoucherCard
                key={voucher._id}
                voucher={voucher}
                isCollected={savedIdSet.has(voucher._id)}
                onCollect={collect}
              />
            ))}
          </section>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30">
              <Ticket className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground">Không tìm thấy voucher phù hợp.</p>
          </div>
        )}
      </div>
    </main>
  );
}
