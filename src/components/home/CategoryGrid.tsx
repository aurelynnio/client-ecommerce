'use client';

import React from 'react';
import Link from 'next/link';
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
  Sparkles,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useCategoryTree } from '@/hooks/queries/useCategories';
import { cn } from '@/utils/cn';

const categoryIcons: Record<string, React.ReactNode> = {
  electronics: <Laptop className="h-6 w-6" />,
  phones: <Smartphone className="h-6 w-6" />,
  home: <Home className="h-6 w-6" />,
  fashion: <Shirt className="h-6 w-6" />,
  men: <Shirt className="h-6 w-6" />,
  women: <Sparkles className="h-6 w-6" />,
  watches: <Watch className="h-6 w-6" />,
  jewelry: <Watch className="h-6 w-6" />,
  baby: <Baby className="h-6 w-6" />,
  kids: <Baby className="h-6 w-6" />,
  automotive: <Car className="h-6 w-6" />,
  food: <Utensils className="h-6 w-6" />,
  sports: <Dumbbell className="h-6 w-6" />,
  beauty: <Sparkles className="h-6 w-6" />,
};

const getIcon = (slug: string) =>
  Object.entries(categoryIcons).find(([key]) => slug.toLowerCase().includes(key))?.[1] ?? (
    <Package className="h-6 w-6" />
  );

interface CategoryGridProps {
  onSelectCategory?: (slug: string | null) => void;
  selectedSlug?: string | null;
}

/**
 * Tmall-style rich category grid — icon cards with label, 10 items.
 * Replaces the old Category component with a denser, more visual layout.
 */
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
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary-light group-hover:text-primary',
                  )}
                >
                  {getIcon(category.slug ?? '')}
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
