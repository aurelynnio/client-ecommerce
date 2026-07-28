'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Star,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useShopStatistics } from '@/hooks/queries/useShop';
import { formatCurrency } from '@/utils/format';

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + 'M';
  }
  if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'K';
  }
  return price.toString();
};

export default function SellerDashboardPage() {
  const { data: statistics, isLoading, error, refetch } = useShopStatistics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <SpinnerLoading size={32} />
          <p className="text-sm font-medium text-muted-foreground">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Không thể tải thống kê shop</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const shop = statistics?.shop;
  const stats = statistics?.stats;
  const ordersByStatus = stats?.ordersByStatus || {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  const orderStats = [
    {
      label: 'Chờ xác nhận',
      value: ordersByStatus.pending,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Đang xử lý',
      value: ordersByStatus.processing + ordersByStatus.confirmed,
      icon: Package,
      color: 'text-info',
    },
    {
      label: 'Đang giao',
      value: ordersByStatus.shipped,
      icon: Truck,
      color: 'text-primary',
    },
    {
      label: 'Hoàn thành',
      value: ordersByStatus.delivered,
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      label: 'Đã hủy',
      value: ordersByStatus.cancelled,
      icon: XCircle,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Kênh người bán</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Tổng quan {shop?.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi vận hành và xử lý việc cần làm hôm nay.
          </p>
        </div>
        <Link
          href="/seller/products"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Thêm sản phẩm
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sản phẩm"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="blue"
          href="/seller/products"
        />
        <StatCard
          title="Đơn hàng"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="green"
          href="/seller/orders"
        />
        <StatCard
          title="Doanh thu"
          value={`₫${formatPrice(stats?.totalRevenue || 0)}`}
          icon={DollarSign}
          color="yellow"
        />
        <StatCard title="Người theo dõi" value={shop?.followers || 0} icon={Users} color="purple" />
      </div>

      {/* Order Status */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Trạng thái đơn hàng</h2>
          <Link
            href="/seller/orders"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {orderStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card p-4 text-center"
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shop Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning/15">
              <Star className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đánh giá</p>
              <p className="text-xl font-bold">{shop?.rating?.toFixed(1) || '0.0'}</p>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-warning"
              style={{ width: `${((shop?.rating || 0) / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-info/15">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Người theo dõi</p>
              <p className="text-xl font-bold">{shop?.followers || 0}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Tổng số người theo dõi shop</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/15">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tỷ lệ phản hồi</p>
              <p className="text-xl font-bold">{shop?.responseRate || 0}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Trong 24 giờ qua</p>
        </div>
      </div>

      {/* Quick Actions & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="mb-4 font-semibold text-foreground">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction href="/seller/products" icon={Package} label="Thêm sản phẩm" />
            <QuickAction href="/seller/orders" icon={ShoppingCart} label="Xem đơn hàng" />
            <QuickAction href="/seller/shipping" icon={Truck} label="Vận chuyển" />
            <QuickAction href="/seller/settings" icon={Star} label="Cài đặt shop" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="mb-4 font-semibold text-foreground">Sản phẩm bán chạy</h3>
          {statistics?.topProducts && statistics.topProducts.length > 0 ? (
            <div className="space-y-3">
              {statistics.topProducts.slice(0, 4).map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-lg bg-muted/40 p-2"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={32}
                        height={32}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Đã bán: {product.sold}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có dữ liệu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  href?: string;
}

const colorMap = {
  blue: { text: 'text-info', icon: 'bg-info/15' },
  green: { text: 'text-success', icon: 'bg-success/15' },
  yellow: {
    text: 'text-warning',
    icon: 'bg-warning/15',
  },
  purple: {
    text: 'text-primary',
    icon: 'bg-primary/15',
  },
};

const StatCard = ({ title, value, icon: Icon, color, href }: StatCardProps) => {
  const colors = colorMap[color];
  const content = (
    <div className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${colors.icon} rounded-xl flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        {href && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};

const QuickAction = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => (
  <Link
    href={href}
    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/60"
  >
    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <span className="text-sm font-medium text-foreground">{label}</span>
  </Link>
);
