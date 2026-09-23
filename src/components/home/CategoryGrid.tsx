'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Laptop,
  Smartphone,
  Home,
  Shirt,
  Watch,
  Baby,
  Car,
  Utensils,
  Dumbbell,
  ShoppingBag,
  Heart,
  Gem,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useCategoryTree } from '@/hooks/queries/useCategories';
import { cn } from '@/utils/cn';

const categoryIcons: Record<string, React.ReactNode> = {
  electronics: <Laptop className="h-5 w-5" />,
  phones: <Smartphone className="h-5 w-5" />,
  home: <Home className="h-5 w-5" />,
  fashion: <Shirt className="h-5 w-5" />,
  men: <Shirt className="h-5 w-5" />,
  women: <ShoppingBag className="h-5 w-5" />,
  watches: <Watch className="h-5 w-5" />,
  jewelry: <Gem className="h-5 w-5" />,
  baby: <Baby className="h-5 w-5" />,
  kids: <Baby className="h-5 w-5" />,
  automotive: <Car className="h-5 w-5" />,
  food: <Utensils className="h-5 w-5" />,
  sports: <Dumbbell className="h-5 w-5" />,
  beauty: <Heart className="h-5 w-5" />,
};

const getIcon = (slug: string) =>
  Object.entries(categoryIcons).find(([key]) => slug.toLowerCase().includes(key))?.[1] ?? (
    <Package className="h-5 w-5" />
  );

interface CategoryGridProps {
  onSelectCategory?: (slug: string | null) => void;
  selectedSlug?: string | null;
}

export default function CategoryGrid({ onSelectCategory, selectedSlug }: CategoryGridProps) {
  const { data: categories } = useCategoryTree();
  if (!categories?.length) return null;

  const items = categories.slice(0, 10);

  return (
    <section className="bg-card">
      <div className="aura-container py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Danh mục nổi bật</h2>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
          >
            Tất cả danh mục
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {items.map((category) => {
            const active = selectedSlug === category.slug;
            return (
              <button
                key={category._id}
                type="button"
                onClick={() => onSelectCategory?.(category.slug ?? null)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'border-primary bg-primary-light'
                    : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50',
                )}
              >
                <span
                  className={cn(
                    'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary-light group-hover:text-primary',
                  )}
                >
                  {category.images?.[0] ? (
                    <Image
                      src={category.images[0]}
                      alt={category.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    getIcon(category.slug ?? '')
                  )}
                </span>
                <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
