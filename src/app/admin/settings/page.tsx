'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Save, RotateCcw, CheckCircle } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/api';
import { useSettings, useUpdateSettings } from '@/hooks/queries/useSettings';
import { StoreSettings, NotificationSettings, DisplaySettings } from '@/types/settings';
import {
  AdminActionButton,
  AdminPageHeader,
  adminFieldSurfaceClass,
  adminSubtleSurfaceClass,
  adminSurfaceClass,
} from '@/components/admin/shared/AdminPrimitives';
import { cn } from '@/utils/cn';

export default function SettingsPage() {
  const { data: settings, isLoading, error, refetch } = useSettings();
  const updateMutation = useUpdateSettings();

  const initialStoreData = useMemo(
    () => ({
      name: settings?.store?.name || '',
      email: settings?.store?.email || '',
      phone: settings?.store?.phone || '',
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
  const [notificationEdits, setNotificationEdits] = useState<Partial<NotificationSettings>>({});
  const [displayEdits, setDisplayEdits] = useState<Partial<DisplaySettings>>({});

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

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleDisplayChange = (field: keyof DisplaySettings, value: boolean) => {
    setDisplayEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveStore = async () => {
    try {
      await updateMutation.mutateAsync({ store: storeData });
      toast.success('Đã lưu thông tin cửa hàng');
      setStoreEdits({});
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể lưu cài đặt'));
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateMutation.mutateAsync({ notifications: notificationData });
      toast.success('Đã lưu cài đặt thông báo');
      setNotificationEdits({});
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể lưu cài đặt'));
    }
  };

  const handleSaveDisplay = async () => {
    try {
      await updateMutation.mutateAsync({ display: displayData });
      toast.success('Đã lưu cài đặt hiển thị');
      setDisplayEdits({});
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể lưu cài đặt'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <SpinnerLoading size={32} />
          <p className="text-sm font-medium text-muted-foreground">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">Không thể tải cài đặt</p>
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
      <AdminPageHeader
        title="Cài đặt"
        description="Điều chỉnh thông tin cửa hàng, thông báo vận hành và cấu hình hiển thị của khu vực quản trị."
        actions={
          hasChanges ? (
            <div className="flex items-center gap-2 rounded-lg bg-warning/15 px-3 py-2 text-sm text-foreground">
              <span>Có thay đổi chưa lưu</span>
            </div>
          ) : undefined
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <div className={cn(adminSubtleSurfaceClass, 'w-fit p-2')}>
          <TabsList className="gap-2 bg-transparent p-0">
            <TabsTrigger
              value="general"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-card data-[state=active]:bg-card data-[state=active]:text-primary"
            >
              Chung
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-card data-[state=active]:bg-card data-[state=active]:text-primary"
            >
              Thông báo
            </TabsTrigger>
            <TabsTrigger
              value="display"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-card data-[state=active]:bg-card data-[state=active]:text-primary"
            >
              Hiển thị
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-0">
          <div className={cn(adminSurfaceClass, 'space-y-8 p-6')}>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Thông tin cửa hàng</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cập nhật thông tin cơ bản và kênh liên hệ vận hành.
              </p>
            </div>

            <div className="grid gap-6 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên cửa hàng
                </Label>
                <Input
                  id="name"
                  value={storeData.name || ''}
                  onChange={(e) => handleStoreChange('name', e.target.value)}
                  className={`h-10 ${adminFieldSurfaceClass}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email liên hệ
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={storeData.email || ''}
                  onChange={(e) => handleStoreChange('email', e.target.value)}
                  className={`h-10 ${adminFieldSurfaceClass}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  value={storeData.phone || ''}
                  onChange={(e) => handleStoreChange('phone', e.target.value)}
                  className={`h-10 ${adminFieldSurfaceClass}`}
                />
              </div>

              <div className="pt-2">
                <AdminActionButton onClick={handleSaveStore} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <SpinnerLoading size={16} noWrapper className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Lưu thay đổi
                </AdminActionButton>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <div className={cn(adminSurfaceClass, 'space-y-8 p-6')}>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Cấu hình thông báo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Chọn các sự kiện hệ thống cần theo dõi và cảnh báo.
              </p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div
                className={cn(
                  adminSubtleSurfaceClass,
                  'flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between',
                )}
              >
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="new-orders" className="text-base font-medium">
                    Đơn hàng mới
                  </Label>
                  <span className="text-xs text-muted-foreground font-normal">
                    Nhận thông báo khi phát sinh đơn hàng mới.
                  </span>
                </div>
                <Switch
                  id="new-orders"
                  checked={notificationData.newOrders}
                  onCheckedChange={(checked) => handleNotificationChange('newOrders', checked)}
                />
              </div>

              <div
                className={cn(
                  adminSubtleSurfaceClass,
                  'flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between',
                )}
              >
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="low-stock" className="text-base font-medium">
                    Cảnh báo tồn kho thấp
                  </Label>
                  <span className="text-xs text-muted-foreground font-normal">
                    Báo động khi số lượng sản phẩm xuống dưới ngưỡng an toàn.
                  </span>
                </div>
                <Switch
                  id="low-stock"
                  checked={notificationData.lowStock}
                  onCheckedChange={(checked) => handleNotificationChange('lowStock', checked)}
                />
              </div>

              <div className="pt-2">
                <AdminActionButton
                  onClick={handleSaveNotifications}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <SpinnerLoading size={16} noWrapper className="mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Lưu cấu hình thông báo
                </AdminActionButton>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="display" className="mt-0">
          <div className={cn(adminSurfaceClass, 'space-y-8 p-6')}>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Cấu hình giao diện</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tùy chỉnh cách hiển thị của khu vực quản trị.
              </p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div
                className={cn(
                  adminSubtleSurfaceClass,
                  'flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between',
                )}
              >
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Tùy chọn dark mode
                  </Label>
                  <span className="text-xs text-muted-foreground font-normal">
                    Bật hoặc tắt chế độ tối cho giao diện quản trị.
                  </span>
                </div>
                <Switch
                  id="dark-mode"
                  checked={displayData.darkMode}
                  onCheckedChange={(checked) => handleDisplayChange('darkMode', checked)}
                />
              </div>

              <div className="pt-2">
                <AdminActionButton onClick={handleSaveDisplay} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <SpinnerLoading size={16} noWrapper className="mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Lưu cài đặt hiển thị
                </AdminActionButton>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
