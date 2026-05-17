/**
 * Product React Query Hooks
 * Replaces productAction.ts async thunks with React Query
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import instance from "@/api/api";
import { extractApiData, getSafeErrorMessage } from "@/api";
import { errorHandler } from "@/services/errorHandler";
import { STALE_TIME } from "@/constants/cache";
import { productKeys } from "@/lib/queryKeys";
import { Product, Variant, Price } from "@/types/product";
import { Shop } from "@/types/shop";
import { useAddToCart } from "./useCart";

export interface ProductListParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  isActive?: boolean;
  status?: "draft" | "published" | "suspended" | "all";
  rating?: string;
  colors?: string;
  sizes?: string;
  shop?: string;
  shopCategory?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Server response structure (may differ from client interface)
interface ServerProductListResponse {
  data?: Product[];
  products?: Product[];
  pagination: {
    currentPage?: number;
    page?: number;
    pageSize?: number;
    limit?: number;
    totalItems?: number;
    total?: number;
    totalPages: number;
  };
}

type QueryParamValue = string | number | boolean;

function hasValue<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

function normalizeProductListResponse(
  serverData: ServerProductListResponse,
): ProductListResponse {
  const pagination = serverData.pagination;

  return {
    products: serverData.data || serverData.products || [],
    pagination: {
      page: pagination.currentPage || pagination.page || 1,
      limit: pagination.pageSize || pagination.limit || 10,
      total: pagination.totalItems || pagination.total || 0,
      totalPages: pagination.totalPages || 1,
    },
  };
}

function buildProductQueryParams(
  params: ProductListParams,
): Record<string, QueryParamValue> {
  const queryParams: Record<string, QueryParamValue> = {};

  if (hasValue(params.page)) queryParams.page = params.page;
  if (hasValue(params.limit)) queryParams.limit = params.limit;
  if (params.sort) {
    const sortMap: Record<string, string> = {
      newest: "-createdAt",
      popular: "-soldCount",
      best_selling: "-soldCount",
      price_asc: "price.currentPrice",
      price_desc: "-price.currentPrice",
    };
    queryParams.sort = sortMap[params.sort] || params.sort;
  }
  if (params.category) queryParams.category = params.category;
  if (params.brand) queryParams.brand = params.brand;
  if (hasValue(params.minPrice)) queryParams.minPrice = params.minPrice;
  if (hasValue(params.maxPrice)) queryParams.maxPrice = params.maxPrice;
  if (params.tags?.length) queryParams.tags = params.tags.join(",");
  if (params.search?.trim()) queryParams.search = params.search.trim();
  if (params.status) {
    queryParams.status = params.status;
  } else if (hasValue(params.isActive)) {
    queryParams.status = params.isActive ? "published" : "suspended";
  }
  if (params.rating) queryParams.rating = params.rating;
  if (params.colors) queryParams.colors = params.colors;
  if (params.sizes) queryParams.sizes = params.sizes;
  if (params.shop) queryParams.shop = params.shop;
  if (params.shopCategory) queryParams.shopCategory = params.shopCategory;

  return queryParams;
}

function getNextPageParam(lastPage: ProductListResponse) {
  const { page, totalPages } = lastPage.pagination;
  return page < totalPages ? page + 1 : undefined;
}

function invalidateProductLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: productKeys.lists() });
}

function invalidateProductDetailById(
  queryClient: QueryClient,
  productId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: productKeys.detailById(productId),
  });
}

function syncProductDetailBySlug(queryClient: QueryClient, product: Product) {
  if (product.slug) {
    queryClient.setQueryData(productKeys.detail(product.slug), product);
  }
}

const productApi = {
  getAll: async (params: ProductListParams): Promise<ProductListResponse> => {
    const response = await instance.get("/products", {
      params: buildProductQueryParams(params),
    });
    const serverData = extractApiData<ServerProductListResponse>(response);
    return normalizeProductListResponse(serverData);
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await instance.get(`/products/slug/${slug}`);
    return extractApiData(response);
  },

  getById: async (productId: string): Promise<Product> => {
    const response = await instance.get(`/products/${productId}`);
    return extractApiData(response);
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await instance.get("/products/featured");
    return extractApiData(response);
  },

  getNewArrivals: async (): Promise<Product[]> => {
    const response = await instance.get("/products/new-arrivals");
    return extractApiData(response);
  },

  getOnSale: async (): Promise<Product[]> => {
    const response = await instance.get("/products/on-sale");
    return extractApiData(response);
  },

  getByCategory: async (categorySlug: string): Promise<Product[]> => {
    const response = await instance.get(`/products/category/${categorySlug}`);
    const result = extractApiData<{ data?: Product[]; products?: Product[] } | Product[]>(
      response,
    );
    if (Array.isArray(result)) {
      return result;
    }
    return result.data || result.products || [];
  },

  getByCategoryPaginated: async (
    categorySlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductListResponse> => {
    const response = await instance.get(`/products/category/${categorySlug}`, {
      params: { page, limit },
    });
    const serverData = extractApiData<ServerProductListResponse>(response);
    return normalizeProductListResponse(serverData);
  },

  getRelated: async (productId: string): Promise<Product[]> => {
    const response = await instance.get(`/products/related/${productId}`);
    return extractApiData(response);
  },

  search: async (params: {
    keyword: string;
    limit?: number;
  }): Promise<Product[]> => {
    const response = await instance.get("/products/search", {
      params: { q: params.keyword, limit: params.limit || 10 },
    });
    return extractApiData(response);
  },

  // Mutations
  create: async (formData: FormData): Promise<Product> => {
    const response = await instance.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractApiData(response);
  },

  update: async ({
    productId,
    formData,
  }: {
    productId: string;
    formData: FormData;
  }): Promise<Product> => {
    // Admin uses seller endpoint now as per server refactor
    const response = await instance.put(`/products/seller/${productId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractApiData(response);
  },

  delete: async (productId: string): Promise<void> => {
    await instance.delete(`/products/${productId}/permanent`);
  },

  // Seller mutations
  updateSeller: async ({
    productId,
    formData,
  }: {
    productId: string;
    formData: FormData;
  }): Promise<Product> => {
    const response = await instance.put(
      `/products/seller/${productId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return extractApiData(response);
  },

  deleteSeller: async (productId: string): Promise<void> => {
    await instance.delete(`/products/seller/${productId}`);
  },

  // Model mutations
  updateModel: async (params: {
    productId: string;
    modelId: string;
    updateData: { price?: number; stock?: number; sku?: string };
  }): Promise<Product> => {
    const { productId, modelId, updateData } = params;
    const response = await instance.put(
      `/products/seller/${productId}/variants/${modelId}`,
      updateData,
    );
    return extractApiData(response);
  },

  deleteModel: async (params: {
    productId: string;
    modelId: string;
  }): Promise<void> => {
    const { productId, modelId } = params;
    await instance.delete(
      `/products/seller/${productId}/variants/${modelId}`,
    );
  },
};

/**
 * Get all products with filters and pagination
 */
export function useProducts(
  params: ProductListParams = { page: 1, limit: 20 },
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.getAll(params),
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Infinite scroll products hook
 * Uses useInfiniteQuery for paginated data fetching
 */
export function useInfiniteProducts(
  params: Omit<ProductListParams, "page"> = { limit: 20 },
) {
  return useInfiniteQuery({
    queryKey: productKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      productApi.getAll({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get product by slug (for product detail page)
 */
export function useProduct(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productApi.getBySlug(slug),
    enabled: options?.enabled ?? !!slug,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get product by ID
 */
export function useProductById(
  productId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: productKeys.detailById(productId),
    queryFn: () => productApi.getById(productId),
    enabled: options?.enabled ?? !!productId,
  });
}

/**
 * Get featured products
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: productApi.getFeatured,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get new arrivals
 */
export function useNewArrivals() {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: productApi.getNewArrivals,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get on sale products
 */
export function useOnSaleProducts() {
  return useQuery({
    queryKey: productKeys.onSale(),
    queryFn: productApi.getOnSale,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get products by category
 */
export function useProductsByCategory(
  categorySlug: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: productKeys.byCategory(categorySlug),
    queryFn: () => productApi.getByCategory(categorySlug),
    enabled: options?.enabled ?? !!categorySlug,
  });
}

/**
 * Infinite scroll products by category
 */
export function useInfiniteProductsByCategory(
  categorySlug: string,
  options?: { enabled?: boolean; limit?: number },
) {
  const limit = options?.limit || 20;

  return useInfiniteQuery({
    queryKey: productKeys.infiniteByCategory(categorySlug),
    queryFn: ({ pageParam = 1 }) =>
      productApi.getByCategoryPaginated(categorySlug, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam,
    enabled: options?.enabled ?? !!categorySlug,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get related products
 */
export function useRelatedProducts(
  productId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: () => productApi.getRelated(productId),
    enabled: options?.enabled ?? !!productId,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get shop products
 */
export function useShopProducts(
  shopId: string,
  params?: Omit<ProductListParams, "shop">,
) {
  return useQuery({
    queryKey: productKeys.shopProducts(shopId, params),
    queryFn: () => productApi.getAll({ ...params, shop: shopId }),
    enabled: !!shopId,
  });
}

/**
 * Infinite scroll shop products
 */
export function useInfiniteShopProducts(
  shopId: string,
  params?: Omit<ProductListParams, "shop" | "page">,
) {
  const limit = params?.limit || 20;

  return useInfiniteQuery({
    queryKey: productKeys.infiniteShopProducts(shopId, params),
    queryFn: ({ pageParam = 1 }) =>
      productApi.getAll({ ...params, shop: shopId, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam,
    enabled: !!shopId,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Search products
 */
export function useProductSearch(keyword: string, limit?: number) {
  const normalizedKeyword = keyword.trim();

  return useQuery({
    queryKey: productKeys.search(normalizedKeyword, limit),
    queryFn: () => productApi.search({ keyword: normalizedKeyword, limit }),
    enabled: normalizedKeyword.length >= 2,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Create product mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      invalidateProductLists(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Create product failed" });
    },
  });
}

/**
 * Update product mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.update,
    onSuccess: (data, variables) => {
      invalidateProductDetailById(queryClient, variables.productId);
      invalidateProductLists(queryClient);
      syncProductDetailBySlug(queryClient, data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Update product failed" });
    },
  });
}

/**
 * Delete product mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      invalidateProductLists(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Delete product failed" });
    },
  });
}

/**
 * Seller update product mutation
 */
export function useUpdateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.updateSeller,
    onSuccess: (data, variables) => {
      invalidateProductDetailById(queryClient, variables.productId);
      invalidateProductLists(queryClient);
      syncProductDetailBySlug(queryClient, data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Seller update product failed" });
    },
  });
}

/**
 * Seller delete product mutation
 */
export function useDeleteSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteSeller,
    onSuccess: () => {
      invalidateProductLists(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Seller delete product failed" });
    },
  });
}

/**
 * Update product model mutation
 */
export function useUpdateProductModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.updateModel,
    onSuccess: (_, variables) => {
      invalidateProductDetailById(queryClient, variables.productId);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Update model failed" });
    },
  });
}

/**
 * Delete product model mutation
 */
export function useDeleteProductModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteModel,
    onSuccess: (_, variables) => {
      invalidateProductDetailById(queryClient, variables.productId);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Delete model failed" });
    },
  });
}

export interface UseProductDetailOptions {
  slug: string;
}

export interface UseProductDetailReturn {
  // Data
  product: Product | null;
  selectedVariant: Variant | null;
  selectedVariantIndex: number;
  selectedSize: string | null;
  quantity: number;
  selectedImageIndex: number;
  isLoading: boolean;
  error: string | null;

  // Computed
  displayImages: string[];
  activePrice: Price | null;
  shop: Shop | null;
  hasVariants: boolean;
  hasSizes: boolean;
  maxStock: number;
  availableSizes: string[];

  // Actions
  setSelectedVariantIndex: (index: number) => void;
  setSelectedSize: (size: string | null) => void;
  setQuantity: (qty: number) => void;
  setSelectedImageIndex: (index: number) => void;
  handleQuantityChange: (change: number) => void;
  handleVariantSelect: (index: number) => void;
  handleSizeSelect: (size: string) => void;
  handleAddToCart: () => Promise<boolean>;
  handleBuyNow: () => Promise<void>;
}

/**
 * Composite hook for product detail page
 * Handles product data fetching, variant selection, and cart operations
 */
export function useProductDetail({
  slug,
}: UseProductDetailOptions): UseProductDetailReturn {
  const router = useRouter();

  // Use React Query for product data
  const {
    data: currentProduct,
    isLoading,
    error: queryError,
  } = useProduct(slug);
  const addToCartMutation = useAddToCart();

  // Convert error to string
  const safeErrorMessage = queryError
    ? getSafeErrorMessage(queryError, "Không thể tải thông tin sản phẩm")
    : null;

  // Local state
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSizeInternal, setSelectedSizeInternal] = useState<
    string | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Derived selected size: use internal state or default to first available size
  const selectedSize = useMemo(() => {
    return selectedSizeInternal || currentProduct?.sizes?.[0] || null;
  }, [selectedSizeInternal, currentProduct]);

  // Show error toast
  useEffect(() => {
    if (safeErrorMessage) {
      toast.error(safeErrorMessage);
    }
  }, [safeErrorMessage]);

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!currentProduct?.variants?.length) return null;
    return (
      currentProduct.variants[selectedVariantIndex] ||
      currentProduct.variants[0]
    );
  }, [currentProduct, selectedVariantIndex]);

  // Check if product has variants
  const hasVariants = useMemo(() => {
    return Boolean(
      currentProduct?.variants && currentProduct.variants.length > 0,
    );
  }, [currentProduct]);

  // Check if product has sizes
  const hasSizes = useMemo(() => {
    return Boolean(currentProduct?.sizes && currentProduct.sizes.length > 0);
  }, [currentProduct]);

  // Get available sizes
  const availableSizes = useMemo(() => {
    return currentProduct?.sizes || [];
  }, [currentProduct]);

  // Get active price based on selection
  const activePrice = useMemo((): Price | null => {
    if (selectedVariant) {
      return {
        currentPrice: selectedVariant.price,
        discountPrice: null,
        currency: "VND",
      };
    }
    return currentProduct?.price || null;
  }, [selectedVariant, currentProduct]);

  // Get shop info
  const shop = useMemo((): Shop | null => {
    if (!currentProduct?.shop) return null;
    if (typeof currentProduct.shop === "string") {
      return { _id: currentProduct.shop, name: "Shop" } as Shop;
    }
    return currentProduct.shop;
  }, [currentProduct]);

  // Get display images - always from selected variant
  const displayImages = useMemo(() => {
    if (!currentProduct) return [];
    if (selectedVariant?.images?.length && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    if (currentProduct.variants?.[0]?.images?.length) {
      return currentProduct.variants[0].images;
    }
    return [];
  }, [currentProduct, selectedVariant]);

  // Get max stock for quantity validation
  const maxStock = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return currentProduct?.stock || 99;
  }, [selectedVariant, currentProduct]);

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (change: number) => {
      setQuantity((prev) => {
        const newQuantity = prev + change;
        if (newQuantity >= 1 && newQuantity <= Math.min(maxStock, 99)) {
          return newQuantity;
        }
        return prev;
      });
    },
    [maxStock],
  );

  // Handle variant selection
  const handleVariantSelect = useCallback((index: number) => {
    setSelectedVariantIndex(index);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, []);

  // Handle size selection
  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSizeInternal(size);
    setQuantity(1);
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback(async (): Promise<boolean> => {
    if (!currentProduct || addToCartMutation.isPending) return false;

    if (currentProduct.variants?.length && !selectedVariant) {
      toast.error("Vui lòng chọn màu sắc");
      return false;
    }

    if (selectedVariant && selectedVariant.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return false;
    }

    if (selectedVariant && quantity > selectedVariant.stock) {
      toast.error(`Chỉ còn ${selectedVariant.stock} sản phẩm`);
      return false;
    }

    if (currentProduct.sizes?.length && !selectedSize) {
      toast.error("Vui lòng chọn kích thước");
      return false;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: currentProduct._id,
        shopId: shop?._id || "",
        quantity,
        modelId: selectedVariant?._id ?? undefined,
        size: selectedSize ?? undefined,
      });

      toast.success("Đã thêm vào giỏ hàng");
      return true;
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể thêm vào giỏ hàng"));
      return false;
    }
  }, [
    currentProduct,
    addToCartMutation,
    quantity,
    selectedVariant,
    selectedSize,
    shop,
  ]);

  // Handle buy now
  const handleBuyNow = useCallback(async () => {
    const success = await handleAddToCart();
    if (success) {
      router.push("/checkout");
    }
  }, [handleAddToCart, router]);

  return {
    product: currentProduct ?? null,
    selectedVariant,
    selectedVariantIndex,
    selectedSize,
    quantity,
    selectedImageIndex,
    isLoading,
    error: safeErrorMessage,
    displayImages,
    activePrice,
    shop,
    hasVariants,
    hasSizes,
    maxStock,
    availableSizes,
    setSelectedVariantIndex,
    setSelectedSize: setSelectedSizeInternal,
    setQuantity,
    setSelectedImageIndex,
    handleQuantityChange,
    handleVariantSelect,
    handleSizeSelect,
    handleAddToCart,
    handleBuyNow,
  };
}
