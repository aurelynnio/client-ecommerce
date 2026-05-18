"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, Category } from "@/types/product";
import { ShopCategory } from "@/types/shopCategory";
import {
  Package,
  Tag,
  Box,
  Calendar,
  Store,
  ImageIcon,
  Edit,
  ExternalLink,
  Layers,
  Palette,
  Ruler,
  Weight,
  ShoppingBag,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

interface ViewModelProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit?: (product: Product) => void;
}

const statusMap: Record<string, { label: string; className: string }> = {
  published: {
    label: "Đang bán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  draft: {
    label: "Bản nháp",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  suspended: {
    label: "Tạm ngưng",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  deleted: {
    label: "Đã xóa",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    đỏ: "#E53935",
    red: "#E53935",
    xanh: "#1976D2",
    blue: "#1976D2",
    "xanh dương": "#1976D2",
    "xanh lá": "#43A047",
    green: "#43A047",
    vàng: "#FDD835",
    yellow: "#FDD835",
    cam: "#FB8C00",
    orange: "#FB8C00",
    tím: "#8E24AA",
    purple: "#8E24AA",
    hồng: "#EC407A",
    pink: "#EC407A",
    đen: "#212121",
    black: "#212121",
    trắng: "#FAFAFA",
    white: "#FAFAFA",
    xám: "#757575",
    gray: "#757575",
    grey: "#757575",
    nâu: "#795548",
    brown: "#795548",
    be: "#D7CCC8",
    beige: "#D7CCC8",
    navy: "#1A237E",
    "xanh navy": "#1A237E",
  };

  return colorMap[colorName.toLowerCase().trim()] || "#E2E8F0";
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Package;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export function ViewModelProduct({
  open,
  onOpenChange,
  product,
  onEdit,
}: ViewModelProductProps) {
  if (!product) return null;

  const getCategoryName = (category: Category | string | null): string => {
    if (!category) return "Chưa phân loại";
    return typeof category === "string" ? category : category.name || "Chưa phân loại";
  };

  const getShopCategoryName = (
    shopCategory: ShopCategory | string | undefined,
  ): string => {
    if (!shopCategory) return "";
    return typeof shopCategory === "object" ? shopCategory.name : "";
  };

  const getAllImages = (): string[] => {
    const images: string[] = [];

    if (product.variants?.length) {
      product.variants.forEach((variant) => {
        if (variant.images?.length) {
          images.push(...variant.images);
        }
      });
    }

    return Array.from(new Set(images));
  };

  const getMainImage = (): string | null => product.variants?.[0]?.images?.[0] || null;

  const totalStock = product.variants?.length
    ? product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
    : product.stock || 0;

  const totalSold = product.variants?.length
    ? product.variants.reduce((sum, variant) => sum + (variant.sold || 0), 0)
    : product.soldCount || 0;

  const statusConfig = statusMap[product.status] || {
    label: "Không xác định",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  };
  const mainImage = getMainImage();
  const allImages = getAllImages();
  const shopCategoryName = getShopCategoryName(product.shopCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl gap-0 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[#fcfaf6] p-0 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.4)]"
      >
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E53935]/10 text-[#E53935]">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                  Chi tiết sản phẩm
                </DialogTitle>
                <p className="mt-1 text-sm text-slate-500">ID: {product._id}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusConfig.className)}>
                {statusConfig.label}
              </Badge>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#E53935]"
              >
                <Link href={`/products/${product.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-152px)] overflow-y-auto px-6 py-6 pb-8 no-scrollbar">
          <div className="space-y-5">
            <section className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:grid-cols-[180px_minmax(0,1fr)_220px]">
              <div className="flex justify-center xl:justify-start">
                {mainImage ? (
                  <div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={mainImage} alt={product.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                    <Package className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-4">
                <div className="space-y-2">
                  <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-slate-950">
                    {product.name}
                  </h2>
                  <p className="break-all text-sm text-slate-400">/{product.slug}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.isNewArrival ? (
                    <Badge className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                      Mới
                    </Badge>
                  ) : null}
                  {product.isFeatured ? (
                    <Badge className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-fuchsia-700">
                      Nổi bật
                    </Badge>
                  ) : null}
                  {product.onSale ? (
                    <Badge className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                      Giảm giá
                    </Badge>
                  ) : null}
                  {product.brand ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-slate-600">
                      {product.brand}
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#faf6f0] px-4 py-3">
                    <div className="mb-1 flex items-center gap-2 text-slate-400">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium uppercase tracking-[0.12em]">Đánh giá</span>
                    </div>
                    <div className="text-base font-semibold text-slate-900">
                      {product.ratingAverage?.toFixed(1) || "0.0"}
                      <span className="ml-1 text-sm font-normal text-slate-400">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#faf6f0] px-4 py-3">
                    <div className="mb-1 flex items-center gap-2 text-slate-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-[0.12em]">Đã bán</span>
                    </div>
                    <div className="text-base font-semibold text-slate-900">{totalSold}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] bg-[#faf6f0] px-5 py-5 text-left xl:text-right">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">Giá bán</p>
                <div className="text-4xl font-semibold tracking-tight text-[#E53935]">
                  {formatCurrency(product.price?.currentPrice || 0)}
                </div>
                {product.price?.discountPrice && product.price.discountPrice > 0 ? (
                  <div className="text-base text-slate-400 line-through">
                    {formatCurrency(product.price.discountPrice)}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <InfoCard icon={Layers} label="Danh mục">
                <p className="text-xl font-semibold text-slate-900">{getCategoryName(product.category)}</p>
                {shopCategoryName ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Store className="h-4 w-4" />
                    {shopCategoryName}
                  </p>
                ) : null}
              </InfoCard>

              <InfoCard icon={Box} label="Tồn kho">
                <p
                  className={cn(
                    "text-4xl font-semibold tracking-tight",
                    totalStock > 10 ? "text-emerald-600" : totalStock > 0 ? "text-amber-600" : "text-rose-500",
                  )}
                >
                  {totalStock}
                </p>
                <p className="mt-2 text-sm text-slate-500">sản phẩm có sẵn</p>
              </InfoCard>

              <InfoCard icon={Calendar} label="Thời gian">
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    Tạo: <span className="font-medium text-slate-900">{formatDate(product.createdAt)}</span>
                  </p>
                  <p>
                    Sửa: <span className="font-medium text-slate-900">{formatDate(product.updatedAt)}</span>
                  </p>
                </div>
              </InfoCard>
            </section>

            {product.sizes?.length ? (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-slate-500">
                  <Ruler className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">Kích thước có sẵn</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-2xl border border-slate-200 bg-[#faf6f0] px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {product.variants?.length ? (
              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Palette className="h-4 w-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                      Phân loại màu ({product.variants.length})
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {product.variants.map((variant, index) => (
                    <div
                      key={variant._id || index}
                      className="grid items-center gap-4 px-5 py-4 md:grid-cols-[84px_minmax(0,1fr)_auto]"
                    >
                      <div className="shrink-0">
                        {variant.images?.[0] ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                            <Image src={variant.images[0]} alt={variant.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {variant.color ? (
                            <span
                              className="h-4 w-4 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: getColorCode(variant.color) }}
                            />
                          ) : null}
                          <p className="text-base font-semibold text-slate-900">
                            {variant.name || `Variant #${index + 1}`}
                          </p>
                        </div>
                        {variant.sku ? (
                          <p className="font-mono text-xs text-slate-400">SKU: {variant.sku}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                          <span>Kho: <strong className="text-slate-900">{variant.stock}</strong></span>
                          <span>Đã bán: <strong className="text-slate-900">{variant.sold || 0}</strong></span>
                          <span>Ảnh: <strong className="text-slate-900">{variant.images?.length || 0}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-400">Giá</p>
                        <p className="text-lg font-semibold text-[#E53935]">
                          {formatCurrency(variant.price || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {product.description ? (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-slate-500">
                  <Tag className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">Mô tả sản phẩm</h3>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{product.description}</p>
              </section>
            ) : null}

            {(product.weight || product.dimensions) ? (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-slate-500">
                  <ShoppingBag className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">Thông tin vận chuyển</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {product.weight ? (
                    <div className="rounded-2xl bg-[#faf6f0] px-4 py-3 text-sm text-slate-600">
                      <div className="mb-1 flex items-center gap-2 text-slate-400">
                        <Weight className="h-4 w-4" />
                        <span className="uppercase tracking-[0.12em]">Cân nặng</span>
                      </div>
                      <strong className="text-slate-900">{product.weight}g</strong>
                    </div>
                  ) : null}
                  {product.dimensions &&
                  (product.dimensions.length || product.dimensions.width || product.dimensions.height) ? (
                    <div className="rounded-2xl bg-[#faf6f0] px-4 py-3 text-sm text-slate-600">
                      <div className="mb-1 flex items-center gap-2 text-slate-400">
                        <Ruler className="h-4 w-4" />
                        <span className="uppercase tracking-[0.12em]">Kích thước</span>
                      </div>
                      <strong className="text-slate-900">
                        {product.dimensions.length || 0} x {product.dimensions.width || 0} x {product.dimensions.height || 0} cm
                      </strong>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {product.attributes?.length ? (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-slate-500">
                  <Box className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">Thông số kỹ thuật</h3>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {product.attributes.map((attribute, index) => (
                    <div
                      key={`${attribute.name}-${index}`}
                      className="flex items-center justify-between rounded-2xl bg-[#faf6f0] px-4 py-3 text-sm"
                    >
                      <span className="text-slate-500">{attribute.name}</span>
                      <span className="font-medium text-slate-900">{attribute.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {product.tags?.length ? (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-slate-500">
                  <Tag className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full border-slate-200 bg-[#faf6f0] px-3 py-1 text-slate-600"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            {allImages.length ? (
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-slate-500">
                  <ImageIcon className="h-4 w-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                    Tất cả hình ảnh ({allImages.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {allImages.slice(0, 12).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                    >
                      <Image src={image} alt={`Hình ảnh ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                  {allImages.length > 12 ? (
                    <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#faf6f0] text-sm font-semibold text-slate-500">
                      +{allImages.length - 12}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-2xl border-slate-200 px-5">
              Đóng
            </Button>
          </DialogClose>
          {onEdit ? (
            <Button
              onClick={() => onEdit(product)}
              className="rounded-2xl bg-[#E53935] px-5 text-white hover:bg-[#D32F2F]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
