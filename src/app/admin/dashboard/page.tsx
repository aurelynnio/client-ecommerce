"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Calendar,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useSocket } from "@/context/SocketContext";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDashboardStats } from "@/hooks/queries/useStatistics";
import Link from "next/link";
import { cn } from "@/utils/cn";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import {
  AdminActionButton,
  AdminPageHeader,
  AdminStatCard,
  AdminStatsGrid,
  adminMediaPlaceholderClass,
  adminSecondaryButtonClass,
  adminSubtleSurfaceClass,
  adminSurfaceClass,
} from "@/components/admin/shared/AdminPrimitives";

export default function AdminDashboard() {
  const { socket } = useSocket();
  const { data: stats, isLoading: loading, refetch } = useDashboardStats();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      toast.info("Đang cập nhật bảng điều khiển...");
      refetch();
    };

    socket.on("new_order", handleUpdate);
    socket.on("new_user", handleUpdate);
    socket.on("new_product", handleUpdate);

    return () => {
      socket.off("new_order", handleUpdate);
      socket.off("new_user", handleUpdate);
      socket.off("new_product", handleUpdate);
    };
  }, [socket, refetch]);

  const handleRefresh = () => {
    refetch();
  };

  const formatTrend = (value: number) => {
    if (value > 0) return `+${value}%`;
    return `${value}%`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
            Đã giao
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">
            Đang giao
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-0">
            Đang xử lý
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">
            Đã xác nhận
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-0">
            Chờ xử lý
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <SpinnerLoading size={32} />
          <p className="text-sm text-gray-500 font-medium">
            Đang tải tổng quan...
          </p>
        </div>
      </div>
    );
  }

  const displayStats = {
    // Handle both flat and nested counts structure
    totalRevenue: stats?.totalRevenue ?? stats?.counts?.revenue ?? 0,
    totalOrders: stats?.totalOrders ?? stats?.counts?.orders ?? 0,
    totalUsers: stats?.totalUsers ?? stats?.counts?.users ?? 0,
    totalProducts: stats?.totalProducts ?? stats?.counts?.products ?? 0,
    recentOrders: stats?.recentOrders || [],
    topProducts: stats?.topProducts || [],
    chartData: stats?.chartData || [],
  };

  const statCards = [
    {
      name: "Tổng doanh thu",
      value: formatCurrency(displayStats.totalRevenue || 0),
      icon: DollarSign,
      description: `Hôm nay ${formatCurrency(stats?.revenueToday || 0)}`,
      trend: formatTrend(stats?.revenueGrowth || 0),
      trendUp: (stats?.revenueGrowth || 0) >= 0,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Đơn hàng",
      value: (displayStats.totalOrders || 0).toLocaleString(),
      icon: ShoppingCart,
      description: `${stats?.newOrdersToday || 0} đơn mới hôm nay`,
      trend: formatTrend(stats?.orderGrowth || 0),
      trendUp: (stats?.orderGrowth || 0) >= 0,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      name: "Khách hàng",
      value: (displayStats.totalUsers || 0).toLocaleString(),
      icon: Users,
      description: `${stats?.newUsersToday || 0} tài khoản mới hôm nay`,
      trend: formatTrend(stats?.userGrowth || 0),
      trendUp: (stats?.userGrowth || 0) >= 0,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      name: "Sản phẩm",
      value: (displayStats.totalProducts || 0).toLocaleString(),
      icon: Package,
      description: `${stats?.lowStockProducts || 0} sản phẩm tồn thấp`,
      trend: `${stats?.pendingOrders || 0} chờ xử lý`,
      trendUp: false,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8 p-1">
      <AdminPageHeader
        title="Tổng quan"
        description="Theo dõi thống kê, doanh thu và nhịp vận hành của toàn bộ hệ thống."
        actions={
          <>
            <div
              className={cn(
                "flex h-10 items-center gap-2 px-5 text-sm font-medium",
                adminSecondaryButtonClass,
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(), "dd/MM/yyyy")}
            </div>
            <AdminActionButton onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <SpinnerLoading size={14} className="text-current" />
              ) : (
                <RefreshCcw className="h-3.5 w-3.5" />
              )}
              Làm mới
            </AdminActionButton>
          </>
        }
      />

      <AdminStatsGrid>
        {statCards.map((stat) => (
          <AdminStatCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            accent={
              stat.name === "Tổng doanh thu"
                ? "blue"
                : stat.name === "Đơn hàng"
                  ? "brand"
                  : stat.name === "Khách hàng"
                    ? "amber"
                    : "green"
            }
            meta={
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                  stat.trendUp
                    ? "bg-green-500/10 text-green-600"
                    : "bg-red-500/10 text-red-600",
                )}
              >
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.trend}
              </div>
            }
          />
        ))}
      </AdminStatsGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className={cn(adminSurfaceClass, "p-6")}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Doanh thu</h3>
              <p className="text-sm text-muted-foreground">
                Tổng quan doanh thu hàng tháng
              </p>
            </div>
            <div className={cn(adminSubtleSurfaceClass, "rounded-2xl p-2")}>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            {displayStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayStats.chartData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#E53935" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E5EA"
                    opacity={0.4}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#86868B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    }}
                    itemStyle={{ color: "#333", fontSize: "13px" }}
                    labelStyle={{
                      color: "#86868B",
                      marginBottom: "4px",
                      fontSize: "11px",
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Doanh thu",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E53935"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#E53935" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Orders Chart */}
        <div className={cn(adminSurfaceClass, "p-6")}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Đơn hàng</h3>
              <p className="text-sm text-muted-foreground">
                Số lượng đơn hàng hàng tháng
              </p>
            </div>
            <div className={cn(adminSubtleSurfaceClass, "rounded-2xl p-2")}>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            {displayStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayStats.chartData} barSize={32}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E5EA"
                    opacity={0.4}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#86868B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    }}
                    itemStyle={{ color: "#333", fontSize: "13px" }}
                    labelStyle={{
                      color: "#86868B",
                      marginBottom: "4px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="orders" fill="#E53935" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders Table */}
        <div className={cn(adminSurfaceClass, "flex flex-col p-6")}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                Đơn hàng gần đây
              </h3>
              <p className="text-sm text-muted-foreground">
                Các giao dịch mới nhất
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-medium text-[#d8473c] hover:underline"
            >
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-2">
            {displayStats.recentOrders.length > 0 ? (
              displayStats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between rounded-2xl p-3 transition-colors hover:bg-[#fbf6f0]"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("hidden h-10 w-10 items-center justify-center rounded-2xl sm:flex", adminMediaPlaceholderClass)}>
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-foreground">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.name || "Khách"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-sm text-foreground">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <div className="mt-1 scale-90 origin-right">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Package className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Không tìm thấy đơn hàng gần đây</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products List */}
        <div className={cn(adminSurfaceClass, "flex flex-col p-6")}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                Sản phẩm bán chạy
              </h3>
              <p className="text-sm text-muted-foreground">
                Sản phẩm được mua nhiều nhất
              </p>
            </div>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm font-medium text-[#d8473c] hover:underline"
            >
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-2">
            {displayStats.topProducts.length > 0 ? (
              displayStats.topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between rounded-2xl p-3 transition-colors hover:bg-[#fbf6f0]"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl", adminMediaPlaceholderClass)}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-muted-foreground text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm text-foreground line-clamp-1 max-w-[180px]"
                        title={product.name}
                      >
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.sold} đã bán
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-foreground">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Package className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Không tìm thấy sản phẩm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
