'use client';
import { useProfile } from '@/hooks/queries/useProfile';
import { useAppSelector } from '@/hooks/redux';
import { useState } from 'react';
import { useLogout } from '@/hooks/queries';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import UpdateUserProfile from '@/components/profile/modals/UpdateUserModal';
import ProfileTab from '@/components/profile/tabs/ProfileTab';
import OrdersTab from '@/components/profile/tabs/OrdersTab';
import AddressTab from '@/components/profile/tabs/AddressTab';
import SettingsTab from '@/components/profile/tabs/SettingsTab';
import ShopTab from '@/components/profile/tabs/ShopTab';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Heart,
  Wallet,
  Gift,
  Store,
  ShieldCheck,
  UserRound,
  Home,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserOrders } from '@/hooks/queries/useOrders';
import { useWishlistCount } from '@/hooks/queries/useWishlist';
import { getSafeErrorMessage } from '@/api';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { loading: authLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: currentUser, isLoading } = useProfile();
  const { data: ordersData } = useUserOrders({ page: 1, limit: 50 }, { enabled: isAuthenticated });
  const { data: wishlistCount = 0 } = useWishlistCount({
    enabled: isAuthenticated,
  });
  const logoutMutation = useLogout();

  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const activeTab =
    tabParam && ['profile', 'orders', 'address', 'settings', 'shop'].includes(tabParam)
      ? tabParam
      : 'profile';

  const [open, setOpen] = useState(false);
  const totalOrders = ordersData?.pagination?.totalItems || ordersData?.orders?.length || 0;
  const pendingOrders =
    ordersData?.orders?.filter((order) => order.status === 'pending').length || 0;
  const followingCount = currentUser?.followingShops?.length || 0;
  const accountRoleLabel =
    currentUser?.roles === 'admin'
      ? 'Quản trị viên'
      : currentUser?.roles === 'seller'
        ? 'Người bán'
        : 'Tài khoản cá nhân';
  const AccountBadgeIcon =
    currentUser?.roles === 'admin'
      ? ShieldCheck
      : currentUser?.roles === 'seller'
        ? Store
        : UserRound;

  const handleTabChange = (value: string) => {
    router.push(`/profile?tab=${value}`);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success('Đăng xuất thành công');
      router.push('/');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể đăng xuất'));
    }
  };

  const tabs = [
    {
      value: 'profile',
      label: 'Hồ sơ',
      icon: User,
      description: 'Thông tin cá nhân',
    },
    {
      value: 'orders',
      label: 'Đơn hàng',
      icon: Package,
      description: 'Theo dõi & lịch sử',
    },
    {
      value: 'address',
      label: 'Địa chỉ',
      icon: MapPin,
      description: 'Địa chỉ giao hàng',
    },
    {
      value: 'shop',
      label: 'Shop của tôi',
      icon: Store,
      description: 'Quản lý shop',
    },
    {
      value: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      description: 'Tùy chỉnh',
    },
  ];

  // Quick stats for user card
  const quickStats = [
    { label: 'Đơn hàng', value: totalOrders.toString(), icon: Package },
    { label: 'Yêu thích', value: wishlistCount.toString(), icon: Heart },
    { label: 'Đang theo dõi', value: followingCount.toString(), icon: Gift },
  ];

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-background py-4">
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
                <BreadcrumbPage>Hồ sơ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col items-center justify-center space-y-6 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted/30">
              <User className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Vui lòng đăng nhập</h2>
              <p className="text-sm text-muted-foreground">
                Đăng nhập để quản lý tài khoản của bạn
              </p>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="h-11 rounded-lg bg-primary px-8 font-medium hover:bg-primary-hover"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4">
      {(authLoading || isLoading || logoutMutation.isPending) && (
        <SpinnerLoading className="fixed inset-0 z-50 m-auto" />
      )}

      <div
        className={cn(
          'aura-container transition-opacity duration-200',
          (authLoading || isLoading || logoutMutation.isPending) &&
            'pointer-events-none opacity-50',
        )}
      >
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
              <BreadcrumbPage>Hồ sơ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-4 border-b border-border pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Tài khoản của tôi
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quản lý thông tin cá nhân, đơn hàng và địa chỉ giao hàng
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar */}
          <div className="w-full shrink-0 space-y-4 md:w-[240px]">
            {/* User Card */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                  <AvatarImage src={currentUser?.avatar ?? undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">
                    {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {currentUser?.username || 'Người dùng'}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <AccountBadgeIcon className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">{accountRoleLabel}</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                {quickStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex flex-col items-center text-center">
                      <Icon className="mb-1 h-3.5 w-3.5 text-primary/60" />
                      <p className="text-sm font-semibold text-primary">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex h-auto w-full flex-row gap-2 bg-transparent p-2 md:flex-col md:gap-0 md:p-0 md:overflow-visible">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          'w-auto shrink-0 justify-start rounded-lg border border-border/40 px-3 py-2.5 text-sm font-medium md:w-full md:rounded-none md:border-0 md:border-l-2 md:border-l-transparent',
                          'transition-colors duration-200',
                          'bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground md:bg-transparent',
                          'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary md:data-[state=active]:bg-primary/5 md:data-[state=active]:border-l-primary',
                          'data-[state=inactive]:border-border/40 md:data-[state=inactive]:border-l-transparent',
                        )}
                      >
                        <Icon className="mr-3 h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        <ChevronRight className="hidden h-4 w-4 text-muted-foreground/50 md:block" />
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              {/* Logout Button */}
              <div className="border-t border-border">
                <Button
                  onClick={() => {
                    void handleLogout();
                  }}
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-none px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="rounded-lg bg-primary p-4 text-primary-foreground">
              <div className="mb-3 flex items-center gap-2">
                <Wallet className="h-5 w-5 opacity-90" />
                <span className="text-sm font-medium">Đơn hàng chờ xử lý</span>
              </div>
              <p className="text-2xl font-bold">{pendingOrders}</p>
              <p className="mt-1 text-xs text-primary-foreground/70">Cần theo dõi sớm</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1">
            <div className="min-h-[500px] rounded-lg border border-border bg-card">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsContent value="profile" className="mt-0 p-4 focus-visible:ring-0">
                  {currentUser && <ProfileTab user={currentUser} />}
                </TabsContent>
                <TabsContent value="orders" className="mt-0 p-4 focus-visible:ring-0">
                  <OrdersTab />
                </TabsContent>
                <TabsContent value="address" className="mt-0 p-4 focus-visible:ring-0">
                  {currentUser && <AddressTab user={currentUser} />}
                </TabsContent>
                <TabsContent value="shop" className="mt-0 p-4 focus-visible:ring-0">
                  <ShopTab />
                </TabsContent>
                <TabsContent value="settings" className="mt-0 p-4 focus-visible:ring-0">
                  {currentUser && <SettingsTab user={currentUser} />}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <UpdateUserProfile open={open} setOpen={setOpen} />
    </div>
  );
}
