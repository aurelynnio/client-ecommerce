"use client";

import { useState } from "react";
import {
  Zap,
  Plus,
  Search,
  Clock,
  Package,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { getSafeErrorMessage } from "@/api";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  useAdminFlashSaleProducts,
  useAdminFlashSaleSchedule,
  useAddToFlashSale,
  useRemoveFromFlashSale,
} from "@/hooks/queries";
import { cn } from "@/utils/cn";
import {
  AdminActionButton,
  AdminPageHeader,
  AdminStatCard,
  AdminStatsGrid,
  adminFieldSurfaceClass,
  adminFilterBarClass,
  adminMediaPlaceholderClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSearchInputClass,
  adminSubtleSurfaceClass,
  adminSurfaceClass,
} from "@/components/admin/shared/AdminPrimitives";

export default function AdminFlashSalePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  // Form state for adding product to flash sale
  const [formData, setFormData] = useState({
    salePrice: 0,
    discountPercent: 0,
    stock: 100,
    startTime: "",
    endTime: "",
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useAdminFlashSaleProducts();

  const {
    data: schedule = [],
    isLoading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useAdminFlashSaleSchedule();

  const isLoading = productsLoading || scheduleLoading;
  const hasError = productsError || scheduleError;

  const addToFlashSaleMutation = useAddToFlashSale();
  const removeFromFlashSaleMutation = useRemoveFromFlashSale();

  const handleAddToFlashSale = async () => {
    if (
      !selectedProductId ||
      !formData.salePrice ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      await addToFlashSaleMutation.mutateAsync({
        productId: selectedProductId,
        data: formData,
      });
      toast.success("Đã thêm sản phẩm vào flash sale");
      setAddModalOpen(false);
      setSelectedProductId("");
      setFormData({
        salePrice: 0,
        discountPercent: 0,
        stock: 100,
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Không thể thêm sản phẩm vào flash sale"));
    }
  };

  const handleRemoveFromFlashSale = async (productId: string) => {
    if (!confirm("Gỡ sản phẩm này khỏi flash sale?")) return;
    try {
      await removeFromFlashSaleMutation.mutateAsync(productId);
      toast.success("Đã gỡ sản phẩm khỏi flash sale");
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Không thể gỡ sản phẩm"));
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalProducts = products.length;
  const totalSold = products.reduce(
    (sum, p) => sum + (p.flashSale?.soldCount || 0),
    0
  );
  const avgDiscount = products.length
    ? Math.round(
        products.reduce(
          (sum, p) => sum + (p.flashSale?.discountPercent || 0),
          0
        ) / products.length
      )
    : 0;

  if (hasError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Flash Sale"
          description="Điều phối các chiến dịch giảm giá nhanh, lịch chạy và hiệu suất bán ra."
        />
        <div className={cn(adminSubtleSurfaceClass, "space-y-4 p-8 text-center")}>
          <p className="text-red-500">
            {getSafeErrorMessage(hasError, "Không thể tải dữ liệu flash sale")}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => refetchProducts()} variant="outline" className={adminSecondaryButtonClass}>
              Tải lại sản phẩm
            </Button>
            <Button onClick={() => refetchSchedule()} className={adminPrimaryButtonClass}>
              Tải lại lịch
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Flash Sale"
        description="Quản lý hàng hóa tham gia chiến dịch, khung giờ bán và nhịp tiêu thụ theo thời gian thực."
        actions={
          <AdminActionButton onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </AdminActionButton>
        }
      />

      <AdminStatsGrid>
        <AdminStatCard title="Sản phẩm đang chạy" value={totalProducts} icon={Package} description="Số SKU đang có mặt trong chiến dịch" />
        <AdminStatCard title="Đã bán" value={totalSold} icon={TrendingUp} accent="green" description="Tổng số lượt bán trong flash sale" />
        <AdminStatCard title="Giảm trung bình" value={`${avgDiscount}%`} icon={Zap} accent="brand" description="Mức giảm giá trung bình của chiến dịch" />
        <AdminStatCard title="Khung tiếp theo" value={schedule[0]?.label || "N/A"} icon={Clock} accent="blue" description="Khung giờ gần nhất trong lịch" />
      </AdminStatsGrid>

      <div className={cn(adminSurfaceClass, "p-5")}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" /> Lịch sắp tới
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {schedule.map((slot, i) => (
            <div
              key={i}
              className={`shrink-0 rounded-2xl px-4 py-3 ${
                slot.status === "upcoming"
                  ? "bg-[#d8473c]/10 text-[#d8473c]"
                  : "bg-[#f7f2eb]"
              }`}
            >
              <p className="font-bold text-lg">{slot.label}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(slot.startTime), "dd/MM")}
              </p>
            </div>
          ))}
          {schedule.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Chưa có lịch flash sale sắp tới
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className={cn(adminFilterBarClass, "items-center")}>
          <h3 className="font-semibold">Sản phẩm trong chiến dịch</h3>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-9 pl-9 ${adminSearchInputClass}`}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={cn(adminSurfaceClass, "p-4")}>
                <Skeleton className="aspect-square w-full rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={cn(adminSurfaceClass, "py-16 text-center text-muted-foreground")}>
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Chưa có sản phẩm flash sale</p>
            <p className="text-sm">
              Thêm sản phẩm để bắt đầu một chiến dịch mới
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const soldPercent = product.flashSale?.stock
                ? Math.round(
                    (product.flashSale.soldCount / product.flashSale.stock) *
                      100
                  )
                : 0;
              const timeLeft = product.flashSale?.endTime
                ? formatDistanceToNow(new Date(product.flashSale.endTime), {
                    addSuffix: true,
                  })
                : "";

              return (
                <div
                  key={product._id}
                  className={cn(adminSurfaceClass, "group overflow-hidden transition-colors hover:bg-[#fcf8f2]")}
                >
                  <div className={cn("relative m-3 aspect-square overflow-hidden rounded-2xl", adminMediaPlaceholderClass)}>
                    <Image
                      src={
                        product.variants?.[0]?.images?.[0] ||
                        "/images/placeholder-product.svg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2 border-0 bg-[#d8473c] text-white">
                      -{product.flashSale?.discountPercent || 0}%
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-white/80 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                      onClick={() => handleRemoveFromFlashSale(product._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="px-4 pb-4">
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-[#d8473c]">
                        {product.flashSale?.salePrice?.toLocaleString()}đ
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {product.price?.currentPrice?.toLocaleString()}đ
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Đã bán</span>
                        <span className="font-medium">
                          {product.flashSale?.soldCount || 0}/
                          {product.flashSale?.stock || 0}
                        </span>
                      </div>
                      <Progress value={soldPercent} className="h-1.5" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Kết thúc {timeLeft}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className={cn(adminSurfaceClass, "sm:max-w-md rounded-[28px] border-slate-200/80")}>
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm vào Flash Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ID sản phẩm</Label>
              <Input
                placeholder="Nhập product ID"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className={adminFieldSurfaceClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá bán</Label>
                <Input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salePrice: Number(e.target.value),
                    })
                  }
                  className={adminFieldSurfaceClass}
                />
              </div>
              <div className="space-y-2">
                <Label>Phần trăm giảm</Label>
                <Input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercent: Number(e.target.value),
                    })
                  }
                  className={adminFieldSurfaceClass}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tồn kho cho flash sale</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                className={adminFieldSurfaceClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thời gian bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className={adminFieldSurfaceClass}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian kết thúc</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className={adminFieldSurfaceClass}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddModalOpen(false)}
              className={adminSecondaryButtonClass}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddToFlashSale}
              disabled={addToFlashSaleMutation.isPending}
              className={adminPrimaryButtonClass}
            >
              {addToFlashSaleMutation.isPending ? "Đang thêm..." : "Thêm vào Flash Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
