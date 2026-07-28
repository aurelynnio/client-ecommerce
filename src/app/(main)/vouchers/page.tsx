'use client';

import { useMemo, useState } from 'react';
import { Gift, Search, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { VoucherCard } from '@/components/vouchers/VoucherCard';
import { usePlatformVouchers } from '@/hooks/queries';

export default function VouchersPage() {
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed_amount'>('all');
  const { data: vouchers = [], isLoading, error } = usePlatformVouchers();
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
  const collect = (id: string) => {
    setCollectedIds((previous) => new Set(previous).add(id));
    toast.success('Đã lưu voucher vào ví của bạn.');
  };
  return (
    <main className="min-h-screen bg-background">
      <div className="aura-container py-7 sm:py-10">
        <header className="border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Voucher công khai</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Lưu mã phù hợp để dùng khi thanh toán.
              </p>
            </div>
          </div>
        </header>
        <section className="flex flex-col gap-3 border-b border-border py-5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc mã voucher"
              className="pl-9"
            />
          </div>
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value as typeof filterType)}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
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
          <section className="grid grid-cols-1 gap-4 py-7 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((voucher) => (
              <VoucherCard
                key={voucher._id}
                voucher={voucher}
                isCollected={collectedIds.has(voucher._id)}
                onCollect={collect}
              />
            ))}
          </section>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <Ticket className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Không tìm thấy voucher phù hợp.</p>
          </div>
        )}
      </div>
    </main>
  );
}
