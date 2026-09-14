'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { getAuditLogs, type AuditLogEntry } from '@/api';
import { cn } from '@/utils/cn';
import {
  adminFieldSurfaceClass,
  adminFilterBarClass,
  adminRowHoverClass,
  adminSecondaryButtonClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from '@/components/admin/shared/AdminPrimitives';

export default function AuditLogViewer() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const {
    data: logsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['admin-permissions-audit', page, selectedAction],
    queryFn: () =>
      getAuditLogs({
        page,
        limit: pageSize,
        action: selectedAction !== 'all' ? selectedAction : undefined,
      }),
  });

  const auditLogs: AuditLogEntry[] = logsData?.logs || [];
  const pagination = logsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // Filter client-side by search term (admin or target user)
  const filteredLogs = auditLogs.filter((log) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const adminName =
      typeof log.adminId === 'object' ? log.adminId?.username?.toLowerCase() : '';
    const targetName =
      typeof log.targetUserId === 'object'
        ? log.targetUserId?.username?.toLowerCase()
        : '';
    const perm = log.permission?.toLowerCase() || '';

    return (
      adminName?.includes(q) || targetName?.includes(q) || perm.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Action Filter */}
      <div className={adminFilterBarClass}>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo Admin, Người dùng, Quyền..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className={cn(adminFieldSurfaceClass, 'pl-9')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Loại thao tác:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'grant', label: 'Cấp quyền (+)' },
            { id: 'revoke', label: 'Thu hồi (-)' },
            { id: 'bulk_update', label: 'Cập nhật nhóm' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedAction(item.id);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg border transition-colors',
                selectedAction === item.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Shell */}
      <div className={adminTableShellClass}>
        <div className="overflow-x-auto no-scrollbar">
          <Table className="min-w-[700px]">
            <TableHeader className={adminTableHeaderClass}>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Thời gian</TableHead>
                <TableHead className="w-[140px]">Hành động</TableHead>
                <TableHead className="w-[160px]">Admin thực hiện</TableHead>
                <TableHead className="w-[160px]">Tài khoản mục tiêu</TableHead>
                <TableHead>Nội dung phân quyền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <SpinnerLoading size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Chưa có nhật ký kiểm toán nào được ghi nhận.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const isAdminObj = typeof log.adminId === 'object';
                  const isTargetObj = typeof log.targetUserId === 'object';

                  return (
                    <TableRow key={log._id} className={adminRowHoverClass}>
                      {/* Timestamp */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {new Date(log.createdAt).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs capitalize font-medium',
                            log.action === 'grant' &&
                              'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            log.action === 'revoke' &&
                              'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                            log.action === 'bulk_update' &&
                              'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
                          )}
                        >
                          {log.action === 'grant' && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {log.action === 'revoke' && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {log.action === 'bulk_update' && (
                            <ShieldAlert className="h-3 w-3 mr-1" />
                          )}
                          {log.action}
                        </Badge>
                      </TableCell>

                      {/* Admin */}
                      <TableCell className="text-sm font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                            {(isAdminObj ? log.adminId?.username : 'A')
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                          <span>
                            {isAdminObj ? log.adminId?.username : String(log.adminId)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Target User */}
                      <TableCell className="text-sm font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {(isTargetObj ? log.targetUserId?.username : 'U')
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                          <span>
                            {isTargetObj
                              ? log.targetUserId?.username
                              : String(log.targetUserId)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Permission Content */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs max-w-[280px] truncate"
                          title={log.permission}
                        >
                          {log.permission}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
            <span className="text-muted-foreground">
              Trang {page} / {totalPages} ({pagination?.total || 0} bản ghi)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className={cn('h-8 gap-1', adminSecondaryButtonClass)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isFetching}
                className={cn('h-8 gap-1', adminSecondaryButtonClass)}
              >
                Sau <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

