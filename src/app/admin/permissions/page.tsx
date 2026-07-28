'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, History, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { getSafeErrorMessage } from '@/api';
import { RESOURCES } from '@/constants/permissions';
import {
  getAllPermissions,
  getRolePermissions,
  getAuditLogs,
  type AuditLogEntry,
} from '@/api/permission';
import {
  AdminPageHeader,
  adminFilterBarClass,
  adminRowHoverClass,
  adminSubtleSurfaceClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from '@/components/admin/shared/AdminPrimitives';
import { cn } from '@/utils/cn';

export default function AdminPermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');

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
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['admin-permissions-audit'],
    queryFn: () => getAuditLogs({ limit: 50 }),
  });

  const loading = permsLoading || rolesLoading || logsLoading;
  const allPermissions = permsData?.permissions || [];
  const rolePermissions = rolesData?.rolePermissions || {};
  const auditLogs: AuditLogEntry[] = logsData?.logs || [];
  const hasError = permsError || rolesError || logsError;

  // Ensure allPermissions is always an array before filtering
  const filteredPermissions = Array.isArray(allPermissions)
    ? allPermissions.filter((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const groupedPermissions = Object.values(RESOURCES).reduce(
    (acc, resource) => {
      acc[resource] = filteredPermissions.filter((p) => p.startsWith(`${resource}:`));
      return acc;
    },
    {} as Record<string, string[]>,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SpinnerLoading size={32} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Phân quyền"
          description="Kiểm tra quyền truy cập theo vai trò và lịch sử thay đổi vận hành."
        />
        <div className={cn(adminSubtleSurfaceClass, 'space-y-4 p-8 text-center')}>
          <p className="text-destructive">
            {getSafeErrorMessage(hasError, 'Không thể tải dữ liệu permissions')}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => refetchPerms()} variant="outline">
              Reload Permissions
            </Button>
            <Button onClick={() => refetchRoles()} variant="outline">
              Reload Role Defaults
            </Button>
            <Button onClick={() => refetchLogs()}>Reload Audit Logs</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Phân quyền"
        description="Kiểm tra quyền truy cập theo vai trò và lịch sử thay đổi vận hành."
      />

      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList className="w-full justify-start rounded-lg border border-border bg-muted/50 p-1 sm:w-fit">
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            All Permissions
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Role Defaults
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* All Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className={adminFilterBarClass}>
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm permission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="outline" className="w-fit">
              {filteredPermissions.length} permissions
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groupedPermissions).map(
              ([resource, perms]) =>
                perms.length > 0 && (
                  <section key={resource} className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold capitalize mb-3 flex items-center gap-2">
                      {resource}
                      <Badge variant="secondary">{perms.length}</Badge>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <Badge key={perm} variant="outline" className="font-mono text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </section>
                ),
            )}
          </div>
        </TabsContent>

        {/* Role Defaults Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(rolePermissions).map(([role, perms]) => (
              <section key={role} className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold capitalize mb-3 flex items-center gap-2">
                  <Badge
                    className={
                      role === 'admin'
                        ? 'bg-info/15 text-foreground'
                        : role === 'seller'
                          ? 'bg-primary/15 text-foreground'
                          : ''
                    }
                  >
                    {role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{perms.length} permissions</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {perms.map((perm) => (
                    <Badge key={perm} variant="outline" className="font-mono text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <div className={adminTableShellClass}>
            <div className="overflow-x-auto no-scrollbar">
              <Table className="min-w-[640px]">
                <TableHeader className={adminTableHeaderClass}>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Permission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Chưa có lịch sử thay đổi permission
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log._id} className={adminRowHoverClass}>
                        <TableCell className="text-sm">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.action === 'grant' ? 'default' : 'destructive'}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {typeof log.adminId === 'object' ? log.adminId.username : log.adminId}
                        </TableCell>
                        <TableCell className="text-sm">
                          {typeof log.targetUserId === 'object'
                            ? log.targetUserId.username
                            : log.targetUserId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.permission}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
