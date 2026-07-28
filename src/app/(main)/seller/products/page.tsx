'use client';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
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
} from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyShop } from '@/hooks/queries/useShop';
import {
  useShopProducts,
  useCreateProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
} from '@/hooks/queries/useProducts';
import { CreateModelProduct } from '@/components/product/forms/CreateModelProduct';
import { UpdateModelProduct } from '@/components/product/forms/UpdateModelProduct';
import { ViewModelProduct } from '@/components/product/forms/ViewModelProduct';
import { Product } from '@/types/product';
import { formatCurrency } from '@/utils/format';
import { getSafeErrorMessage } from '@/api';

export default function SellerProductsPage() {
  const { data: myShop } = useMyShop();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: productsData, isLoading } = useShopProducts(myShop?._id || '', { page, limit });
  const products = productsData?.products || [];
  const productPagination = productsData?.pagination;

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateSellerProduct();
  const deleteProductMutation = useDeleteSellerProduct();

  const [searchTerm, setSearchTerm] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  // Create product handler
  const handleCreateProduct = async (formData: FormData) => {
    try {
      await createProductMutation.mutateAsync(formData);
      toast.success('Tạo sản phẩm thành công!');
      setCreateModalOpen(false);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể tạo sản phẩm'));
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
      toast.success('Cập nhật sản phẩm thành công!');
      setUpdateModalOpen(false);
      setSelectedProduct(null);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể cập nhật sản phẩm'));
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await deleteProductMutation.mutateAsync(product._id);
      toast.success('Xóa sản phẩm thành công!');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể xóa sản phẩm'));
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
      case 'published':
        return {
          label: 'Đang bán',
          variant: 'success' as const,
        };
      case 'draft':
        return {
          label: 'Bản nháp',
          variant: 'warning' as const,
        };
      case 'suspended':
        return {
          label: 'Tạm ngưng',
          variant: 'destructive' as const,
        };
      default:
        return {
          label: 'Ẩn',
          variant: 'secondary' as const,
        };
    }
  };

  const renderStatusBadge = (product: Product) => {
    const statusBadge = getStatusBadge(product);

    return <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>;
  };

  if (!myShop) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Quản lý sản phẩm</h1>
            <p className="text-sm text-muted-foreground">
              {productPagination?.total || 0} sản phẩm trong shop của bạn
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="h-10 w-full rounded-lg bg-primary px-4 hover:bg-primary-hover sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg bg-card pl-11"
            />
          </div>
          <Button variant="outline" className="h-10 w-full rounded-lg px-4 sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <SpinnerLoading size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Chưa có sản phẩm nào</h3>
            <p className="mb-6 text-sm text-muted-foreground">Bắt đầu thêm sản phẩm để bán hàng</p>
            <Button
              onClick={handleOpenCreate}
              className="rounded-lg bg-primary hover:bg-primary-hover"
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
                  <tr className="bg-muted/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Giá bán
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Kho hàng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => (
                    <tr
                      key={product._id}
                      className={`${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'} transition-colors hover:bg-muted/60`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {getMainImage(product) ? (
                              <Image
                                src={getMainImage(product)!}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[280px] truncate font-medium text-foreground">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {typeof product.category === 'object'
                                  ? product.category?.name
                                  : 'Chưa phân loại'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-primary">
                          {formatCurrency(product.price?.currentPrice || 0)}
                        </p>
                        {product.price?.discountPrice && product.price.discountPrice > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.price.discountPrice)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            getStockCount(product) > 10
                              ? 'text-success'
                              : getStockCount(product) > 0
                                ? 'text-warning'
                                : 'text-destructive'
                          }`}
                        >
                          {getStockCount(product)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{renderStatusBadge(product)}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg"
                              aria-label={`Thao tác với ${product.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 rounded-lg border-border"
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
                              className="cursor-pointer text-destructive focus:text-destructive"
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
              <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {products.length} / {productPagination?.total || 0} sản phẩm
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg"
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (productPagination?.totalPages || 0)}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg"
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
