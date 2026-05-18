"use client";

import { useState } from "react";
import { Store, Search, MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { getSafeErrorMessage } from "@/api";
import { toast } from "sonner";
import { ViewShopModal } from "@/components/admin/shops/ViewShopModal";
import { Shop as BaseShop, ShopOwner } from "@/types/shop";
import { useAllShops, useUpdateShopStatus } from "@/hooks/queries";
import { cn } from "@/utils/cn";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatsGrid,
  adminFilterBarClass,
  adminMediaPlaceholderClass,
  adminMenuContentClass,
  adminPrimaryButtonClass,
  adminRowHoverClass,
  adminSearchInputClass,
  adminSmallIconButtonClass,
  adminSubtleSurfaceClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from "@/components/admin/shared/AdminPrimitives";

// Extended Shop type for admin list view with additional stats
interface AdminShopListItem extends Omit<BaseShop, 'owner'> {
  owner: ShopOwner;
  totalProducts: number;
  totalOrders: number;
}

export default function AdminShopsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShop, setSelectedShop] = useState<AdminShopListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusMutation = useUpdateShopStatus();

  const {
    data: shopsResponse,
    isLoading,
    error,
    refetch,
  } = useAllShops();
  const shops = (shopsResponse?.shops as AdminShopListItem[] | undefined) ?? [];

  const handleStatusChange = async (
    shopId: string,
    newStatus: "active" | "inactive" | "banned",
  ) => {
    try {
      await statusMutation.mutateAsync({ shopId, status: newStatus });
      toast.success(`Shop status updated to ${newStatus}`);
    } catch (mutationError) {
      toast.error(getSafeErrorMessage(mutationError, "Failed to update shop status"));
    }
  };

  const handleViewDetails = (shop: AdminShopListItem) => {
    setSelectedShop(shop);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShop(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="border-0 bg-green-500/10 text-green-600 hover:bg-green-500/10">Đang hoạt động</Badge>;
      case "inactive":
        return <Badge className="border-0 bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">Tạm dừng</Badge>;
      case "banned":
      case "suspended":
        return <Badge className="border-0 bg-rose-500/10 text-rose-600 hover:bg-rose-500/10">Bị khóa</Badge>;
      case "pending":
        return <Badge className="border-0 bg-sky-500/10 text-sky-600 hover:bg-sky-500/10">Đang chờ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalShops = shops.length;
  const activeShops = shops.filter((s) => s.status === "active").length;
  const inactiveShops = shops.filter((s) => s.status === "inactive").length;

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Cửa hàng"
          description="Quản lý toàn bộ shop đăng ký trên hệ thống và trạng thái vận hành của từng shop."
        />
        <div className={cn(adminSubtleSurfaceClass, "space-y-4 p-8 text-center")}>
          <p className="text-red-500">
            {getSafeErrorMessage(error, "Không thể tải danh sách cửa hàng")}
          </p>
          <Button onClick={() => refetch()} className={adminPrimaryButtonClass}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cửa hàng"
        description="Theo dõi chất lượng, trạng thái và hiệu suất sơ bộ của các shop trên sàn."
      />

      <AdminStatsGrid className="lg:grid-cols-3">
        <AdminStatCard title="Tổng số shop" value={totalShops} icon={Store} description="Tất cả cửa hàng đã đăng ký" />
        <AdminStatCard title="Đang hoạt động" value={activeShops} icon={CheckCircle} accent="green" description="Shop có thể kinh doanh bình thường" />
        <AdminStatCard title="Tạm dừng" value={inactiveShops} icon={Ban} accent="amber" description="Shop đang bị tắt hoặc chờ xử lý" />
      </AdminStatsGrid>

      <div className={adminTableShellClass}>
        <div className={cn(adminFilterBarClass, "rounded-none border-x-0 border-t-0")}>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên shop hoặc chủ sở hữu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 ${adminSearchInputClass}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <Table className="min-w-[720px]">
          <TableHeader className={adminTableHeaderClass}>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Chủ sở hữu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Sản phẩm</TableHead>
              <TableHead className="text-center">Đánh giá</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredShops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Không tìm thấy cửa hàng
                </TableCell>
              </TableRow>
            ) : (
              filteredShops.map((shop) => (
                <TableRow key={shop._id} className={cn(adminRowHoverClass, "border-0")}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn("relative h-10 w-10 overflow-hidden rounded-xl", adminMediaPlaceholderClass)}>
                        {shop.logo ? (
                          <Image src={shop.logo} alt={shop.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Store className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{shop.owner?.username || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{shop.owner?.email}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(shop.status)}</TableCell>
                  <TableCell className="text-center">{shop.totalProducts || 0}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-amber-500">★</span> {shop.rating?.toFixed(1) || "0.0"}
                  </TableCell>
                  <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className={adminSmallIconButtonClass}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={adminMenuContentClass}>
                        <DropdownMenuItem onClick={() => handleViewDetails(shop)}>
                          <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                        </DropdownMenuItem>
                        {shop.status === "inactive" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(shop._id, "active")}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Kích hoạt
                          </DropdownMenuItem>
                        )}
                        {shop.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(shop._id, "banned")}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" /> Khóa shop
                          </DropdownMenuItem>
                        )}
                        {shop.status === "banned" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(shop._id, "active")}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Mở lại
                          </DropdownMenuItem>
                        )}
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

      {/* View Shop Modal */}
      <ViewShopModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shop={selectedShop}
      />
    </div>
  );
}
