"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, CheckCircle } from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/api";
import { useSettings, useUpdateSettings } from "@/hooks/queries/useSettings";
import {
  StoreSettings,
  NotificationSettings,
  DisplaySettings,
} from "@/types/settings";

export default function SettingsPage() {
  const { data: settings, isLoading, error, refetch } = useSettings();
  const updateMutation = useUpdateSettings();

  const initialStoreData = useMemo(
    () => ({
      name: settings?.store?.name || "",
      email: settings?.store?.email || "",
      phone: settings?.store?.phone || "",
    }),
    [settings],
  );

  const initialNotificationData = useMemo(
    () => ({
      newOrders: settings?.notifications?.newOrders ?? true,
      lowStock: settings?.notifications?.lowStock ?? true,
    }),
    [settings],
  );

  const initialDisplayData = useMemo(
    () => ({
      darkMode: settings?.display?.darkMode ?? false,
    }),
    [settings],
  );

  const [storeEdits, setStoreEdits] = useState<Partial<StoreSettings>>({});
  const [notificationEdits, setNotificationEdits] = useState<
    Partial<NotificationSettings>
  >({});
  const [displayEdits, setDisplayEdits] = useState<Partial<DisplaySettings>>(
    {},
  );

  const storeData = { ...initialStoreData, ...storeEdits };
  const notificationData = { ...initialNotificationData, ...notificationEdits };
  const displayData = { ...initialDisplayData, ...displayEdits };

  const hasChanges =
    Object.keys(storeEdits).length > 0 ||
    Object.keys(notificationEdits).length > 0 ||
    Object.keys(displayEdits).length > 0;

  const handleStoreChange = (field: keyof StoreSettings, value: string) => {
    setStoreEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (
    field: keyof NotificationSettings,
    value: boolean,
  ) => {
    setNotificationEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleDisplayChange = (
    field: keyof DisplaySettings,
    value: boolean,
  ) => {
    setDisplayEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveStore = async () => {
    try {
      await updateMutation.mutateAsync({ store: storeData });
      toast.success("Đã lưu thông tin cửa hàng");
      setStoreEdits({});
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể lưu cài đặt"));
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateMutation.mutateAsync({ notifications: notificationData });
      toast.success("Đã lưu cài đặt thông báo");
      setNotificationEdits({});
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể lưu cài đặt"));
    }
  };

  const handleSaveDisplay = async () => {
    try {
      await updateMutation.mutateAsync({ display: displayData });
      toast.success("Đã lưu cài đặt hiển thị");
      setDisplayEdits({});
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể lưu cài đặt"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <SpinnerLoading size={32} />
          <p className="text-sm text-gray-500 font-medium">
            Đang tải cài đặt...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-gray-600">Không thể tải cài đặt</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system settings and display preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            <span>Có thay đổi chưa lưu</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="rounded-2xl bg-[#f7f7f7] p-2 w-fit">
          <TabsList className="bg-transparent p-0 gap-2">
            <TabsTrigger
              value="general"
              className="rounded-xl px-4 py-2 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-[#E53935] transition-all text-sm font-medium"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-xl px-4 py-2 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-[#E53935] transition-all text-sm font-medium"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="display"
              className="rounded-xl px-4 py-2 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-[#E53935] transition-all text-sm font-medium"
            >
              Display
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-0">
          <div className="rounded-2xl bg-white p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Store Information
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Update basic store details and contact info
              </p>
            </div>

            <div className="grid gap-6 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Store Name
                </Label>
                <Input
                  id="name"
                  value={storeData.name || ""}
                  onChange={(e) => handleStoreChange("name", e.target.value)}
                  className="rounded-xl border-0 bg-[#f7f7f7] focus:bg-white transition-all h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Contact Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={storeData.email || ""}
                  onChange={(e) => handleStoreChange("email", e.target.value)}
                  className="rounded-xl border-0 bg-[#f7f7f7] focus:bg-white transition-all h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={storeData.phone || ""}
                  onChange={(e) => handleStoreChange("phone", e.target.value)}
                  className="rounded-xl border-0 bg-[#f7f7f7] focus:bg-white transition-all h-10"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveStore}
                  disabled={updateMutation.isPending}
                  className="rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 px-6"
                >
                  {updateMutation.isPending ? (
                    <SpinnerLoading size={16} noWrapper className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <div className="rounded-2xl bg-white p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Notification Configuration
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose which events trigger notifications
              </p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-[#f7f7f7]">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="new-orders" className="text-base font-medium">
                    New Orders
                  </Label>
                  <span className="text-xs text-muted-foreground font-normal">
                    Check to receive notifications when new orders are placed
                  </span>
                </div>
                <Switch
                  id="new-orders"
                  checked={notificationData.newOrders}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("newOrders", checked)
                  }
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-[#f7f7f7]">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="low-stock" className="text-base font-medium">
                    Low Stock Alerts
                  </Label>
                  <span className="text-xs text-muted-foreground font-normal">
                    Get notified when product inventory drops below threshold
                  </span>
                </div>
                <Switch
                  id="low-stock"
                  checked={notificationData.lowStock}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("lowStock", checked)
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={updateMutation.isPending}
                  className="rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 px-6"
                >
                  {updateMutation.isPending ? (
                    <SpinnerLoading size={16} noWrapper className="mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="display" className="mt-0">
          <div className="rounded-2xl bg-white p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Interface Configuration
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Customize the look and feel of your admin panel
              </p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-[#f7f7f7]">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Dark Mode Preferences
                  </Label>
                  <span className="text-xs text-muted-foreground font-normal">
                    Toggle between light and dark themes for the interface
                  </span>
                </div>
                <Switch
                  id="dark-mode"
                  checked={displayData.darkMode}
                  onCheckedChange={(checked) =>
                    handleDisplayChange("darkMode", checked)
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveDisplay}
                  disabled={updateMutation.isPending}
                  className="rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 px-6"
                >
                  {updateMutation.isPending ? (
                    <SpinnerLoading size={16} noWrapper className="mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Save Display Settings
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
