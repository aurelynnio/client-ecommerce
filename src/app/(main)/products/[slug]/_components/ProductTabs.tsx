'use client';

import { cn } from '@/utils/cn';

export type TabId = 'reviews' | 'specs' | 'description' | 'related';

interface Tab {
  id: TabId;
  label: string;
  count?: number;
}

interface ProductTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  reviewCount?: number;
}

const tabs: Tab[] = [
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'specs', label: 'Thông số' },
  { id: 'description', label: 'Mô tả chi tiết' },
  { id: 'related', label: 'Sản phẩm liên quan' },
];

export function ProductTabs({ activeTab, onTabChange, reviewCount }: ProductTabsProps) {
  const handleTabClick = (tabId: TabId) => {
    onTabChange(tabId);

    // Scroll to section
    const element = document.getElementById(`section-${tabId}`);
    if (element) {
      const headerOffset = 120; // Account for sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-16 z-20 border-b border-border bg-background md:top-[108px]">
      <div className="no-scrollbar flex max-w-[800px] items-center gap-8 overflow-x-auto lg:gap-12">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'reviews' ? reviewCount : undefined;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'relative whitespace-nowrap px-2 py-4 text-sm font-medium transition-colors',
                isActive ? 'font-bold text-primary' : 'text-muted-foreground hover:text-primary',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {count !== undefined && (
                <span className="ml-1 font-normal text-muted-foreground/60">({count})</span>
              )}

              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductTabs;
