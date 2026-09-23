'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, X, ShoppingBag, Scale } from 'lucide-react';
import { ParsedProduct } from './productParser';
import { Button } from '@/components/ui/button';

interface ComparisonMatrixProps {
  products: ParsedProduct[];
  onQuickBuy?: (product: ParsedProduct) => void;
}

export default function ComparisonMatrix({ products, onQuickBuy }: ComparisonMatrixProps) {
  if (!products || products.length < 2) return null;

  const compareItems = products.slice(0, 3);
  const colCount = compareItems.length;

  return (
    <div className="w-full my-3 rounded-xl border border-border/80 bg-card overflow-hidden text-xs shadow-2xs">
      <div className="bg-primary/5 p-2.5 border-b border-border/80 font-bold text-foreground flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scale className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs">Bảng So Sánh Sản Phẩm</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-normal">
          {colCount} sản phẩm
        </span>
      </div>

      <div
        className="grid divide-x divide-border"
        style={{ gridTemplateColumns: `90px repeat(${colCount}, minmax(0, 1fr))` }}
      >
        {/* Row 1: Header / Name + Image */}
        <div className="p-2 font-semibold text-muted-foreground bg-muted/20 flex items-center">
          Sản phẩm
        </div>
        {compareItems.map((p) => (
          <div key={p.id} className="p-2 flex flex-col items-center text-center">
            {p.image && (
              <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted mb-1.5 border border-border/60">
                <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
              </div>
            )}
            <Link
              href={p.productUrl}
              className="font-bold text-[11px] text-foreground hover:text-primary line-clamp-2 leading-tight"
            >
              {p.name}
            </Link>
          </div>
        ))}

        {/* Row 2: Price */}
        <div className="p-2 font-semibold text-muted-foreground bg-muted/20 border-t border-border flex items-center">
          Giá bán
        </div>
        {compareItems.map((p) => (
          <div key={p.id} className="p-2 text-center border-t border-border">
            <span className="font-bold text-primary text-xs">{p.price || 'Liên hệ'}</span>
            {p.originalPrice && (
              <p className="text-[10px] text-muted-foreground line-through">{p.originalPrice}</p>
            )}
          </div>
        ))}

        {/* Row 3: Brand */}
        <div className="p-2 font-semibold text-muted-foreground bg-muted/20 border-t border-border flex items-center">
          Thương hiệu
        </div>
        {compareItems.map((p) => (
          <div key={p.id} className="p-2 text-center text-foreground border-t border-border text-[11px]">
            {p.brand || 'Chính hãng'}
          </div>
        ))}

        {/* Row 4: Stock */}
        <div className="p-2 font-semibold text-muted-foreground bg-muted/20 border-t border-border flex items-center">
          Tình trạng
        </div>
        {compareItems.map((p) => (
          <div key={p.id} className="p-2 text-center border-t border-border">
            {p.inStock ? (
              <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5 text-[11px]">
                <Check className="h-3 w-3" /> Còn hàng
              </span>
            ) : (
              <span className="inline-flex items-center text-destructive font-semibold gap-0.5 text-[11px]">
                <X className="h-3 w-3" /> Hết hàng
              </span>
            )}
          </div>
        ))}

        {/* Row 5: Action */}
        <div className="p-2 font-semibold text-muted-foreground bg-muted/20 border-t border-border flex items-center">
          Hành động
        </div>
        {compareItems.map((p) => (
          <div key={p.id} className="p-2 text-center border-t border-border">
            {onQuickBuy ? (
              <Button
                size="sm"
                onClick={() => onQuickBuy(p)}
                className="h-6.5 text-[10px] px-2 font-semibold gap-1 w-full"
              >
                <ShoppingBag className="h-2.5 w-2.5" />
                <span>Mua ngay</span>
              </Button>
            ) : (
              <Link
                href={p.productUrl}
                className="inline-flex h-6.5 w-full items-center justify-center rounded-md bg-primary px-2 text-[10px] font-semibold text-white hover:bg-primary-hover"
              >
                Xem chi tiết
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

