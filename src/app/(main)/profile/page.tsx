"use client";
import { useProfile } from "@/hooks/queries/useProfile";
import { useAppSelector } from "@/hooks/hooks";
import { useState } from "react";
import { useLogout } from "@/hooks/queries";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import UpdateUserProfile from "@/components/profile/modals/UpdateUserModal";
import ProfileTab from "@/components/profile/tabs/ProfileTab";
import OrdersTab from "@/components/profile/tabs/OrdersTab";
import AddressTab from "@/components/profile/tabs/AddressTab";
import SettingsTab from "@/components/profile/tabs/SettingsTab";
import ShopTab from "@/components/profile/tabs/ShopTab";
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
  Star,
  Store,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserOrders } from "@/hooks/queries/useOrders";
import { useWishlistCount } from "@/hooks/queries/useWishlist";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { loading: authLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: currentUser, isLoading } = useProfile();
  const { data: ordersData } = useUserOrders(
    { page: 1, limit: 50 },
    { enabled: isAuthenticated },
  );
  const { data: wishlistCount = 0 } = useWishlistCount({
    enabled: isAuthenticated,
  });
  const logoutMutation = useLogout();

  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam &&
    ["profile", "orders", "address", "settings", "shop"].includes(tabParam)
      ? tabParam
      : "profile";

  const [open, setOpen] = useState(false);
  const totalOrders =
    ordersData?.pagination?.totalItems || ordersData?.orders?.length || 0;
  const pendingOrders =
    ordersData?.orders?.filter((order) => order.status === "pending").length || 0;
  const followingCount = currentUser?.followingShops?.length || 0;

  const handleTabChange = (value: string) => {
    router.push(`/profile?tab=${value}`);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Đăng xuất thành công");
      router.push("/");
    } catch {
      toast.error("Không thể đăng xuất");
    }
  };

  const tabs = [
    {
      value: "profile",
      label: "Hồ sơ",
      icon: User,
      description: "Thông tin cá nhân",
    },
    {
      value: "orders",
      label: "Đơn hàng",
      icon: Package,
      description: "Theo dõi & lịch sử",
    },
    {
      value: "address",
      label: "Địa chỉ",
      icon: MapPin,
      description: "Địa chỉ giao hàng",
    },
    {
      value: "shop",
      label: "Shop của tôi",
      icon: Store,
      description: "Quản lý shop",
    },
    {
      value: "settings",
      label: "Cài đặt",
      icon: Settings,
      description: "Tùy chỉnh",
    },
  ];

  // Quick stats for user card
  const quickStats = [
    { label: "Đơn hàng", value: totalOrders.toString(), icon: Package },
    { label: "Yêu thích", value: wishlistCount.toString(), icon: Heart },
    { label: "Đang theo dõi", value: followingCount.toString(), icon: Gift },
  ];

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center bg-background -mt-4 -mx-4 px-4 py-20">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Vui lòng đăng nhập
          </h2>
          <p className="text-muted-foreground text-sm">
            Đăng nhập để quản lý tài khoản của bạn
          </p>
        </div>
        <Button
          onClick={() => router.push("/login")}
          className="bg-primary hover:bg-primary/90 rounded px-8 h-10"
        >
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background px-4 py-6">
      {(authLoading || isLoading || logoutMutation.isPending) && (
        <SpinnerLoading className="fixed inset-0 z-50 m-auto" />
      )}

      <div
        className={cn(
          "max-w-[1200px] mx-auto transition-opacity duration-200",
          (authLoading || isLoading || logoutMutation.isPending) && "opacity-50 pointer-events-none",
        )}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-[240px] shrink-0 space-y-4">
            {/* User Card */}
            <div className="bg-card rounded-md p-4 border border-border/50">
              <div className="flex items-center gap-3 pb-4 border-b border-border/30">
                <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                  <AvatarImage
                    src={currentUser?.avatar ?? undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {currentUser?.username || "Người dùng"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      Thành viên Vàng
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                {quickStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="text-center flex flex-col items-center"
                    >
                      <Icon className="h-3.5 w-3.5 text-primary/60 mb-1" />
                      <p className="font-semibold text-primary text-sm">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-card rounded-md overflow-hidden border border-border/50">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex w-full flex-row md:flex-col h-auto bg-transparent p-2 md:p-0 overflow-x-auto md:overflow-visible gap-2 md:gap-0">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          "flex-none md:flex-1 w-auto md:w-full justify-start px-3 md:px-4 py-2.5 md:py-3 rounded-md md:rounded-none text-sm font-medium border border-border/40 md:border-0 md:border-l-2 md:border-l-transparent shrink-0",
                          "transition-all duration-200",
                          "bg-background md:bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                          "data-[state=active]:bg-primary/10 md:data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-primary md:data-[state=active]:border-l-primary",
                          "data-[state=inactive]:border-border/40 md:data-[state=inactive]:border-l-transparent",
                        )}
                      >
                        <Icon className="h-4 w-4 mr-3 shrink-0" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 hidden md:block" />
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
                  className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none px-4 py-3 h-auto"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Đăng xuất
                </Button>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-linear-to-br from-primary/90 to-primary rounded-md p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-5 w-5 opacity-90" />
                <span className="font-medium text-sm">Đơn hàng chờ xử lý</span>
              </div>
              <p className="text-2xl font-bold">{pendingOrders}</p>
              <p className="text-xs text-white/60 mt-1">Cần theo dõi sớm</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-md min-h-[500px] border border-border/50">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsContent
                  value="profile"
                  className="mt-0 focus-visible:ring-0 p-4"
                >
                  {currentUser && <ProfileTab user={currentUser} />}
                </TabsContent>
                <TabsContent
                  value="orders"
                  className="mt-0 focus-visible:ring-0 p-4"
                >
                  <OrdersTab />
                </TabsContent>
                <TabsContent
                  value="address"
                  className="mt-0 focus-visible:ring-0 p-4"
                >
                  {currentUser && <AddressTab user={currentUser} />}
                </TabsContent>
                <TabsContent
                  value="shop"
                  className="mt-0 focus-visible:ring-0 p-4"
                >
                  <ShopTab />
                </TabsContent>
                <TabsContent
                  value="settings"
                  className="mt-0 focus-visible:ring-0 p-4"
                >
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
