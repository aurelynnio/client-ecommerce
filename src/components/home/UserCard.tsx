"use client";
import Image from "next/image";
import { useAppSelector } from "@/hooks/hooks";
import {
  Wallet,
  Truck,
  MessageSquare,
  ChevronRight,
  Gift,
  Coins,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useUserOrders } from "@/hooks/queries/useOrders";
import { useWishlistCount } from "@/hooks/queries/useWishlist";

export default function UserCard() {
  const { data: user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: ordersData } = useUserOrders(
    { page: 1, limit: 50 },
    { enabled: isAuthenticated },
  );
  const { data: wishlistCount = 0 } = useWishlistCount({
    enabled: isAuthenticated,
  });

  const orders = ordersData?.orders || [];
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const shippedOrders = orders.filter((order) => order.status === "shipped").length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;

  // Order status items
  const orderStatus = [
    {
      label: "Chờ thanh toán",
      icon: <Wallet className="w-4 h-4" />,
      count: pendingOrders,
      href: "/profile?tab=orders&status=pending",
    },
    {
      label: "Đang giao",
      icon: <Truck className="w-4 h-4" />,
      count: shippedOrders,
      href: "/profile?tab=orders&status=shipped",
    },
    {
      label: "Đã giao",
      icon: <MessageSquare className="w-4 h-4" />,
      count: deliveredOrders,
      href: "/profile?tab=orders&status=delivered",
    },
  ];

  return (
    <div className="w-full h-full bg-[#f7f7f7] rounded-lg p-3 flex flex-col gap-3">
      {/* Header: Avatar & Info */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border-2 border-[#E53935]/20">
          {isAuthenticated && user?.avatar ? (
            <Image src={user.avatar} alt="User" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#E53935] text-white">
              <span className="text-lg font-bold">?</span>
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">
            {isAuthenticated ? user?.username : "Xin chào!"}
          </p>
          {isAuthenticated ? (
            <Link 
              href="/profile" 
              className="text-[11px] text-[#E53935] hover:underline"
            >
              Quản lý tài khoản →
            </Link>
          ) : (
            <span className="text-[11px] text-gray-500">Đăng nhập để nhận ưu đãi</span>
          )}
        </div>
      </div>

      {/* Login/Register Buttons */}
      {!isAuthenticated && (
        <div className="flex gap-2">
          <Link
            href="/login"
            className="flex-1 bg-[#E53935] text-white text-center py-2 rounded-full text-xs font-bold hover:bg-[#D32F2F] transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
          >
            Đăng ký
          </Link>
        </div>
      )}

      {/* Order Status */}
      {isAuthenticated && (
        <div className="grid grid-cols-3 gap-1 py-2 border-y border-gray-100">
          {orderStatus.map((stat, idx) => (
            <Link
              key={idx}
              href={stat.href}
              className="flex flex-col items-center gap-1 cursor-pointer group py-1"
            >
              <div className="text-gray-500 group-hover:text-[#E53935] transition-colors relative">
                {stat.icon}
                {stat.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E53935] text-white text-[9px] rounded-full flex items-center justify-center">
                    {stat.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-600 group-hover:text-[#E53935] transition-colors">
                {stat.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Assets Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          href="/profile?tab=orders"
          className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
        >
          <Gift className="w-5 h-5 text-[#E53935]" />
          <span className="text-[10px] text-gray-600">
            {orders.length} đơn hàng
          </span>
        </Link>
        <Link
          href="/vouchers"
          className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
        >
          <Ticket className="w-5 h-5 text-[#E53935]" />
          <span className="text-[10px] text-gray-600">Voucher</span>
        </Link>
        <Link
          href="/wishlist"
          className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
        >
          <Coins className="w-5 h-5 text-[#E53935]" />
          <span className="text-[10px] text-gray-600">{wishlistCount} yêu thích</span>
        </Link>
      </div>

      {/* Promotional Banner */}
      <Link 
        href="/vouchers"
        className="bg-[#FFEBEE] rounded-lg py-2 px-3 flex items-center justify-between cursor-pointer border border-[#E53935]/10 hover:border-[#E53935]/30 transition-colors mt-auto"
      >
        <div className="flex items-center gap-2">
          <span className="bg-[#E53935] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            HOT
          </span>
          <span className="text-xs text-[#E53935] font-medium">
            Ưu đãi hôm nay
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#E53935]" />
      </Link>
    </div>
  );
}
