'use client';
import { useState, useMemo } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { toast } from 'sonner';
import { useProducts, useUpdateProduct, useDeleteProduct } from '@/hooks/queries/useProducts';
import { useAllShops } from '@/hooks/queries/useShop';
import { Product, AdminProductFilters } from '@/types/product';
import { Shop } from '@/types/shop';
import { ProductsHeader } from '@/components/admin/products/ProductHeader';
import { ProductsStats } from '@/components/admin/products/ProductStats';
import { ProductsTable } from '@/components/admin/products/ProductTable';
import { PaginationControls } from '@/components/common/Pagination';
import { UpdateModelProduct } from '@/components/product/forms/UpdateModelProduct';
import { ViewModelProduct } from '@/components/product/forms/ViewModelProduct';
import { getSafeErrorMessage } from '@/api';

export default function AdminProductsPage() {
  const { data: shopsData } = useAllShops();
  const shops: Shop[] = shopsData?.shops || [];

  const defaultFilters = useMemo(
    () => ({
      page: 1,
      limit: 10,
      search: '',
      category: '',
      brand: '',
      shop: '',
      minPrice: null,
      maxPrice: null,
      isActive: null,
    }),
    [],
  );

  const { filters, updateFilter, updateFilters } = useUrlFilters<AdminProductFilters>({
    defaultFilters,
    basePath: '/admin/products',
  });

  const currentPage = Number(filters.page) || 1;
  const pageSize = Number(filters.limit) || 10;

  const searchTerm = (filters.search as string) || '';
  const selectedCategory = (filters.category as string) || '';
  const selectedBrand = (filters.brand as string) || '';
  const selectedShop = (filters.shop as string) || '';
  const selectedMinPrice = filters.minPrice as number | null;
  const selectedMaxPrice = filters.maxPrice as number | null;
  const selectedStatus = filters.isActive as boolean | null;

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (selectedShop) params.shop = selectedShop;
    if (selectedMinPrice !== null) params.minPrice = selectedMinPrice;
    if (selectedMaxPrice !== null) params.maxPrice = selectedMaxPrice;
    if (selectedStatus !== null) params.isActive = selectedStatus;

    return params;
  }, [
    currentPage,
    pageSize,
    searchTerm,
    selectedCategory,
    selectedBrand,
    selectedShop,
    selectedMinPrice,
    selectedMaxPrice,
    selectedStatus,
  ]);

  const { data: productsData, isLoading, refetch: fetchProducts } = useProducts(queryParams);
  const products: Product[] = productsData?.products || [];

  // Transform pagination to match PaginationData interface
  const pagination = useMemo(() => {
    const paginationRaw = productsData?.pagination;
    if (!paginationRaw) return null;
    return {
      currentPage: paginationRaw.page,
      pageSize: paginationRaw.limit,
      totalPages: paginationRaw.totalPages,
      totalItems: paginationRaw.total,
      hasNextPage: paginationRaw.page < paginationRaw.totalPages,
      hasPrevPage: paginationRaw.page > 1,
      nextPage: paginationRaw.page < paginationRaw.totalPages ? paginationRaw.page + 1 : null,
      prevPage: paginationRaw.page > 1 ? paginationRaw.page - 1 : null,
    };
  }, [productsData?.pagination]);

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isUpdating = updateProductMutation.isPending;

  const handleUpdateProduct = async (id: string, productData: FormData) => {
    try {
      await updateProductMutation.mutateAsync({
        productId: id,
        formData: productData,
      });
      setUpdateModalOpen(false);
      setSelectedProduct(null);
      toast.success('Cập nhật sản phẩm thành công');
    } catch (error) {
      toast.error(getSafeErrorMessage(error, 'Không thể cập nhật sản phẩm'));
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await deleteProductMutation.mutateAsync(product._id);
      toast.success('Xóa sản phẩm thành công');
    } catch (error) {
      toast.error(getSafeErrorMessage(error, 'Không thể xóa sản phẩm'));
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setUpdateModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleEditFromView = (product: Product) => {
    setViewModalOpen(false);
    setSelectedProduct(product);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = (open: boolean) => {
    setUpdateModalOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const handleCloseViewModal = (open: boolean) => {
    setViewModalOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const totalProducts = pagination?.totalItems || 0;
  // Calculate stats based on current loaded products (or better, fetch from stats API if available)
  const activeProducts = products.filter((p) => p.isActive).length;
  // Note: These client-side stats are only for the current page. ideally we want backend stats.
  // Passing these mostly as placeholders/for immediate visual feedback.

  // Calculate total categories and on sale products for the stats component
  const totalCategories = new Set(
    products.map((p) => (typeof p.category === 'object' ? p.category?._id : p.category)),
  ).size;
  const productsOnSale = products.filter((p) => p.onSale).length;

  // Handlers for table filters
  const handleCategoryFilterChange = (category: string) => {
    updateFilter('category', category === 'all' ? '' : category);
  };

  const handleBrandFilterChange = (brand: string) => {
    updateFilters({ brand: brand === 'all' ? '' : brand, page: 1 });
  };

  const handlePriceFilterChange = (min: number | undefined, max: number | undefined) => {
    updateFilters({ minPrice: min || null, maxPrice: max || null, page: 1 });
  };

  const handleStatusFilterChange = (status: boolean | null) => {
    updateFilters({ isActive: status, page: 1 });
  };

  const handleShopFilterChange = (shop: string) => {
    updateFilters({ shop: shop === 'all' ? '' : shop, page: 1 });
  };

  return (
    <div className="space-y-8 p-1">
      <ProductsHeader onRefresh={fetchProducts} />

      <ProductsStats
        totalProducts={totalProducts}
        activeProducts={activeProducts}
        productsOnSale={productsOnSale}
        totalCategories={totalCategories}
      />

      <div className="space-y-6">
        <ProductsTable
          products={products}
          isLoading={isLoading}
          searchTerm={searchTerm}
          pageSize={pageSize}
          onSearch={(val) => updateFilters({ search: val, page: 1 })}
          onPageSizeChange={(size) => updateFilters({ limit: size, page: 1 })}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onView={handleViewProduct}
          onCategoryFilterChange={handleCategoryFilterChange}
          onBrandFilterChange={handleBrandFilterChange}
          onPriceFilterChange={handlePriceFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
          onShopFilterChange={handleShopFilterChange}
          selectedCategory={selectedCategory}
          selectedBrand={(filters.brand as string) || ''}
          selectedShop={selectedShop || 'all'}
          selectedMinPrice={filters.minPrice as number | undefined}
          selectedMaxPrice={filters.maxPrice as number | undefined}
          selectedStatus={filters.isActive as boolean | null}
          shops={shops}
        />

        <div className="mt-6 flex justify-center">
          <PaginationControls
            pagination={pagination}
            onPageChange={(page) => updateFilter('page', page)}
            itemName="sản phẩm"
          />
        </div>
      </div>

      <UpdateModelProduct
        key={selectedProduct?._id}
        open={updateModalOpen}
        onOpenChange={handleCloseUpdateModal}
        product={selectedProduct}
        onUpdate={(formData) =>
          selectedProduct && handleUpdateProduct(selectedProduct._id, formData)
        }
        isLoading={isUpdating}
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
