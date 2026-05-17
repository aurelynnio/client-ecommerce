"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { useAppSelector } from "@/hooks/hooks";
import { useLogout } from "@/hooks/queries";
import { toast } from "sonner";
import Image from "next/image";
import { ADMIN_NAVIGATION } from "@/constants";
import NotificationModel from "@/components/notifications/NotificationModel";
import { useUnreadNotificationCount } from "@/hooks/queries/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RequireRole } from "@/components/common/PermissionGate";
import { usePermissions } from "@/context/PermissionContext";
import { getSafeErrorMessage } from "@/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data, isAuthenticated } = useAppSelector((state) => state.auth);
  const isAdmin = data?.roles === "admin";
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
      if (data?.roles === "admin") return true;
      // Check if user has the required permission
      return hasPermission(item.permission);
    });
  }, [data?.roles, hasPermission]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Đăng xuất thành công");
      router.push("/");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể đăng xuất"));
    }
  };

  // Get current page title
  const currentPage = filteredNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <RequireRole roles="admin" redirectTo="/">
      <div className="min-h-screen bg-white dark:bg-[#000000] flex">
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="w-[280px] p-0 border-r-0 bg-[#f7f7f7] dark:bg-[#1C1C1E]"
          >
            <SheetTitle className="sr-only">Menu Điều hướng Admin</SheetTitle>
            <div className="flex h-full flex-col">
              {/* Mobile Logo */}
              <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#E53935] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    Quản trị
                  </span>
                </div>
              </div>

              <ScrollArea className="flex-1 px-3 py-4">
                <nav className="flex flex-col gap-1">
                  {filteredNavigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-white text-[#E53935]"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive && "text-[#E53935]"
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge className="bg-[#E53935]/10 text-[#E53935] text-[10px] px-1.5 py-0 h-4 border-0">
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
            "hidden lg:flex flex-col bg-[#f7f7f7] dark:bg-[#1C1C1E] fixed inset-y-0 z-50 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-[72px]" : "w-[260px]"
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-[#E53935] flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight">
                    Bảng quản trị
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Thương mại điện tử
                  </span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg",
                isCollapsed && "mx-auto"
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
          <ScrollArea className="flex-1 py-4 px-3">
            <nav className="flex flex-col gap-1">
              {filteredNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-white dark:bg-white/10 text-[#E53935]"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/5",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive
                          ? "text-[#E53935]"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge className="bg-[#E53935]/10 text-[#E53935] text-[10px] px-1.5 py-0 h-4 border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}

                    {/* Collapsed badge indicator */}
                    {isCollapsed && item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#E53935]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User & Logout */}
          <div className="p-3">
            {!isCollapsed && data && (
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="relative h-9 w-9 rounded-full overflow-hidden">
                  <Image
                    src={data.avatar || "/default-avatar.png"}
                    alt={data.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {data.username}
                  </p>
                  <p className="text-xs text-muted-foreground">Quản trị viên</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors rounded-xl",
                isCollapsed && "justify-center px-0"
              )}
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && "Đăng xuất"}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300",
            isCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
          )}
        >
          {/* Header */}
          <header className="sticky top-0 z-40 h-16 bg-white dark:bg-[#000000] px-4 lg:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden -ml-2 text-muted-foreground rounded-xl hover:bg-[#f7f7f7]"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {currentPage?.name || "Bảng điều khiển"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-[#f7f7f7]"
                onClick={() => setNotificationOpen(true)}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E53935]" />
                )}
              </Button>

              {data && (
                <div className="hidden md:flex items-center gap-3 pl-3">
                  <div className="text-right">
                    <p className="text-sm font-medium leading-none">
                      {data.username}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quản trị viên
                    </p>
                  </div>
                  <div className="relative h-9 w-9 rounded-full overflow-hidden">
                    <Image
                      src={data.avatar || "/default-avatar.png"}
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
          <NotificationModel
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
            <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
