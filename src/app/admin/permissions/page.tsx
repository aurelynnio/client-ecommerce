'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  Users,
  History,
  Key,
  Layers,
  Terminal,
  Sliders,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { getSafeErrorMessage } from '@/api';
import {
  getAllPermissions,
  getRolePermissions,
  getAuditLogs,
} from '@/api';
import {
  AdminPageHeader,
  adminSubtleSurfaceClass,
  adminSurfaceClass,
} from '@/components/admin/shared/AdminPrimitives';
import {
  UserPermissionEditor,
  RoleMatrixTable,
  PermissionSimulator,
  AuditLogViewer,
} from '@/components/admin/permissions';
import { cn } from '@/utils/cn';

function AdminPermissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryUserId = searchParams.get('userId');
  const queryTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<string>(queryTab || 'user-delegation');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(queryUserId);
  const [prevQueryUserId, setPrevQueryUserId] = useState<string | null>(queryUserId);
  const [prevQueryTab, setPrevQueryTab] = useState<string | null>(queryTab);

  if (queryUserId !== prevQueryUserId) {
    setPrevQueryUserId(queryUserId);
    setSelectedUserId(queryUserId);
    if (queryUserId) {
      setActiveTab('user-delegation');
    }
  }

  if (queryTab !== prevQueryTab) {
    setPrevQueryTab(queryTab);
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Keep URL in sync without full reload
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    if (!selectedUserId) {
      params.delete('userId');
    }
    router.replace(`/admin/permissions?${params.toString()}`, { scroll: false });
  };

  // Pre-fetch system-wide permissions & roles for KPI metrics
  const {
    data: permsData,
    isLoading: permsLoading,
    error: permsError,
    refetch: refetchPerms,
  } = useQuery({
    queryKey: ['admin-permissions-all'],
    queryFn: getAllPermissions,
  });

  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['admin-permissions-roles'],
    queryFn: getRolePermissions,
  });

  const {
    data: logsData,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['admin-permissions-audit-overview'],
    queryFn: () => getAuditLogs({ limit: 1 }),
  });

  const loading = permsLoading || rolesLoading;
  const hasError = permsError || rolesError;

  const allPermissions = permsData?.permissions || [];
  const groupedPerms = permsData?.grouped || {};
  const totalResources = Object.keys(groupedPerms).length || 17;
  const rolePermissions = rolesData?.rolePermissions || {};
  const totalAuditLogs = logsData?.pagination?.total || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <SpinnerLoading size={36} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Trung tâm phân quyền (RBAC Hub)"
          description="Quản lý ủy quyền nhân sự, ma trận quyền và nhật ký kiểm toán hệ thống."
        />
        <div className={cn(adminSubtleSurfaceClass, 'space-y-4 p-8 text-center')}>
          <p className="text-destructive font-medium">
            {getSafeErrorMessage(hasError, 'Không thể tải dữ liệu phân quyền hệ thống')}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => refetchPerms()} variant="outline">
              Tải lại Permissions
            </Button>
            <Button onClick={() => refetchRoles()} variant="outline">
              Tải lại Vai trò
            </Button>
            <Button onClick={() => refetchLogs()}>Tải lại Logs</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title="Trung tâm phân quyền & Ủy quyền (RBAC)"
        description="Quản lý quyền hạn chi tiết cho từng nhân viên, thiết lập đặc quyền, xem ma trận vai trò và kiểm tra giả lập quyền truy cập."
      />

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={adminSurfaceClass}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tài nguyên quản lý
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalResources}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sản phẩm, Đơn hàng, Voucher...</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={adminSurfaceClass}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tổng số quyền hạn
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{allPermissions.length}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Quy tắc quyền hạn chi tiết</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={adminSurfaceClass}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Vai trò hệ thống
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {Object.keys(rolePermissions).length || 3}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Admin, Seller, Buyer</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={adminSurfaceClass}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Lịch sử kiểm toán
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalAuditLogs}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Lần thay đổi quyền đã ghi nhận</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="w-full justify-start rounded-lg border border-border bg-muted/50 p-1 flex-wrap sm:w-fit h-auto gap-1">
          <TabsTrigger value="user-delegation" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Ủy quyền nhân sự & Tài khoản
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Ma trận quyền (Role Matrix)
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Giả lập kiểm tra quyền
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Nhật ký kiểm toán (Audit)
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: User Delegation & Permissions Editor */}
        <TabsContent value="user-delegation" className="space-y-4">
          <UserPermissionEditor
            initialUserId={selectedUserId}
            onUserChange={(userId) => setSelectedUserId(userId)}
          />
        </TabsContent>

        {/* Tab 2: Role Matrix Table */}
        <TabsContent value="matrix" className="space-y-4">
          <RoleMatrixTable rolePermissions={rolePermissions} />
        </TabsContent>

        {/* Tab 3: Permission Simulator */}
        <TabsContent value="simulator" className="space-y-4">
          <PermissionSimulator rolePermissions={rolePermissions} />
        </TabsContent>

        {/* Tab 4: Audit Logs */}
        <TabsContent value="audit" className="space-y-4">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminPermissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <SpinnerLoading size={36} />
        </div>
      }
    >
      <AdminPermissionsContent />
    </Suspense>
  );
}
