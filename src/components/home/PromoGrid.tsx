"use client";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TicketPercent,
  Truck,
  Zap,
} from "lucide-react";
import { useVouchers } from "@/hooks/queries/useVoucher";
import { useActiveFlashSale } from "@/hooks/queries/useFlashSale";
import { useNewArrivals } from "@/hooks/queries/useProducts";

export default function PromoGrid() {
  const { data: vouchersData } = useVouchers({ page: 1, limit: 1 });
  const { data: flashSaleData } = useActiveFlashSale({ page: 1, limit: 1 });
  const { data: newArrivals } = useNewArrivals();

  const voucherPagination = vouchersData?.pagination as
    | { total?: number; totalItems?: number }
    | undefined;
  const voucherCount =
    voucherPagination?.totalItems || voucherPagination?.total || 0;
  const flashSaleCount =
    flashSaleData?.pagination?.totalItems || flashSaleData?.data?.length || 0;
  const newArrivalsCount = newArrivals?.length || 0;

  const promoItems = useMemo(
    () => [
      {
        id: 1,
        title: "Mã giảm giá",
        subtitle:
          voucherCount > 0
            ? `${voucherCount} mã đang hoạt động`
            : "Xem ưu đãi mới nhất",
        icon: TicketPercent,
        iconClass: "bg-rose-50 text-rose-600",
        href: "/vouchers",
      },
      {
        id: 2,
        title: "Hàng mới về",
        subtitle:
          newArrivalsCount > 0
            ? `${newArrivalsCount} sản phẩm mới`
            : "Cập nhật mỗi ngày",
        icon: Sparkles,
        iconClass: "bg-blue-50 text-blue-600",
        href: "/new-arrivals",
      },
      {
        id: 3,
        title: "Vận chuyển",
        subtitle: "Xem chính sách giao hàng",
        icon: Truck,
        iconClass: "bg-emerald-50 text-emerald-600",
        href: "/shipping",
      },
      {
        id: 4,
        title: "Giá sốc",
        subtitle:
          flashSaleCount > 0
            ? `${flashSaleCount} sản phẩm đang sale`
            : "Giá tốt theo khung giờ",
        icon: Zap,
        iconClass: "bg-amber-50 text-amber-600",
        href: "/flash-sale",
      },
    ],
    [flashSaleCount, newArrivalsCount, voucherCount],
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
      {promoItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group relative bg-[#f7f7f7] rounded-lg overflow-hidden hover:bg-[#f0f0f0] transition-all duration-200 flex items-center p-3 gap-3"
        >
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#E53935] transition-colors">
              {item.title}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{item.subtitle}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#E53935] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Xem ngay <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${item.iconClass}`}
          >
            <item.icon className="w-5 h-5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
