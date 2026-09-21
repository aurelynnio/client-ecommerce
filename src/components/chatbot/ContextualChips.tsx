'use client';

import { useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Ruler,
  Tag,
  Flame,
  RefreshCw,
  MessageSquare,
  Scale,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react';
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

    // Context 1: Empty search / Apology / Fallback Recovery
    const isZeroResults =
      text.includes('chưa tìm thấy') ||
      text.includes('không tìm thấy') ||
      text.includes('chưa có mẫu') ||
      text.includes('chưa thể xác nhận');

    if (isZeroResults) {
      return [
        {
          id: 'zero-bestseller',
          label: 'Xem hàng bán chạy nhất 🔥',
          query: 'Gợi ý cho tôi các sản phẩm bán chạy nhất hiện tại',
          icon: <Flame className="h-3 w-3 text-orange-500" />,
        },
        {
          id: 'zero-new',
          label: 'Xem hàng mới về ✨',
          query: 'Có những mẫu sản phẩm mới về nào hot nhất?',
          icon: <Sparkles className="h-3 w-3 text-primary" />,
        },
        {
          id: 'zero-budget',
          label: 'Mở rộng mức giá 💰',
          query: 'Tìm các sản phẩm thời trang phổ biến dưới 500.000đ',
          icon: <Tag className="h-3 w-3 text-emerald-500" />,
        },
        {
          id: 'zero-categories',
          label: 'Xem danh mục shop 👕',
          query: 'Cho tôi xem danh mục các loại sản phẩm của cửa hàng',
          icon: <HelpCircle className="h-3 w-3 text-blue-500" />,
        },
      ];
    }

    // Context 2: Comparison situation
    if (text.includes('so sánh') || text.includes('khác nhau') || text.includes('bảng so sánh')) {
      return [
        {
          id: 'compare-bestseller',
          label: 'Mẫu nào bán chạy hơn? ⭐',
          query: 'Trong các mẫu trên, mẫu nào được khách mua nhiều và đánh giá cao hơn?',
          icon: <Flame className="h-3 w-3" />,
        },
        {
          id: 'compare-size',
          label: 'Tư vấn size chi tiết 📏',
          query: 'Tư vấn chọn size vừa vặn cho các mẫu trên',
          icon: <Ruler className="h-3 w-3" />,
        },
        {
          id: 'compare-voucher',
          label: 'Voucher áp dụng hôm nay 🎟️',
          query: 'Có mã giảm giá nào áp dụng được cho các sản phẩm này không?',
          icon: <Tag className="h-3 w-3" />,
        },
      ];
    }

    // Context 3: Size Advisor / Height / Weight Consultation
    if (
      text.includes('chiều cao') ||
      text.includes('cân nặng') ||
      text.includes('bảng size') ||
      text.includes('tư vấn size') ||
      text.includes('mặc size')
    ) {
      return [
        {
          id: 'size-1m70',
          label: 'Tôi cao 1m70 nặng 65kg 📐',
          query: 'Tôi cao 1m70 nặng 65kg thì mặc size gì vừa đẹp nhất?',
          icon: <Ruler className="h-3 w-3" />,
        },
        {
          id: 'size-1m60',
          label: 'Tôi cao 1m60 nặng 52kg 📐',
          query: 'Tôi cao 1m60 nặng 52kg thì nên chọn size gì?',
          icon: <Ruler className="h-3 w-3" />,
        },
        {
          id: 'size-policy',
          label: 'Được đổi size nếu không vừa? 🔄',
          query: 'Chính sách đổi size nếu nhận hàng mặc không vừa như thế nào?',
          icon: <RefreshCw className="h-3 w-3" />,
        },
        {
          id: 'size-in-stock',
          label: 'Còn sẵn Size L không? 📦',
          query: 'Sản phẩm trên còn sẵn hàng Size L không shop?',
          icon: <ShoppingBag className="h-3 w-3" />,
        },
      ];
    }

    // Context 4: Product recommendation list present
    if (text.includes('sản phẩm') || text.includes('giá:') || text.includes('xem chi tiết')) {
      return [
        {
          id: 'prod-compare',
          label: 'So sánh các mẫu trên ⚖️',
          query: 'So sánh chi tiết các mẫu sản phẩm ở trên giúp tôi',
          icon: <Scale className="h-3 w-3" />,
        },
        {
          id: 'prod-size',
          label: 'Bảng quy đổi size 📏',
          query: 'Tư vấn bảng size chi tiết cho các sản phẩm trên',
          icon: <Ruler className="h-3 w-3" />,
        },
        {
          id: 'prod-voucher',
          label: 'Có mã giảm giá không? 🎟️',
          query: 'Có mã giảm giá hoặc voucher nào áp dụng được cho đơn này không?',
          icon: <Tag className="h-3 w-3" />,
        },
        {
          id: 'prod-colors',
          label: 'Còn màu nào khác? 🎨',
          query: 'Sản phẩm này còn những màu sắc nào khác không?',
        },
        {
          id: 'prod-return',
          label: 'Chính sách đổi trả 🔄',
          query: 'Chính sách đổi trả và bảo hành sản phẩm như thế nào?',
          icon: <RefreshCw className="h-3 w-3" />,
        },
      ];
    }

    // Context 5: Discount / Sale
    if (text.includes('giảm giá') || text.includes('sale') || text.includes('khuyến mãi')) {
      return [
        {
          id: 'sale-deepest',
          label: 'Sản phẩm giảm sâu nhất 🔥',
          query: 'Top sản phẩm đang giảm giá sâu nhất hiện nay',
          icon: <Flame className="h-3 w-3" />,
        },
        {
          id: 'sale-under300',
          label: 'Tìm đồ dưới 300k 💰',
          query: 'Tìm cho tôi các sản phẩm dưới 300.000đ',
        },
        {
          id: 'sale-freeship',
          label: 'Freeship đơn bao nhiêu? 🚚',
          query: 'Điều kiện để được miễn phí vận chuyển là gì?',
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
            {chip.icon && (
              <span className="text-muted-foreground group-hover:text-primary">{chip.icon}</span>
            )}
            <span>{chip.label}</span>
            <ArrowRight className="h-2.5 w-2.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}
