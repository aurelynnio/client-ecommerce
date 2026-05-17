// VoucherPage - Taobao Gentle Style
"use client";

import { useState, useMemo } from "react";
import {
  Gift,
  Sparkles,
  Search,
  Clock,
  Ticket,
  Crown,
  Timer,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { usePlatformVouchers } from "@/hooks/queries";
import { VoucherCard } from "@/components/vouchers/VoucherCard";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Input } from "@/components/ui/input";

export default function VouchersPage() {
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "percentage" | "fixed_amount"
  >("all");

  const {
    data: allVouchers = [],
    isLoading,
    error,
  } = usePlatformVouchers();

  const handleCollectVoucher = (voucherId: string) => {
    setCollectedIds((prev) => new Set(prev).add(voucherId));
    toast.success("Đã lưu voucher vào ví của bạn!");
  };

  // Get current time for countdown display
  const now = new Date();
  const hoursLeft = 24 - now.getHours();
  const minutesLeft = 60 - now.getMinutes();

  // Vouchers of the Day - Top featured vouchers
  const dailyVouchers = useMemo(() => {
    return [...allVouchers]
      .sort((a, b) => {
        if (a.scope === "platform" && b.scope !== "platform") return -1;
        if (a.scope !== "platform" && b.scope === "platform") return 1;
        return b.value - a.value;
      })
      .slice(0, 6);
  }, [allVouchers]);

  const filteredVouchers = useMemo(() => {
    return allVouchers.filter((v) => {
      if (filterType !== "all" && v.type !== filterType) return false;
      if (
        searchQuery &&
        !v.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !v.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allVouchers, filterType, searchQuery]);

  if (isLoading && allVouchers.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-16 h-16 rounded-full bg-[#f7f7f7] flex items-center justify-center">
          <SpinnerLoading size={32} />
        </div>
        <p className="text-muted-foreground text-sm">Đang tải ưu đãi...</p>
      </div>
    );
  }

  if (error && allVouchers.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-16 h-16 rounded-full bg-[#f7f7f7] flex items-center justify-center">
          <Ticket className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-muted-foreground text-sm">
          Không thể tải voucher công khai lúc này.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Simple Header */}
      <div className="bg-[#f7f7f7] py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-gray-800 text-xl font-semibold">
                  Trung tâm Voucher
                </h1>
                <p className="text-muted-foreground text-xs">
                  Voucher công khai từ nền tảng
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-4 py-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-gray-600 text-sm font-medium">
                Còn {hoursLeft}h {minutesLeft}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Vouchers Section */}
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="bg-[#f7f7f7] rounded-2xl overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-800">
                Ưu đãi hôm nay
              </span>
              <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-full">
                {dailyVouchers.length} mã
              </span>
            </div>
            <button className="flex items-center gap-1 text-primary text-sm hover:opacity-80 transition-opacity self-start sm:self-auto">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Daily Vouchers Grid */}
          <div className="p-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {dailyVouchers.map((v) => (
                <VoucherCard
                  key={v._id}
                  variant="compact"
                  voucher={v}
                  isCollected={collectedIds.has(v._id)}
                  onCollect={handleCollectVoucher}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 mt-4">
        <div className="bg-[#f7f7f7] rounded-2xl overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã giảm giá..."
                  className="pl-10 h-10 bg-white border-none rounded-xl text-sm focus-visible:ring-0"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as typeof filterType)
                  }
                  className="h-10 px-4 bg-white border-none rounded-xl text-sm text-gray-600 focus:outline-none"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="percentage">Giảm %</option>
                  <option value="fixed_amount">Giảm tiền</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-4 pb-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700">
              <Crown className="w-4 h-4 text-primary" />
              Voucher toàn sàn công khai
            </div>
          </div>

          <motion.div
            key={searchQuery + filterType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 pt-2"
          >
            {filteredVouchers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher._id}
                    voucher={voucher}
                    isCollected={collectedIds.has(voucher._id)}
                    onCollect={handleCollectVoucher}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4">
                  <Ticket className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-2">
                  Không tìm thấy voucher công khai
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Thử thay đổi bộ lọc hoặc quay lại sau nhé!
                </p>
                <button
                  className="px-6 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="max-w-[1200px] mx-auto px-4 mt-4">
        <div className="bg-[#f7f7f7] rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-1">
                Mẹo săn voucher
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Voucher toàn sàn sẽ được cập nhật theo các chương trình công
                khai của hệ thống. Voucher riêng của từng shop sẽ xuất hiện ở
                trang cửa hàng hoặc trong lúc thanh toán khi đủ điều kiện.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
