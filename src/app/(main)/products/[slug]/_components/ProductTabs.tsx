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
    <div className="border-b border-border sticky top-0 lg:top-14 bg-background z-20">
      <div className="flex items-center gap-8 lg:gap-12 max-w-[800px] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'reviews' ? reviewCount : undefined;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'px-2 py-4 text-sm font-medium whitespace-nowrap transition-colors relative',
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary',
              )}
            >
              {tab.label}
              {count !== undefined && (
                <span className="text-muted-foreground/60 font-normal ml-1">({count})</span>
              )}

              {/* Active indicator */}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductTabs;
