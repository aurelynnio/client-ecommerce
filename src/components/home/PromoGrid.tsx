import Link from 'next/link';
import { CreditCard, Headphones, RotateCcw, Truck } from 'lucide-react';

const services = [
  {
    title: 'Giao hàng rõ ràng',
    description: 'Theo dõi chính sách và trạng thái giao hàng.',
    href: '/shipping',
    icon: Truck,
  },
  {
    title: 'Đổi trả dễ hiểu',
    description: 'Xem hướng dẫn đổi trả trước khi mua.',
    href: '/returns',
    icon: RotateCcw,
  },
  {
    title: 'Thanh toán an toàn',
    description: 'Lựa chọn phương thức phù hợp ở bước thanh toán.',
    href: '/payment/success',
    icon: CreditCard,
  },
  {
    title: 'Cần hỗ trợ?',
    description: 'Tìm câu trả lời hoặc gửi yêu cầu hỗ trợ.',
    href: '/support',
    icon: Headphones,
  },
];

/** A compact service row, deliberately not another promo-card grid. */
export default function PromoGrid() {
  return (
    <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {services.map(({ title, description, href, icon: Icon }) => (
        <Link
          key={title}
          href={href}
          className="group flex gap-3 px-0 py-4 first:pt-0 last:pb-0 sm:px-5 sm:py-1 sm:first:pl-0 sm:last:pr-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-medium text-foreground group-hover:text-primary">
              {title}
            </span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">
              {description}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
