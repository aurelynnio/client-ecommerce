'use client';
import { memo, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import { useRecommendation } from '@/hooks/queries/useRecommendations';
import { ProductCard } from '@/components/product/ProductCard';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Product } from '@/types/product';
import { cn } from '@/utils/cn';

interface RecommendationSectionProps {
  className?: string;
}

// Section Header Component
const SectionHeader = memo(function SectionHeader({
  icon: Icon,
  title,
  iconColor = 'text-primary',
}: {
  icon: React.ElementType;
  title: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className={cn('h-5 w-5', iconColor)} />
      <h2 className="font-bold text-lg text-gray-800">{title}</h2>
    </div>
  );
});

// Product Grid Component
const ProductGrid = memo(function ProductGrid({
  products,
  columns = 6,
}: {
  products: Product[];
  columns?: number;
}) {
  const gridCols = {
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-3', gridCols[columns as keyof typeof gridCols] || gridCols[6])}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
});

// For You Section (Guess You Like)
export const ForYouSection = memo(function ForYouSection({
  className,
}: RecommendationSectionProps) {
  const { forYou, isLoading } = useRecommendation({ limit: 12 });

  if (isLoading && forYou.length === 0) {
    return (
      <section className={cn('py-6', className)}>
        <SectionHeader icon={Sparkles} title="Gợi ý cho bạn" />
        <div className="flex items-center justify-center py-12">
          <SpinnerLoading size={24} />
        </div>
      </section>
    );
  }

  if (forYou.length === 0) return null;

  return (
    <section className={cn('py-6', className)}>
      <SectionHeader icon={Sparkles} title="Gợi ý cho bạn" />
      <ProductGrid products={forYou} />
    </section>
  );
});

// Recently Viewed Section
export const RecentlyViewedSection = memo(function RecentlyViewedSection({
  className,
}: RecommendationSectionProps) {
  const { recentlyViewed } = useRecommendation({ limit: 10 });

  if (recentlyViewed.length === 0) return null;

  return (
    <section className={cn('py-6', className)}>
      <SectionHeader icon={Clock} title="Đã xem gần đây" iconColor="text-blue-500" />
      <ProductGrid products={recentlyViewed} columns={5} />
    </section>
  );
});

// Homepage Recommendations (Combined)
export const HomepageRecommendations = memo(function HomepageRecommendations({
  className,
}: RecommendationSectionProps) {
  const { homepage, isLoading, fetchHomepage } = useRecommendation();

  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

  if (isLoading && !homepage) {
    return (
      <div className={cn('py-6', className)}>
        <div className="flex items-center justify-center py-12">
          <SpinnerLoading size={24} />
        </div>
      </div>
    );
  }

  if (!homepage) return null;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Popular Products */}
      {homepage.popular && homepage.popular.length > 0 && (
        <section>
          <SectionHeader icon={TrendingUp} title="Sản phẩm bán chạy" iconColor="text-orange-500" />
          <ProductGrid products={homepage.popular} columns={5} />
        </section>
      )}

      {/* Top Rated */}
      {homepage.topRated && homepage.topRated.length > 0 && (
        <section>
          <SectionHeader icon={Star} title="Đánh giá cao" iconColor="text-yellow-500" />
          <ProductGrid products={homepage.topRated} columns={5} />
        </section>
      )}

      {/* For You */}
      {homepage.forYou && homepage.forYou.length > 0 && (
        <section>
          <SectionHeader icon={Sparkles} title="Dành cho bạn" />
          <ProductGrid products={homepage.forYou} />
        </section>
      )}
    </div>
  );
});

export default ForYouSection;
