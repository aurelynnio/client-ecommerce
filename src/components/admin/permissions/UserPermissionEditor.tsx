'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  User as UserIcon,
  Shield,
  Key,
  Check,
  RotateCcw,
  Save,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  Sliders,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { toast } from 'sonner';
import { RESOURCES, ACTIONS } from '@/constants/permissions';
import {
  getUserPermissions,
  updateUserPermissions,
  getRolePermissions,
  getAllPermissions,
} from '@/api';
import { getSafeErrorMessage } from '@/api';
import { useAllUsers } from '@/hooks/queries';
import { User } from '@/types/user';
import { cn } from '@/utils/cn';
import {
  adminFieldSurfaceClass,
  adminInsetPanelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSubtleSurfaceClass,
  adminSurfaceClass,
} from '@/components/admin/shared/AdminPrimitives';

// Pre-defined Staff Templates for one-click delegation
export const STAFF_PRESETS = [
  {
    id: 'cs',
    name: 'CSKH & Trực Chat',
    description: 'Chỉ xem đơn, chat với khách và phản hồi đánh giá',
    icon: '🎧',
    permissions: [
      'order:read',
      'chat:read',
      'chat:create',
      'chat:update',
      'chat:manage',
      'review:read',
      'review:update',
    ],
  },
  {
    id: 'warehouse',
    name: 'Quản lý Kho & Vận chuyển',
    description: 'Xem đơn, cập nhật trạng thái giao hàng và quản lý tồn kho',
    icon: '📦',
    permissions: [
      'order:read',
      'order:update',
      'inventory:read',
      'inventory:update',
      'inventory:manage',
      'shipping:read',
      'shipping:update',
      'product:read',
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Khuyến mãi',
    description: 'Quản lý Banner, Voucher, Flash Sale và xem sản phẩm',
    icon: '📣',
    permissions: [
      'banner:read',
      'banner:create',
      'banner:update',
      'banner:manage',
      'voucher:read',
      'voucher:create',
      'voucher:update',
      'flash-sale:read',
      'flash-sale:create',
      'flash-sale:update',
      'product:read',
    ],
  },
  {
    id: 'finance',
    name: 'Kế toán & Tài chính',
    description: 'Xem báo cáo doanh thu, đơn hàng và lịch sử giao dịch',
    icon: '📊',
    permissions: [
      'statistics:read',
      'statistics:manage',
      'order:read',
      'payment:read',
      'voucher:read',
    ],
  },
];

interface UserPermissionEditorProps {
  initialUserId?: string | null;
  onUserChange?: (userId: string) => void;
}

export default function UserPermissionEditor({
  initialUserId,
  onUserChange,
}: UserPermissionEditorProps) {
  // User Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  // Permissions State
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [allPermissionsList, setAllPermissionsList] = useState<string[]>([]);

  // User's custom overrides: e.g. ['product:create', '-order:cancel']
  const [userOverrides, setUserOverrides] = useState<string[]>([]);
  const [originalOverrides, setOriginalOverrides] = useState<string[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<string[]>([]);

  // Resource Filter & Expand
  const [resourceFilter, setResourceFilter] = useState('');
  const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({});

  // Query users matching search
  const { data: usersData, isLoading: searchingUsers } = useAllUsers({
    page: 1,
    limit: 8,
    search: searchQuery.trim() || undefined,
  });
  const userResults = usersData?.users || [];

  // Load system role permissions and all permissions once
  useEffect(() => {
    const loadSystemPermissions = async () => {
      try {
        const [rolesRes, allRes] = await Promise.all([
          getRolePermissions(),
          getAllPermissions(),
        ]);
        setRolePermissions(rolesRes?.rolePermissions || {});
        setAllPermissionsList(allRes?.permissions || []);
      } catch (err) {
        console.error('Failed to load system permissions:', err);
      }
    };
    loadSystemPermissions();
  }, []);

  // Load specific user data
  const loadUserData = useCallback(async (userId: string) => {
    try {
      setLoadingUserData(true);
      const res = await getUserPermissions(userId);
      if (res?.user) {
        setSelectedUser({
          _id: res.user._id,
          username: res.user.username,
          email: res.user.email,
          roles: res.user.roles,
        } as User);
      }
      const overrides = res?.userPermissions || [];
      setUserOverrides(overrides);
      setOriginalOverrides(overrides);
      setEffectivePermissions(res?.effectivePermissions || []);
    } catch (err) {
      toast.error(getSafeErrorMessage(err, 'Không thể tải quyền của người dùng'));
    } finally {
      setLoadingUserData(false);
    }
  }, []);

  // Handle initialUserId from query params
  useEffect(() => {
    if (initialUserId) {
      loadUserData(initialUserId);
    }
  }, [initialUserId, loadUserData]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchDropdownOpen(false);
    setSearchQuery('');
    onUserChange?.(user._id);
    loadUserData(user._id);
  };

  // Determine role permissions for the selected user
  const userRole = selectedUser?.roles || 'user';
  const roleDefaultPerms = useMemo(() => {
    const defaultList = rolePermissions[userRole] || [];
    // Expand wildcard or manage
    const set = new Set<string>();
    for (const p of defaultList) {
      if (p === '*:*' || p === '*') {
        allPermissionsList.forEach((allP) => set.add(allP));
      } else if (p.endsWith(':*')) {
        const res = p.split(':')[0];
        allPermissionsList
          .filter((allP) => allP.startsWith(`${res}:`))
          .forEach((allP) => set.add(allP));
      } else {
        set.add(p);
      }
    }
    return set;
  }, [rolePermissions, userRole, allPermissionsList]);

  // Compute hasUnsavedChanges
  const hasUnsavedChanges = useMemo(() => {
    if (userOverrides.length !== originalOverrides.length) return true;
    const s1 = new Set(userOverrides);
    return originalOverrides.some((o) => !s1.has(o));
  }, [userOverrides, originalOverrides]);

  // Permission State Resolver for a specific permission:
  // Returns 'role_default' | 'granted' | 'revoked' | 'none'
  const getPermissionState = useCallback(
    (perm: string): 'role_default' | 'granted' | 'revoked' | 'none' => {
      const isRevoked = userOverrides.includes(`-${perm}`);
      if (isRevoked) return 'revoked';

      const isExplicitGranted = userOverrides.includes(perm);
      if (isExplicitGranted) return 'granted';

      const isRoleGranted = roleDefaultPerms.has(perm);
      if (isRoleGranted) return 'role_default';

      return 'none';
    },
    [userOverrides, roleDefaultPerms],
  );

  // Toggle permission cycling:
  // If role_default -> Revoke (-perm) -> Neutral -> Role Default
  // If none -> Grant (perm) -> Revoke (-perm) -> None
  const handleCyclePermission = (perm: string) => {
    const currentState = getPermissionState(perm);
    const isRoleDefault = roleDefaultPerms.has(perm);

    setUserOverrides((prev) => {
      const cleanList = prev.filter((p) => p !== perm && p !== `-${perm}`);

      if (currentState === 'role_default') {
        // From role default -> explicitly revoke
        return [...cleanList, `-${perm}`];
      }
      if (currentState === 'revoked') {
        // From revoked -> back to neutral (if role default, it re-enables; if none, it stays none)
        return cleanList;
      }
      if (currentState === 'granted') {
        // From custom granted -> back to neutral
        return cleanList;
      }
      // From none -> custom grant
      return [...cleanList, perm];
    });
  };

  // Quick Action: Apply Preset
  const handleApplyPreset = (presetPerms: string[], presetName: string) => {
    // Preserve any existing revoked rules if desired, or replace with preset permissions
    setUserOverrides((prev) => {
      // Add all preset perms
      const set = new Set(prev.filter((p) => !p.startsWith('-')));
      presetPerms.forEach((p) => set.add(p));
      return Array.from(set);
    });
    toast.success(`Đã áp dụng cấu hình mẫu: ${presetName}`);
  };

  // Quick Action: Reset to Role Defaults (Clear all overrides)
  const handleResetToRole = () => {
    setUserOverrides([]);
    toast.info('Đã xóa tất cả đặc quyền riêng, đưa về quyền mặc định của vai trò');
  };

  // Quick Action: Select All / Revoke All for a resource
  const handleResourceAction = (resource: string, mode: 'grant_all' | 'revoke_all' | 'clear') => {
    const resourcePerms = Object.values(ACTIONS).map((act) => `${resource}:${act}`);

    setUserOverrides((prev) => {
      let filtered = prev.filter(
        (p) => !resourcePerms.includes(p) && !resourcePerms.includes(p.replace(/^-/, '')),
      );

      if (mode === 'grant_all') {
        filtered = [...filtered, ...resourcePerms];
      } else if (mode === 'revoke_all') {
        filtered = [...filtered, ...resourcePerms.map((p) => `-${p}`)];
      }
      return filtered;
    });
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await updateUserPermissions(selectedUser._id, userOverrides);
      setOriginalOverrides(userOverrides);
      toast.success(`Đã cập nhật quyền hạn cho ${selectedUser.username}`);
      // Reload fresh summary
      await loadUserData(selectedUser._id);
    } catch (err) {
      toast.error(getSafeErrorMessage(err, 'Lưu phân quyền thất bại'));
    } finally {
      setSaving(false);
    }
  };

  // Toggle Collapse Resource
  const toggleResource = (resource: string) => {
    setExpandedResources((prev) => ({
      ...prev,
      [resource]: !prev[resource],
    }));
  };

  // Grouped and filtered resources
  const displayedResources = useMemo(() => {
    return Object.values(RESOURCES).filter((res) =>
      res.toLowerCase().includes(resourceFilter.toLowerCase()),
    );
  }, [resourceFilter]);

  return (
    <div className="space-y-6">
      {/* 1. User Selection & Header Bar */}
      <div className={cn(adminSurfaceClass, 'p-5 space-y-4')}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Phân quyền tài khoản & Ủy quyền nhân sự
            </h3>
            <p className="text-sm text-muted-foreground">
              Tìm kiếm tài khoản người dùng hoặc nhân viên để tùy biến quyền hạn chi tiết.
            </p>
          </div>

          {/* User Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo username hoặc email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchDropdownOpen(true);
              }}
              onFocus={() => setSearchDropdownOpen(true)}
              className={cn(adminFieldSurfaceClass, 'pl-9')}
            />

            {/* Dropdown Results */}
            {searchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-popover p-1 shadow-lg max-h-60 overflow-y-auto">
                {searchingUsers ? (
                  <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <SpinnerLoading size={16} noWrapper /> Đang tìm kiếm...
                  </div>
                ) : userResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Không tìm thấy người dùng phù hợp
                  </div>
                ) : (
                  userResults.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md hover:bg-muted text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{u.username}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {u.roles || 'user'}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected User Details Card */}
        {selectedUser ? (
          <div className={cn(adminInsetPanelClass, 'p-4 flex flex-wrap items-center justify-between gap-4')}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-base">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-base">
                    {selectedUser.username}
                  </span>
                  <Badge
                    className={
                      selectedUser.roles === 'admin'
                        ? 'bg-info/15 text-info border-0'
                        : selectedUser.roles === 'seller'
                          ? 'bg-primary/15 text-primary border-0'
                          : 'bg-muted text-muted-foreground border-0'
                    }
                  >
                    {selectedUser.roles === 'admin'
                      ? 'Quản trị viên'
                      : selectedUser.roles === 'seller'
                        ? 'Người bán hàng'
                        : 'Người dùng'}
                  </Badge>
                  {userOverrides.length > 0 && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Sliders className="h-3 w-3" />
                      {userOverrides.length} đặc quyền tùy chỉnh
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
              </div>
            </div>

            {/* Quick Actions for Selected User */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToRole}
                className={adminSecondaryButtonClass}
                title="Khôi phục quyền mặc định theo vai trò"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Về quyền vai trò gốc
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground border border-dashed border-border rounded-lg">
            <UserIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Chưa chọn tài khoản nào</p>
            <p className="text-xs text-muted-foreground mt-1">
              Vui lòng nhập tên người dùng hoặc email vào ô tìm kiếm ở trên để bắt đầu phân quyền.
            </p>
          </div>
        )}
      </div>

      {/* When a user is selected */}
      {selectedUser && (
        <>
          {/* 2. Staff Templates / Quick Presets */}
          <div className={cn(adminSurfaceClass, 'p-5 space-y-3')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Cấu hình mẫu 1-chạm (Staff Presets)</h4>
              </div>
              <span className="text-xs text-muted-foreground">
                Ủy quyền nhanh theo chức năng phòng ban
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STAFF_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.permissions, preset.name)}
                  className="flex flex-col items-start p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 w-full justify-between mb-1">
                    <span className="text-lg">{preset.icon}</span>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {preset.permissions.length} quyền
                    </Badge>
                  </div>
                  <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {preset.name}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interactive Permissions Matrix */}
          <div className={cn(adminSurfaceClass, 'p-5 space-y-4')}>
            {/* Filter Bar & Legend */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pb-3 border-b border-border">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Lọc tài nguyên (product, order...)"
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground mr-1">Chú giải:</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Kế thừa Role
                </span>
                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[11px] font-medium">
                  <Key className="h-3 w-3" /> Cấp riêng (+)
                </span>
                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-[11px] font-medium">
                  <XCircle className="h-3 w-3" /> Bị cấm (-)
                </span>
              </div>
            </div>

            {loadingUserData ? (
              <div className="py-12 flex justify-center">
                <SpinnerLoading size={28} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedResources.map((resource) => {
                  const isExpanded = expandedResources[resource] !== false; // default expanded
                  const resourcePerms = Object.values(ACTIONS).map(
                    (act) => `${resource}:${act}`,
                  );

                  return (
                    <div
                      key={resource}
                      className={cn(adminInsetPanelClass, 'p-3.5 space-y-3 transition-all')}
                    >
                      {/* Resource Header */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleResource(resource)}
                          className="flex items-center gap-2 font-medium capitalize text-sm hover:text-primary transition-colors text-left"
                        >
                          <span className="font-semibold text-foreground">{resource}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResourceAction(resource, 'grant_all')}
                            className="h-6 px-1.5 text-[11px] text-primary hover:bg-primary/10"
                            title="Cấp toàn bộ quyền cho tài nguyên này"
                          >
                            Cấp hết
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResourceAction(resource, 'revoke_all')}
                            className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
                            title="Chặn toàn bộ quyền cho tài nguyên này"
                          >
                            Cấm hết
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResourceAction(resource, 'clear')}
                            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:bg-muted"
                            title="Xóa override, về mặc định"
                          >
                            Gốc
                          </Button>
                        </div>
                      </div>

                      {/* Action Pills */}
                      {isExpanded && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.values(ACTIONS).map((action) => {
                            const perm = `${resource}:${action}`;
                            const state = getPermissionState(perm);

                            return (
                              <button
                                key={action}
                                type="button"
                                onClick={() => handleCyclePermission(perm)}
                                className={cn(
                                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none border',
                                  state === 'role_default' &&
                                    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20',
                                  state === 'granted' &&
                                    'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300 font-semibold shadow-xs hover:bg-blue-500/25',
                                  state === 'revoked' &&
                                    'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300 line-through hover:bg-rose-500/25',
                                  state === 'none' &&
                                    'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                                )}
                                title={`Click để chuyển đổi trạng thái quyền: ${perm}`}
                              >
                                {state === 'role_default' && <Check className="h-3 w-3 shrink-0" />}
                                {state === 'granted' && <Key className="h-3 w-3 shrink-0" />}
                                {state === 'revoked' && <XCircle className="h-3 w-3 shrink-0" />}
                                <span>{action}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sticky/Bottom Action Save Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-6">
              <div className="flex items-center gap-2 text-xs">
                {hasUnsavedChanges ? (
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    Có thay đổi quyền hạn chưa lưu cho {selectedUser.username}
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Quyền hạn đã đồng bộ với máy chủ
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setUserOverrides(originalOverrides)}
                  disabled={!hasUnsavedChanges || saving}
                  className={cn('flex-1 sm:flex-none', adminSecondaryButtonClass)}
                >
                  Khôi phục
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saving}
                  className={cn('flex-1 sm:flex-none gap-1.5', adminPrimaryButtonClass)}
                >
                  {saving ? (
                    <>
                      <SpinnerLoading size={16} noWrapper /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Lưu phân quyền
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

