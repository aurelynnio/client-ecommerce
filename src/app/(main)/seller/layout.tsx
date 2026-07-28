'use client';
import { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Settings,
  Store,
  BarChart3,
  MessageSquare,
  Tag,
  Star,
  Menu,
} from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { cn } from '@/utils/cn';
import { useMyShop } from '@/hooks/queries/useShop';
import { Button } from '@/components/ui/button';
import { RequireRole } from '@/components/common/PermissionGate';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const menuItems = [
  {
    title: 'TỔNG QUAN',
    items: [{ name: 'Bảng điều khiển', href: '/seller', icon: LayoutDashboard }],
  },
  {
    title: 'QUẢN LÝ ĐƠN HÀNG',
    items: [
      { name: 'Tất cả đơn hàng', href: '/seller/orders', icon: ShoppingCart },
      { name: 'Vận chuyển', href: '/seller/shipping', icon: Truck },
    ],
  },
  {
    title: 'QUẢN LÝ SẢN PHẨM',
    items: [
      { name: 'Tất cả sản phẩm', href: '/seller/products', icon: Package },
      { name: 'Danh mục shop', href: '/seller/categories', icon: Tag },
      { name: 'Đánh giá', href: '/seller/reviews', icon: Star },
    ],
  },
  {
    title: 'KHÁC',
    items: [
      { name: 'Thống kê', href: '/seller/statistics', icon: BarChart3 },
      { name: 'Chat', href: '/seller/chat', icon: MessageSquare },
      { name: 'Cài đặt Shop', href: '/seller/settings', icon: Settings },
    ],
  },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: myShop, isLoading } = useMyShop();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRegisterPage = pathname === '/seller/register';
  const currentPage = useMemo(() => {
    const allItems = menuItems.flatMap((section) => section.items);
    return allItems.find((item) => {
      if (item.href === '/seller') return pathname === '/seller';
      return pathname === item.href || pathname.startsWith(item.href + '/');
    });
  }, [pathname]);

  const renderNavigation = (onItemClick?: () => void) => (
    <nav className="overflow-hidden rounded-xl border border-border bg-card">
      {menuItems.map((section) => (
        <div key={section.title}>
          <p className="px-4 pb-2 pt-4 text-[11px] font-semibold tracking-wider text-muted-foreground">
            {section.title}
          </p>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isRoot = item.href === '/seller';
            const isActive = isRoot
              ? pathname === '/seller'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'text-primary bg-primary/5 font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-primary')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  // Register page uses default layout
  if (isRegisterPage) {
    return <>{children}</>;
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <SpinnerLoading size={32} />
      </div>
    );
  }

  // No shop
  if (!myShop && !isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Store className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Bạn chưa có shop</h2>
          <p className="mb-6 text-muted-foreground">Đăng ký để bắt đầu bán hàng</p>
          <Button onClick={() => router.push('/seller/register')} className="bg-primary">
            Đăng ký bán hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RequireRole roles={['seller', 'admin']} redirectTo="/">
      <div className="-mx-4 -mt-4 min-h-screen bg-background">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] border-r border-border bg-card p-0">
            <SheetTitle className="sr-only">Menu Điều hướng Người bán</SheetTitle>
            <div className="flex h-full flex-col">
              <div className="px-4 pt-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                      {myShop?.logo ? (
                        <Image
                          src={myShop.logo}
                          alt={myShop.name}
                          width={56}
                          height={56}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{myShop?.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            myShop?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {myShop?.status === 'active' ? 'Hoạt động' : myShop?.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 px-3 py-4">
                {renderNavigation(() => setSidebarOpen(false))}
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6">
          {/* Mobile Header */}
          <div className="sticky top-0 z-40 -mx-4 border-b border-border bg-card px-4 py-3 lg:hidden sm:-mx-6 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Mở điều hướng người bán"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {currentPage?.name || 'Bảng điều khiển'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{myShop?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    myShop?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {myShop?.status === 'active' ? 'Hoạt động' : myShop?.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 py-4 sm:py-6">
            {/* Sidebar */}
            <aside className="hidden lg:block w-[240px] shrink-0">
              {/* Shop Card */}
              <div className="mb-4 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                    {myShop?.logo ? (
                      <Image
                        src={myShop.logo}
                        alt={myShop.name}
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{myShop?.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          myShop?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {myShop?.status === 'active' ? 'Hoạt động' : myShop?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {renderNavigation()}
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
