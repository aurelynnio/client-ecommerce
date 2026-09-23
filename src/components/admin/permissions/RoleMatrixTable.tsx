'use client';

import { useState, useMemo } from 'react';
import { Search, Shield, Check, Minus, Info, Store, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RESOURCES, ACTIONS } from '@/constants/permissions';
import { cn } from '@/utils/cn';
import {
  adminFieldSurfaceClass,
  adminFilterBarClass,
  adminRowHoverClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from '@/components/admin/shared/AdminPrimitives';

interface RoleMatrixTableProps {
  rolePermissions: Record<string, string[]>;
}

export default function RoleMatrixTable({ rolePermissions }: RoleMatrixTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'seller' | 'buyer'>('all');

  const adminPerms = rolePermissions?.admin || ['*:*'];
  const sellerPerms = rolePermissions?.seller || [];
  const buyerPerms = rolePermissions?.buyer || rolePermissions?.user || [];

  // Helper to check if a permission is covered by a role's permissions list
  const hasRolePermission = (rolePermList: string[], perm: string): boolean => {
    if (rolePermList.includes('*:*') || rolePermList.includes('*')) return true;
    if (rolePermList.includes(perm)) return true;

    const [resource] = perm.split(':');
    if (rolePermList.includes(`${resource}:*`) || rolePermList.includes(`${resource}:manage`)) {
      return true;
    }
    return false;
  };

  const filteredResources = useMemo(() => {
    return Object.values(RESOURCES).filter((res) =>
      res.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search and Role Filter Bar */}
      <div className={adminFilterBarClass}>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tài nguyên (product, order...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(adminFieldSurfaceClass, 'pl-9')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Lọc vai trò:</span>
          {(['all', 'admin', 'seller', 'buyer'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg border transition-colors capitalize',
                selectedRole === r
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted',
              )}
            >
              {r === 'all' ? 'Tất cả vai trò' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className={adminTableShellClass}>
        <div className="overflow-x-auto no-scrollbar">
          <Table className="min-w-[800px]">
            <TableHeader className={adminTableHeaderClass}>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Tài nguyên (Resource)</TableHead>
                <TableHead className="w-[120px]">Hành động</TableHead>
                {(selectedRole === 'all' || selectedRole === 'admin') && (
                  <TableHead className="text-center w-[160px]">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-info">
                      <Shield className="h-3.5 w-3.5" />
                      Admin (Quản trị)
                    </div>
                  </TableHead>
                )}
                {(selectedRole === 'all' || selectedRole === 'seller') && (
                  <TableHead className="text-center w-[160px]">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-primary">
                      <Store className="h-3.5 w-3.5" />
                      Seller (Người bán)
                    </div>
                  </TableHead>
                )}
                {(selectedRole === 'all' || selectedRole === 'buyer') && (
                  <TableHead className="text-center w-[160px]">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Buyer (Người mua)
                    </div>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy tài nguyên nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((resource) => {
                  const actionsList = Object.values(ACTIONS);

                  return actionsList.map((action, idx) => {
                    const perm = `${resource}:${action}`;
                    const canAdmin = hasRolePermission(adminPerms, perm);
                    const canSeller = hasRolePermission(sellerPerms, perm);
                    const canBuyer = hasRolePermission(buyerPerms, perm);

                    return (
                      <TableRow
                        key={perm}
                        className={cn(adminRowHoverClass, idx === 0 && 'border-t-2 border-border/80')}
                      >
                        {idx === 0 ? (
                          <TableCell
                            rowSpan={actionsList.length}
                            className="align-top font-semibold text-foreground capitalize border-r border-border/50 bg-muted/10"
                          >
                            <div className="sticky top-0 py-1">
                              <span className="text-sm font-semibold">{resource}</span>
                              <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                                {actionsList.length} actions
                              </div>
                            </div>
                          </TableCell>
                        ) : null}

                        <TableCell className="font-mono text-xs font-medium text-foreground/90">
                          {action}
                        </TableCell>

                        {/* Admin column */}
                        {(selectedRole === 'all' || selectedRole === 'admin') && (
                          <TableCell className="text-center">
                            {canAdmin ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 h-6 px-2 text-xs">
                                <Check className="h-3 w-3 mr-1" /> Cho phép
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/40">
                                <Minus className="h-4 w-4 mx-auto" />
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Seller column */}
                        {(selectedRole === 'all' || selectedRole === 'seller') && (
                          <TableCell className="text-center">
                            {canSeller ? (
                              <Badge className="bg-primary/15 text-primary border-0 h-6 px-2 text-xs">
                                <Check className="h-3 w-3 mr-1" /> Cho phép
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/40">
                                <Minus className="h-4 w-4 mx-auto" />
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Buyer column */}
                        {(selectedRole === 'all' || selectedRole === 'buyer') && (
                          <TableCell className="text-center">
                            {canBuyer ? (
                              <Badge className="bg-muted text-foreground/80 border-0 h-6 px-2 text-xs">
                                <Check className="h-3 w-3 mr-1" /> Cho phép
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/40">
                                <Minus className="h-4 w-4 mx-auto" />
                              </span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  });
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Matrix Footnote */}
      <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-muted/20 border border-border rounded-lg">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <span>
          <strong>Lưu ý:</strong> Quản trị viên (Admin) sở hữu siêu quyền <code>*:*</code> bao phủ
          toàn bộ tài nguyên hệ thống. Người bán (Seller) được cấp quyền theo cơ chế Wildcard{' '}
          <code>product:*</code> và <code>inventory:*</code>.
        </span>
      </div>
    </div>
  );
}

