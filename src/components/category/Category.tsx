'use client';

import React from 'react';
import {
  Heart,
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
} from 'lucide-react';
import { useCategoryTree } from '@/hooks/queries/useCategories';
import { cn } from '@/utils/cn';

const categoryIcons: Record<string, React.ReactNode> = {
  electronics: <Laptop className="h-5 w-5" />,
  phones: <Smartphone className="h-5 w-5" />,
  home: <Home className="h-5 w-5" />,
  fashion: <Shirt className="h-5 w-5" />,
  men: <Shirt className="h-5 w-5" />,
  women: <Sparkles className="h-5 w-5" />,
  watches: <Watch className="h-5 w-5" />,
  jewelry: <Watch className="h-5 w-5" />,
  baby: <Baby className="h-5 w-5" />,
  kids: <Baby className="h-5 w-5" />,
  automotive: <Car className="h-5 w-5" />,
  food: <Utensils className="h-5 w-5" />,
  sports: <Dumbbell className="h-5 w-5" />,
  beauty: <Sparkles className="h-5 w-5" />,
};

const getIcon = (slug: string) =>
  Object.entries(categoryIcons).find(([key]) => slug.toLowerCase().includes(key))?.[1] ?? (
    <Package className="h-5 w-5" />
  );

interface CategoryProps {
  onSelectCategory: (slug: string | null) => void;
  selectedSlug: string | null;
}

/** Touch-first discovery tiles. The catalog remains the place for deep category navigation. */
export default function Category({ onSelectCategory, selectedSlug }: CategoryProps) {
  const { data: categories } = useCategoryTree();
  if (!categories?.length) return null;
  const tileClass = (active: boolean) =>
    cn(
      'flex min-h-20 items-center gap-3 rounded-lg border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active
        ? 'border-primary/30 bg-primary/5 text-primary'
        : 'border-border bg-card text-foreground hover:bg-muted',
    );
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={tileClass(!selectedSlug)}
      >
        <Heart className={cn('h-5 w-5', !selectedSlug && 'fill-current')} />
        <span className="text-sm font-medium">Gợi ý cho bạn</span>
      </button>
      {categories.slice(0, 9).map((category) => {
        const active = selectedSlug === category.slug;
        return (
          <button
            key={category._id}
            type="button"
            onClick={() => onSelectCategory(category.slug ?? null)}
            className={tileClass(active)}
          >
            <span className={cn(active ? 'text-primary' : 'text-muted-foreground')}>
              {getIcon(category.slug ?? '')}
            </span>
            <span className="line-clamp-2 text-sm font-medium">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
