'use client';

import { useState } from 'react';
import { Ruler, Search, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SizeAdvisorCardProps {
  className?: string;
  onSelectSizeQuery?: (size: string) => void;
}

interface SizeTier {
  size: string;
  height: string;
  weight: string;
  desc: string;
}

const SIZE_TIERS: SizeTier[] = [
  { size: 'S', height: '1m50 - 1m60', weight: '45 - 53kg', desc: 'Vừa vặn người nhỏ gọn' },
  { size: 'M', height: '1m60 - 1m68', weight: '54 - 62kg', desc: 'Chuẩn dáng phổ thông' },
  { size: 'L', height: '1m68 - 1m75', weight: '63 - 72kg', desc: 'Dáng cân đối, vừa vặn' },
  { size: 'XL', height: '1m75 - 1m82', weight: '73 - 82kg', desc: 'Cao to hoặc thích rộng' },
  { size: 'XXL', height: 'Trên 1m80', weight: 'Trên 82kg', desc: 'Thoải mái, ngoại cỡ' },
];

export default function SizeAdvisorCard({ className, onSelectSizeQuery }: SizeAdvisorCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>('L');

  const activeTier = SIZE_TIERS.find((t) => t.size === selectedSize) || SIZE_TIERS[2];

  return (
    <div className={`w-full my-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 text-xs shadow-2xs ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
          <Ruler className="h-4 w-4" />
          <span>Bảng Quy Đổi Size Chuẩn</span>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300">
          Form Regular Fit
        </Badge>
      </div>

      {/* Size Selector Buttons */}
      <div className="flex gap-1.5 mb-2.5">
        {SIZE_TIERS.map((tier) => (
          <button
            key={tier.size}
            type="button"
            onClick={() => setSelectedSize(tier.size)}
            className={`flex-1 py-1.5 rounded-lg border text-center font-bold text-xs transition-all ${
              selectedSize === tier.size
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-102'
                : 'bg-card text-foreground border-border hover:border-emerald-400'
            }`}
          >
            {tier.size}
          </button>
        ))}
      </div>

      {/* Highlighted Recommendation Details */}
      <div className="rounded-lg bg-card p-2.5 border border-border/80 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Khuyến nghị cho Size {activeTier.size}:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {activeTier.desc}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
          <div>
            <span className="text-muted-foreground">Chiều cao: </span>
            <span className="font-semibold text-foreground">{activeTier.height}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cân nặng: </span>
            <span className="font-semibold text-foreground">{activeTier.weight}</span>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      {onSelectSizeQuery && (
        <button
          type="button"
          onClick={() => onSelectSizeQuery(`Tìm các sản phẩm size ${activeTier.size} còn hàng`)}
          className="mt-2 w-full text-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1"
        >
          <Search className="h-3 w-3" />
          <span>Tìm sản phẩm còn Size {activeTier.size} cho tôi</span>
        </button>
      )}
    </div>
  );
}

