'use client';

import { useMemo } from 'react';
import { Sparkles, ArrowRight, Ruler, Tag, Flame, RefreshCw, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ContextualChipsProps {
  lastMessageContent?: string;
  onSelectChip: (query: string) => void;
  onOpenHandoff?: () => void;
  disabled?: boolean;
  className?: string;
}

interface ChipItem {
  id: string;
  label: string;
  query: string;
  icon?: React.ReactNode;
  isAction?: boolean;
}

export default function ContextualChips({
  lastMessageContent = '',
  onSelectChip,
  onOpenHandoff,
  disabled = false,
  className,
}: ContextualChipsProps) {
  const chips: ChipItem[] = useMemo(() => {
    const text = lastMessageContent.toLowerCase();

    // Context 1: Product recommendations
    if (text.includes('sản phẩm') || text.includes('giá:') || text.includes('xem chi tiết')) {
      return [
        {
          id: 'size-guide',
          label: 'Bảng quy đổi size 📏',
          query: 'Tư vấn bảng size chi tiết cho các sản phẩm trên',
          icon: <Ruler className="h-3 w-3" />,
        },
        {
          id: 'voucher-check',
          label: 'Có mã giảm giá không? 🎟️',
          query: 'Có mã giảm giá hoặc voucher nào áp dụng được cho đơn này không?',
          icon: <Tag className="h-3 w-3" />,
        },
        {
          id: 'color-options',
          label: 'Còn màu sắc nào khác? 🎨',
          query: 'Sản phẩm này còn những màu sắc nào khác không?',
        },
        {
          id: 'return-policy',
          label: 'Chính sách đổi trả 🔄',
          query: 'Chính sách đổi trả và bảo hành sản phẩm như thế nào?',
          icon: <RefreshCw className="h-3 w-3" />,
        },
      ];
    }

    // Context 2: Discount / Sale
    if (text.includes('giảm giá') || text.includes('sale') || text.includes('khuyến mãi')) {
      return [
        {
          id: 'best-discounts',
          label: 'Sản phẩm giảm sâu nhất 🔥',
          query: 'Top sản phẩm đang giảm giá sâu nhất hiện nay',
          icon: <Flame className="h-3 w-3" />,
        },
        {
          id: 'under-300k',
          label: 'Tìm đồ dưới 300k 💰',
          query: 'Tìm cho tôi các sản phẩm dưới 300.000đ',
        },
        {
          id: 'freeship',
          label: 'Freeship đơn bao nhiêu? 🚚',
          query: 'Điều kiện để được miễn phí vận chuyển là gì?',
        },
      ];
    }

    // Context 3: Size / Availability / Stock
    if (text.includes('size') || text.includes('còn hàng') || text.includes('tồn kho')) {
      return [
        {
          id: 'size-advise',
          label: 'Tư vấn theo chiều cao, cân nặng 📐',
          query: 'Tôi cao 1m70 nặng 65kg thì mặc size gì vừa đẹp?',
          icon: <Ruler className="h-3 w-3" />,
        },
        {
          id: 'delivery-time',
          label: 'Giao hàng mất bao lâu? ⚡',
          query: 'Thời gian giao hàng tiêu chuẩn mất bao lâu?',
        },
      ];
    }

    // Default general follow-ups
    return [
      {
        id: 'top-bestseller',
        label: 'Sản phẩm bán chạy nhất ⭐',
        query: 'Cho tôi xem top sản phẩm bán chạy nhất hiện tại',
        icon: <Flame className="h-3 w-3" />,
      },
      {
        id: 'new-arrivals',
        label: 'Hàng mới về ✨',
        query: 'Có những mẫu sản phẩm mới về nào đẹp không?',
        icon: <Sparkles className="h-3 w-3" />,
      },
      {
        id: 'promotions',
        label: 'Ưu đãi hôm nay 🎁',
        query: 'Cửa hàng đang có những chương trình ưu đãi nào?',
        icon: <Tag className="h-3 w-3" />,
      },
    ];
  }, [lastMessageContent]);

  return (
    <div className={cn('flex flex-col gap-1.5 pt-2', className)}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          <span>Gợi ý tiếp theo:</span>
        </div>
        {onOpenHandoff && (
          <button
            type="button"
            onClick={onOpenHandoff}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:underline hover:text-primary-hover"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Gặp CSKH</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectChip(chip.query)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-150 hover:border-primary/50 hover:bg-primary-light hover:text-primary disabled:opacity-50 disabled:pointer-events-none shadow-2xs active:scale-95"
          >
            {chip.icon && <span className="text-muted-foreground group-hover:text-primary">{chip.icon}</span>}
            <span>{chip.label}</span>
            <ArrowRight className="h-2.5 w-2.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}
