"use client";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Tag,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyShop } from "@/hooks/queries/useShop";
import {
  useShopProducts,
  useCreateProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
} from "@/hooks/queries/useProducts";
import { CreateModelProduct } from "@/components/product/forms/CreateModelProduct";
import { UpdateModelProduct } from "@/components/product/forms/UpdateModelProduct";
import { ViewModelProduct } from "@/components/product/forms/ViewModelProduct";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import { getSafeErrorMessage } from "@/api";

export default function SellerProductsPage() {
  const { data: myShop } = useMyShop();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: productsData,
    isLoading,
  } = useShopProducts(myShop?._id || "", { page, limit });
  const products = productsData?.products || [];
  const productPagination = productsData?.pagination;

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateSellerProduct();
  const deleteProductMutation = useDeleteSellerProduct();

  const [searchTerm, setSearchTerm] = useState("");


  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isSubmitting =
    createProductMutation.isPending || updateProductMutation.isPending;

  // Create product handler
  const handleCreateProduct = async (formData: FormData) => {
    try {
      await createProductMutation.mutateAsync(formData);
      toast.success("Tạo sản phẩm thành công!");
      setCreateModalOpen(false);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể tạo sản phẩm"));
    }
  };

  // Update product handler
  const handleUpdateProduct = async (formData: FormData) => {
    if (!selectedProduct) return;
    try {
      await updateProductMutation.mutateAsync({
        productId: selectedProduct._id,
        formData,
      });
      toast.success("Cập nhật sản phẩm thành công!");
      setUpdateModalOpen(false);
      setSelectedProduct(null);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể cập nhật sản phẩm"));
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await deleteProductMutation.mutateAsync(product._id);
      toast.success("Xóa sản phẩm thành công!");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể xóa sản phẩm"));
    }
  };

  // Modal handlers
  const handleOpenCreate = () => setCreateModalOpen(true);

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setUpdateModalOpen(true);
  };

  const handleOpenView = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleEditFromView = (product: Product) => {
    setViewModalOpen(false);
    setSelectedProduct(product);
    setUpdateModalOpen(true);
  };

  const handleCloseCreateModal = (open: boolean) => {
    setCreateModalOpen(open);
  };

  const handleCloseUpdateModal = (open: boolean) => {
    setUpdateModalOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const handleCloseViewModal = (open: boolean) => {
    setViewModalOpen(open);
    if (!open) setSelectedProduct(null);
  };

  // Get main image from product
  const getMainImage = (product: Product): string | null => {
    // New structure: variants with images (primary source)
    if (product.variants?.[0]?.images?.[0]) {
      return product.variants[0].images[0];
    }
    return null;
  };

  // Get stock count
  const getStockCount = (product: Product): number => {
    // New structure: variants with stock
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((total, v) => total + (v.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const getStatusBadge = (product: Product) => {
    switch (product.status) {
      case "published":
        return {
          label: "Đang bán",
          className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
        };
      case "draft":
        return {
          label: "Bản nháp",
          className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
        };
      case "suspended":
        return {
          label: "Tạm ngưng",
          className: "bg-rose-100 text-rose-700 hover:bg-rose-100",
        };
      default:
        return {
          label: "Ẩn",
          className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
        };
    }
  };

  const renderStatusBadge = (product: Product) => {
    const statusBadge = getStatusBadge(product);

    return (
      <Badge
        variant="secondary"
        className={`rounded-full px-3 ${statusBadge.className}`}
      >
        {statusBadge.label}
      </Badge>
    );
  };

  if (!myShop) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#f7f7f7] rounded-xl flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Quản lý sản phẩm
            </h1>
            <p className="text-sm text-gray-500">
              {productPagination?.total || 0} sản phẩm trong shop của bạn
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#E53935] hover:bg-[#D32F2F] rounded-xl h-11 px-5 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#f7f7f7] rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 rounded-xl border-0 bg-white"
            />
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-xl px-4 bg-white border-0 w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>
      </div>

      {/* Products */}
      <div className="bg-[#f7f7f7] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <SpinnerLoading size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Bắt đầu thêm sản phẩm để bán hàng
            </p>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#E53935] hover:bg-[#D32F2F] rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm đầu tiên
            </Button>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-white/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Giá bán
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kho hàng
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr
                    key={product._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-white/50"}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f7f7f7] shrink-0">
                          {getMainImage(product) ? (
                            <Image
                              src={getMainImage(product)!}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[280px]">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {typeof product.category === "object"
                                ? product.category?.name
                                : "Chưa phân loại"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#E53935]">
                        {formatCurrency(product.price?.currentPrice || 0)}
                      </p>
                      {product.price?.discountPrice &&
                        product.price.discountPrice > 0 && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.price.discountPrice)}
                          </p>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          getStockCount(product) > 10
                            ? "text-green-600"
                            : getStockCount(product) > 0
                              ? "text-yellow-600"
                              : "text-red-500"
                        }`}
                      >
                        {getStockCount(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(product)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => handleOpenView(product)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(product)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(productPagination?.totalPages || 0) > 1 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-white/50">
                <p className="text-sm text-gray-500">
                  Hiển thị {products.length} / {productPagination?.total || 0}{" "}
                  sản phẩm
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border-0 bg-white"
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (productPagination?.totalPages || 0)}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border-0 bg-white"
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateModelProduct
        open={createModalOpen}
        onOpenChange={handleCloseCreateModal}
        onCreate={handleCreateProduct}
        isLoading={isSubmitting}
      />

      <UpdateModelProduct
        key={selectedProduct?._id}
        open={updateModalOpen}
        onOpenChange={handleCloseUpdateModal}
        product={selectedProduct}
        onUpdate={handleUpdateProduct}
        isLoading={isSubmitting}
      />

      <ViewModelProduct
        key={selectedProduct?._id}
        open={viewModalOpen}
        onOpenChange={handleCloseViewModal}
        product={selectedProduct}
        onEdit={handleEditFromView}
      />
    </div>
  );
}
