import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Store,
  Globe,
} from "lucide-react";
// Updated: Import from voucher types with backward compatibility alias
import { Voucher } from "@/types/voucher";
import { Shop } from "@/types/shop";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import Image from "next/image";
import {
  adminFieldSurfaceClass,
  adminFilterBarClass,
  adminMediaPlaceholderClass,
  adminMenuContentClass,
  adminMenuLabelClass,
  adminMenuSeparatorClass,
  adminRowHoverClass,
  adminSearchInputClass,
  adminSmallIconButtonClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from "@/components/admin/shared/AdminPrimitives";

interface DiscountsTableProps {
  discounts: Voucher[];
  searchTerm: string;
  pageSize: number;
  isLoading?: boolean;
  onSearch: (value: string) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (discount: Voucher) => void;
  onDelete: (discount: Voucher) => void;
  onView: (discount: Voucher) => void;
  onDiscountTypeFilterChange: (type: string) => void;
  onActiveFilterChange: (isActive: boolean | null) => void;
  onScopeFilterChange?: (scope: string) => void;
  selectedDiscountType: string;
  selectedIsActive: boolean | null;
  selectedScope?: string;
}

export function DiscountsTable({
  discounts,
  searchTerm,
  pageSize,
  onSearch,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
  onDiscountTypeFilterChange,
  onActiveFilterChange,
  onScopeFilterChange,
  selectedDiscountType,
  selectedIsActive,
  selectedScope = "all",
  isLoading = false,
}: DiscountsTableProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm, onSearch]);

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getStatusBadge = (discount: Voucher) => {
    if (!discount.isActive) {
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 rounded-lg px-2.5 py-0.5 shadow-none font-medium">
          Ngừng hoạt động
        </Badge>
      );
    }
    if (isExpired(discount.endDate)) {
      return (
        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100 rounded-lg px-2.5 py-0.5 shadow-none font-medium">
          Hết hạn
        </Badge>
      );
    }
    if ((discount.usageCount ?? 0) >= discount.usageLimit) {
      return (
        <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-orange-100 rounded-lg px-2.5 py-0.5 shadow-none font-medium">
          Hết lượt dùng
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-lg px-2.5 py-0.5 shadow-none font-medium">
        Đang hoạt động
      </Badge>
    );
  };

  const getDiscountTypeText = (type: string | undefined) => {
    return type === "percentage" || type === "percent" ? "Phần trăm" : "Số tiền cố định";
  };

  const getDiscountValueText = (discount: Voucher) => {
    const value = discount.value ?? 0;
    return discount.type === "percentage"
      ? `${value}%`
      : `${value.toLocaleString()}đ`;
  };

  const getShopInfo = (
    shopId: string | Shop | undefined
  ): { name: string; logo?: string } => {
    if (!shopId) return { name: "Không có" };
    if (typeof shopId === "string") return { name: shopId };
    return { name: shopId.name || "Không có", logo: shopId.logo };
  };

  const getScopeDisplay = (discount: Voucher) => {
    if (discount.scope === "platform" || !discount.shopId) {
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-lg px-2.5 py-0.5 shadow-none font-medium">
          <Globe className="h-3 w-3 mr-1" />
          Hệ thống
        </Badge>
      );
    }
    const shopInfo = getShopInfo(discount.shopId);
    return (
      <div className="flex items-center gap-2 max-w-[140px]">
        {shopInfo.logo ? (
          <div className={`relative h-6 w-6 rounded-md overflow-hidden shrink-0 ${adminMediaPlaceholderClass}`}>
            <Image
              src={shopInfo.logo}
              alt={shopInfo.name}
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${adminMediaPlaceholderClass}`}>
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
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search Bar */}
      <div className={adminFilterBarClass}>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={`pl-9 transition-all ${adminSearchInputClass}`}
            />
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={selectedDiscountType}
              onValueChange={onDiscountTypeFilterChange}
            >
              <SelectTrigger className={`h-10 w-full sm:w-[160px] ${adminFieldSurfaceClass}`}>
                <SelectValue placeholder="Loại giảm giá" />
              </SelectTrigger>
              <SelectContent className={adminMenuContentClass}>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="percent">Phần trăm</SelectItem>
                <SelectItem value="fixed">Số tiền cố định</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                selectedIsActive === null ? "all" : selectedIsActive.toString()
              }
              onValueChange={(value) =>
                onActiveFilterChange(value === "all" ? null : value === "true")
              }
            >
              <SelectTrigger className={`h-10 w-full sm:w-[140px] ${adminFieldSurfaceClass}`}>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className={adminMenuContentClass}>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="true">Đang hoạt động</SelectItem>
                <SelectItem value="false">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>

            {onScopeFilterChange && (
              <Select value={selectedScope} onValueChange={onScopeFilterChange}>
                <SelectTrigger className={`h-10 w-full sm:w-[140px] ${adminFieldSurfaceClass}`}>
                  <SelectValue placeholder="Phạm vi" />
                </SelectTrigger>
                <SelectContent className={adminMenuContentClass}>
                  <SelectItem value="all">Tất cả phạm vi</SelectItem>
                  <SelectItem value="platform">Hệ thống</SelectItem>
                  <SelectItem value="shop">Cửa hàng</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <span className="text-sm font-medium text-muted-foreground">
            Hiển thị:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className={`h-9 w-full sm:w-[100px] ${adminFieldSurfaceClass}`}>
              <SelectValue placeholder="Số lượng" />
            </SelectTrigger>
            <SelectContent className={adminMenuContentClass}>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className={adminTableShellClass}>
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className={adminTableHeaderClass}>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground pl-6">
                  Mã
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Phạm vi/Cửa hàng
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Loại
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Giá trị
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Ngày bắt đầu
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Ngày kết thúc
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Đã dùng / Giới hạn
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Trạng thái
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground text-right pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex justify-center items-center">
                      <SpinnerLoading />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && discounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="bg-gray-100 p-3 rounded-full mb-3">
                        <Filter className="h-6 w-6 text-gray-400" />
                      </span>
                      Không tìm thấy mã giảm giá.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                discounts.map((discount) => (
                  <TableRow
                    key={discount._id}
                    className={cn(
                      `${adminRowHoverClass} border-0`,
                      isLoading && "opacity-50 pointer-events-none"
                    )}
                  >
                    <TableCell className="pl-6 align-top py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground">
                          {discount.code}
                        </span>
                        {discount.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {discount.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      {getScopeDisplay(discount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium align-top py-4">
                      {getDiscountTypeText(discount.type)}
                    </TableCell>
                    <TableCell className="text-foreground font-bold align-top py-4">
                      {getDiscountValueText(discount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top py-4">
                      {formatDate(discount.startDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top py-4">
                      {formatDate(discount.endDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top py-4">
                      <span className="font-medium text-foreground">
                        {discount.usageCount ?? 0}
                      </span>{" "}
                      / {discount.usageLimit}
                    </TableCell>
                    <TableCell className="align-top py-4">
                      {getStatusBadge(discount)}
                    </TableCell>
                    <TableCell className="text-right pr-6 align-top py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`p-0 ${adminSmallIconButtonClass}`}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent
                           align="end"
                           className={adminMenuContentClass}
                         >
                           <DropdownMenuLabel className={adminMenuLabelClass}>
                             Thao tác
                           </DropdownMenuLabel>
                           <DropdownMenuItem
                             onClick={() => onView(discount)}
                             className="focus:bg-gray-100 rounded-lg cursor-pointer gap-2"
                           >
                             <Eye className="h-4 w-4" />
                             Xem chi tiết
                           </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={() => onEdit(discount)}
                             className="focus:bg-gray-100 rounded-lg cursor-pointer gap-2"
                           >
                             <Edit className="h-4 w-4" />
                             Chỉnh sửa
                           </DropdownMenuItem>
                           <DropdownMenuSeparator className={adminMenuSeparatorClass} />
                           <DropdownMenuItem
                             onClick={() => onDelete(discount)}
                             className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer gap-2"
                           >
                             <Trash2 className="h-4 w-4" />
                             Xóa
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
