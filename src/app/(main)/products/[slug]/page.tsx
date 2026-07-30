'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Home } from 'lucide-react';

// Custom hook
import { useProductDetail } from '@/hooks/queries';

// Local components
import { ProductGallery } from './_components/ProductGallery';
import { ProductInfo } from './_components/ProductInfo';
import { VariantSelector } from './_components/VariantSelector';
import { QuantitySelector } from './_components/QuantitySelector';
import { ProductActions } from './_components/ProductActions';
import { ProductTabs, TabId } from './_components/ProductTabs';
import { ProductSpecs } from './_components/ProductSpecs';
import { ProductDescription } from './_components/ProductDescription';
import { ProductReviews } from './_components/ProductReviews';

// Shared components
import RelatedProducts from '@/components/product/RelatedProducts';
import { RecentlyViewedSection } from '@/components/product/RecommendationSection';
import { useRecommendation } from '@/hooks/queries/useRecommendations';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { trackView } = useRecommendation();

  const {
    product,
    // ... other destructures
    selectedVariantIndex,
    selectedSize,
    quantity,
    selectedImageIndex,
    isLoading,
    displayImages,
    activePrice,
    shop,
    hasVariants,
    hasSizes,
    maxStock,
    availableSizes,
    setSelectedImageIndex,
    handleQuantityChange,
    handleVariantSelect,
    handleSizeSelect,
    handleAddToCart,
    handleBuyNow,
    setQuantity,
  } = useProductDetail({ slug });

  // Track view for recommendation system
  useEffect(() => {
    if (product?._id) {
      trackView(product._id);
    }
  }, [product?._id, trackView]);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('reviews');

  // Update active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['reviews', 'specs', 'description', 'related'] as const;
      const headerOffset = 150;

      for (const sectionId of sections) {
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerOffset && rect.bottom > headerOffset) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 font-sans text-foreground lg:pb-0">
      <div className="aura-container py-5 lg:py-7">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Home className="h-3 w-3" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="transition-colors hover:text-primary">
            Sản phẩm
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/products?category=${
                  typeof product.category === 'object'
                    ? product.category.slug
                    : product.category
                }`}
                className="transition-colors hover:text-primary"
              >
                {typeof product.category === 'object'
                  ? product.category.name
                  : 'Danh mục'}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 max-w-[200px] font-medium text-foreground">
            {product.name}
          </span>
        </nav>

        {/* Main Layout Section */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left: Gallery */}
          <div className="min-w-0 lg:col-span-7">
            <ProductGallery
              images={displayImages}
              productName={product.name}
              selectedIndex={selectedImageIndex}
              onIndexChange={setSelectedImageIndex}
            />
          </div>

          {/* Right: Product Info */}
          <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <ProductInfo product={product} activePrice={activePrice} shop={shop} />

            {/* Variant Selection */}
            {(hasVariants || hasSizes) && (
              <VariantSelector
                variants={product.variants}
                selectedIndex={selectedVariantIndex}
                onSelect={handleVariantSelect}
                sizes={availableSizes}
                selectedSize={selectedSize}
                onSizeSelect={handleSizeSelect}
              />
            )}

            {/* Quantity */}
            <QuantitySelector
              value={quantity}
              max={maxStock}
              onChange={setQuantity}
              onIncrement={() => handleQuantityChange(1)}
              onDecrement={() => handleQuantityChange(-1)}
            />

            {/* Action Buttons */}
            <ProductActions
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              disabled={maxStock <= 0}
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-12">
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* Content Sections */}
        <div className="max-w-[900px] space-y-8 py-8">
          {/* Reviews Section */}
          <ProductReviews
            productId={product._id}
            ratingAverage={product.ratingAverage}
            reviewCount={product.reviewCount}
          />

          <Separator className="bg-border" />

          {/* Specs Section */}
          <ProductSpecs product={product} />

          <Separator className="bg-border" />

          {/* Description Section */}
          <ProductDescription product={product} />
        </div>

        {/* Related Products */}
        <div id="section-related">
          <RelatedProducts productId={product._id} />
        </div>

        {/* Recently Viewed */}
        <RecentlyViewedSection className="mt-12 pt-8 border-t border-border/50" />
      </div>
    </div>
  );
}

// Skeleton component for loading state
function ProductDetailSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-[1240px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          {/* Gallery Skeleton */}
          <div className="hidden lg:flex gap-4">
            <div className="flex flex-col gap-2 w-[60px]">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-[60px] h-[60px] rounded-lg" />
              ))}
            </div>
            <Skeleton className="w-[420px] h-[420px] rounded-lg" />
          </div>
          <div className="lg:hidden">
            <Skeleton className="aspect-square w-full" />
          </div>

          {/* Info Skeleton */}
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-4 pt-8">
              <Skeleton className="h-12 w-[180px] rounded-lg" />
              <Skeleton className="h-12 w-[180px] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
