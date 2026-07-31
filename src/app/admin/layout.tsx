'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/hooks/hooks';
import { useLogout } from '@/hooks/queries';
import { toast } from 'sonner';
import Image from 'next/image';
import { ADMIN_NAVIGATION } from '@/constants';
import NotificationModel from '@/components/notifications/NotificationModel';
import { useUnreadNotificationCount } from '@/hooks/queries/useNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RequireRole } from '@/components/common/PermissionGate';
import { usePermissions } from '@/context/PermissionContext';
import { getSafeErrorMessage } from '@/api';
import {
  adminFieldSurfaceClass,
  adminShellClass,
  adminSubtleSurfaceClass,
} from '@/components/admin/shared/AdminPrimitives';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data, isAuthenticated } = useAppSelector((state) => state.auth);
  const isAdmin = data?.roles === 'admin';
  const { data: unreadCountData } = useUnreadNotificationCount({
    enabled: isAuthenticated && isAdmin,
  });
  const unreadCount = unreadCountData || 0;
  const { hasPermission } = usePermissions();

  // Filter navigation items based on user permissions
  const filteredNavigation = useMemo(() => {
    return ADMIN_NAVIGATION.filter((item) => {
      // If no permission required, show the item
      if (!item.permission) return true;
      // Admin role has all permissions
      if (data?.roles === 'admin') return true;
      // Check if user has the required permission
      return hasPermission(item.permission);
    });
  }, [data?.roles, hasPermission]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success('Đăng xuất thành công');
      router.push('/');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể đăng xuất'));
    }
  };

  // Get current page title
  const currentPage = filteredNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  );

  return (
    <RequireRole roles="admin" redirectTo="/">
      <div className={cn('flex min-h-screen lg:h-screen', adminShellClass)}>
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className={cn(
              'w-[280px] border-r-0 p-0',
              adminSubtleSurfaceClass,
              'rounded-none border-y-0 border-l-0',
            )}
          >
            <SheetTitle className="sr-only">Menu Điều hướng Admin</SheetTitle>
            <div className="flex h-full min-h-0 flex-col">
              {/* Mobile Logo */}
              <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary">
                    <span className="text-primary-foreground font-bold text-sm">A</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight">Quản trị</span>
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1 px-3 py-4">
                <nav className="flex flex-col gap-1">
                  {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'border border-border bg-card text-primary'
                            : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                        )}
                      >
                        <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 h-4 border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 z-50 hidden min-h-0 flex-col transition-[width] duration-300 ease-in-out lg:flex',
            adminSubtleSurfaceClass,
            'rounded-none border-y-0 border-l-0',
            isCollapsed ? 'w-[72px]' : 'w-[260px]',
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary">
                  <span className="text-primary-foreground font-bold">A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight">Bảng quản trị</span>
                  <span className="text-[10px] text-muted-foreground">Thương mại điện tử</span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                isCollapsed && 'mx-auto',
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="min-h-0 flex-1 px-3 py-4">
            <nav className="flex flex-col gap-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'border border-border bg-card text-primary'
                        : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                      isCollapsed && 'justify-center px-2',
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 h-4 border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}

                    {/* Collapsed badge indicator */}
                    {isCollapsed && item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User & Logout */}
          <div className="shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {!isCollapsed && data && (
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="relative h-9 w-9 rounded-full overflow-hidden">
                  <Image
                    src={data.avatar || '/images/placeholder-avatar.svg'}
                    alt={data.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{data.username}</p>
                  <p className="text-xs text-muted-foreground">Quản trị viên</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
                isCollapsed && 'justify-center px-0',
              )}
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
              {!isCollapsed && 'Đăng xuất'}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            'flex-1 flex min-h-screen min-w-0 flex-col lg:min-h-0 transition-[margin] duration-300',
            isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]',
          )}
        >
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 rounded-lg text-muted-foreground hover:bg-muted/30 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {currentPage?.name || 'Bảng điều khiển'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className={cn('relative rounded-lg hover:bg-muted', adminFieldSurfaceClass)}
                onClick={() => setNotificationOpen(true)}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>

              {data && (
                <div className="hidden md:flex items-center gap-3 pl-3">
                  <div className="text-right">
                    <p className="text-sm font-medium leading-none">{data.username}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Quản trị viên</p>
                  </div>
                  <div className="relative h-9 w-9 rounded-full overflow-hidden">
                    <Image
                      src={data.avatar || '/images/placeholder-avatar.svg'}
                      alt={data.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Notification Drawer */}
          <NotificationModel isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />

          {/* Page Content */}
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-8 sm:p-6 sm:pb-10">
            <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300">{children}</div>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
