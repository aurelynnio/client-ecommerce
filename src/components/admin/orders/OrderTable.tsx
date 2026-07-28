import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Order } from '@/types/order';
import { Shop } from '@/types/shop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Eye, Edit, Trash2, Store, Calendar } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  adminFieldSurfaceClass,
  adminFilterBarClass,
  adminMediaPlaceholderClass,
  adminMenuContentClass,
  adminRowHoverClass,
  adminSearchInputClass,
  adminSmallIconButtonClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from '@/components/admin/shared/AdminPrimitives';

export interface OrdersTableProps {
  orders: Order[];
  searchTerm: string;
  statusFilter: string;
  paymentStatusFilter: string;
  paymentMethodFilter: string;
  userIdFilter: string;
  startDate?: string;
  endDate?: string;
  pageSize: number;
  isLoading?: boolean;
  onSearch: (value: string) => void;
  onStatusFilter: (status: string) => void;
  onPaymentStatusFilter: (status: string) => void;
  onPaymentMethodFilter: (method: string) => void;
  onUserIdFilter: (userId: string) => void;
  onDateFilter?: (start: string, end: string) => void;
  onResetFilters: () => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onView: (order: Order) => void;
  onShopFilterChange?: (shopId: string) => void;
  selectedShop?: string;
  shops?: Shop[];
}

export function OrdersTable({
  orders,
  searchTerm,
  statusFilter,
  startDate = '',
  endDate = '',
  pageSize,
  onSearch,
  onStatusFilter,
  onDateFilter,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
  onShopFilterChange,
  selectedShop = 'all',
  shops = [],
  isLoading = false,
}: OrdersTableProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearchRef.current(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm]);
  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className?: string;
      };
    } = {
      pending: {
        label: 'Chờ xử lý',
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
      },
      confirmed: {
        label: 'Đã xác nhận',
        variant: 'outline',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      processing: {
        label: 'Đang xử lý',
        variant: 'default',
        className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
      },
      shipped: {
        label: 'Đang giao',
        variant: 'default',
        className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
      },
      delivered: {
        label: 'Đã giao',
        variant: 'outline',
        className: 'bg-green-50 text-green-700 border-green-200',
      },
      cancelled: {
        label: 'Đã hủy',
        variant: 'destructive',
        className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
      },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: 'secondary',
      className: 'bg-gray-100 text-gray-700',
    };

    return (
      <Badge
        variant={config.variant}
        className={`rounded-lg font-medium px-2.5 py-0.5 border-0 shadow-none ${config.className}`}
      >
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className?: string; // Add className property
      };
    } = {
      unpaid: {
        label: 'Chưa thanh toán',
        variant: 'secondary',
        className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      },
      paid: {
        label: 'Đã thanh toán',
        variant: 'outline',
        className: 'bg-green-50 text-green-700 border border-green-200',
      },
      refunded: { label: 'Hoàn tiền', variant: 'destructive' },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: 'secondary',
    };

    return (
      <Badge
        variant={config.variant}
        className={`rounded-lg font-medium px-2.5 py-0.5 border-0 shadow-none ${config.className}`}
      >
        {config.label}
      </Badge>
    );
  };

  const getShopInfo = (shopId: string | Shop | undefined): { name: string; logo?: string } => {
    if (!shopId) return { name: 'Không có' };
    if (typeof shopId === 'string') return { name: shopId };
    return { name: shopId.name || 'Không có', logo: shopId.logo };
  };

  return (
    <div className="space-y-4">
      <div className={adminFilterBarClass}>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={`pl-9 transition-[border-color,background-color,box-shadow] ${adminSearchInputClass}`}
            />
          </div>

          {/* Date Range Filter */}
          {onDateFilter && (
            <div className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2 sm:h-10 sm:w-auto sm:py-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateFilter(e.target.value, endDate)}
                className="text-sm bg-transparent border-0 focus:ring-0 w-[120px] min-w-[110px]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateFilter(startDate, e.target.value)}
                className="text-sm bg-transparent border-0 focus:ring-0 w-[120px] min-w-[110px]"
              />
            </div>
          )}

          <Select value={statusFilter} onValueChange={onStatusFilter}>
            <SelectTrigger className={`w-full sm:w-[180px] ${adminFieldSurfaceClass}`}>
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent className={adminMenuContentClass}>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="shipped">Đang giao</SelectItem>
              <SelectItem value="delivered">Đã giao</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          {/* Shop Filter */}
          {onShopFilterChange && shops.length > 0 && (
            <Select value={selectedShop} onValueChange={onShopFilterChange}>
              <SelectTrigger className={`w-full sm:w-[160px] ${adminFieldSurfaceClass}`}>
                <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Cửa hàng" />
              </SelectTrigger>
              <SelectContent className={adminMenuContentClass}>
                <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                {shops.map((shop) => (
                  <SelectItem key={shop._id} value={shop._id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="w-full sm:w-auto">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className={`w-full sm:w-[120px] ${adminFieldSurfaceClass}`}>
              <SelectValue placeholder="Hiển thị" />
            </SelectTrigger>
            <SelectContent className={adminMenuContentClass}>
              <SelectItem value="10">10 / trang</SelectItem>
              <SelectItem value="20">20 / trang</SelectItem>
              <SelectItem value="50">50 / trang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={adminTableShellClass}>
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className={adminTableHeaderClass}>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground pl-6">
                  Mã đơn hàng
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Khách hàng
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Cửa hàng
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Ngày đặt
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Tổng tiền
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Trạng thái
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Thanh toán
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground w-[80px] text-right pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex justify-center items-center">
                      <SpinnerLoading />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Không tìm thấy đơn hàng
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const shopInfo = getShopInfo(order.shopId);
                  return (
                    <TableRow
                      key={order._id}
                      className={`${adminRowHoverClass} border-0 ${
                        isLoading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <TableCell className="font-medium pl-6 text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">
                            {order.shippingAddress.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.shippingAddress.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[140px]">
                          {shopInfo.logo ? (
                            <div
                              className={`relative h-6 w-6 rounded-md overflow-hidden shrink-0 ${adminMediaPlaceholderClass}`}
                            >
                              <Image
                                src={shopInfo.logo}
                                alt={shopInfo.name}
                                width={24}
                                height={24}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${adminMediaPlaceholderClass}`}
                            >
                              <Store className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <span
                            className="text-sm text-muted-foreground truncate"
                            title={shopInfo.name}
                          >
                            {shopInfo.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={`p-0 ${adminSmallIconButtonClass}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={adminMenuContentClass}>
                            <DropdownMenuItem
                              onClick={() => onView(order)}
                              className="cursor-pointer gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEdit(order)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Cập nhật trạng thái
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(order)}
                              className="text-destructive cursor-pointer gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
