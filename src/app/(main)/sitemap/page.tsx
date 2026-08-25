import Link from 'next/link';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const groups = [
  {
    title: 'Mua sắm',
    links: [
      { href: '/', label: 'Trang chủ' },
      { href: '/products', label: 'Sản phẩm' },
      { href: '/categories', label: 'Danh mục' },
      { href: '/flash-sale', label: 'Flash Sale' },
      { href: '/vouchers', label: 'Voucher' },
    ],
  },
  {
    title: 'Tài khoản',
    links: [
      { href: '/profile', label: 'Hồ sơ' },
      { href: '/profile?tab=orders', label: 'Đơn hàng' },
      { href: '/wishlist', label: 'Yêu thích' },
      { href: '/cart', label: 'Giỏ hàng' },
    ],
  },
  {
    title: 'Thông tin',
    links: [
      { href: '/help', label: 'Trợ giúp' },
      { href: '/support', label: 'Hỗ trợ' },
      { href: '/terms', label: 'Điều khoản' },
      { href: '/privacy', label: 'Bảo mật' },
      { href: '/shipping', label: 'Vận chuyển' },
    ],
  },
];

export default function SiteMapPage() {
  return (
    <main className="min-h-screen bg-background py-4">
      <div className="aura-container">
        <Breadcrumb className="mb-3">
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  <span>Trang chủ</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sơ đồ trang web</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="border-b border-border pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Sơ đồ trang web
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Danh sách các khu vực chính để truy cập nhanh
          </p>
        </header>

        <div className="grid gap-6 py-4 md:grid-cols-3">
          {groups.map((group) => (
            <section key={group.title} className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-lg font-semibold text-foreground">{group.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary transition-colors hover:text-primary-hover hover:underline underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
