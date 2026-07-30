import { ShieldCheck, RotateCcw, Truck, BadgeCheck } from 'lucide-react';

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Bảo vệ người mua',
    description: 'Hoàn tiền 100% nếu không nhận hàng',
  },
  {
    icon: RotateCcw,
    title: 'Đổi trả 7 ngày',
    description: 'Hoàn tiền hoặc đổi mới nhanh chóng',
  },
  {
    icon: Truck,
    title: 'Freeship toàn quốc',
    description: 'Giao hàng nhanh từ cửa hàng uy tín',
  },
  {
    icon: BadgeCheck,
    title: 'Chính hãng',
    description: 'Sản phẩm đã xác thực nguồn gốc',
  },
];

/**
 * Tmall-style trust bar — buyer protection signals.
 * Placed prominently on the home page to build marketplace trust.
 */
export default function TrustBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="aura-container grid grid-cols-2 gap-px overflow-hidden bg-border lg:grid-cols-4">
        {trustItems.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-3 bg-card px-4 py-4 transition-colors hover:bg-primary-light"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
