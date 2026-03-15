"use client";

import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Save, RotateCcw } from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { toast } from "sonner";
import {
  RESOURCES,
  ACTIONS,
} from "@/constants/permissions";
import {
  getUserPermissions,
  updateUserPermissions,
  getAllPermissions,
  getRolePermissions,
} from "@/api/permission";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserPermissionsProps {
  userId: string;
  userRole: string;
  username: string;
  onUpdate?: (permissions: string[]) => void;
}

export default function UserPermissions({
  userId,
  userRole,
  username,
  onUpdate,
}: UserPermissionsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [userPermsRes, allPermsRes, rolePermsRes] = await Promise.all([
        getUserPermissions(userId),
        getAllPermissions(),
        getRolePermissions(),
      ]);

      const userPerms = userPermsRes?.userPermissions || [];
      setUserPermissions(userPerms);
      setOriginalPermissions(userPerms);
      setAllPermissions(allPermsRes?.permissions || []);
      setRolePermissions(rolePermsRes?.rolePermissions?.[userRole] || []);
    } catch (error) {
      toast.error("Không thể tải thông tin quyền");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePermission = (permission: string) => {
    setUserPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSelectAllResource = (resource: string, checked: boolean) => {
    const resourcePermissions = Object.values(ACTIONS).map(
      (action) => `${resource}:${action}`
    );

    if (checked) {
      setUserPermissions((prev) => [
        ...new Set([...prev, ...resourcePermissions]),
      ]);
    } else {
      setUserPermissions((prev) =>
        prev.filter((p) => !resourcePermissions.includes(p))
      );
    }
  };

  const handleReset = () => {
    setUserPermissions(originalPermissions);
  };

  const handleSave = async () => {
    setConfirmOpen(false);
    try {
      setSaving(true);
      await updateUserPermissions(userId, userPermissions);
      setOriginalPermissions(userPermissions);
      toast.success("Cập nhật quyền thành công");
      onUpdate?.(userPermissions);
    } catch (error) {
      toast.error("Không thể cập nhật quyền");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(userPermissions.sort()) !==
    JSON.stringify(originalPermissions.sort());

  const isPermissionFromRole = (permission: string) =>
    rolePermissions.includes(permission);

  const getResourcePermissions = (resource: string) =>
    Object.values(ACTIONS).map((action) => `${resource}:${action}`);

  const isAllResourceSelected = (resource: string) => {
    const resourcePerms = getResourcePermissions(resource);
    return resourcePerms.every((p) => userPermissions.includes(p));
  };

  const isSomeResourceSelected = (resource: string) => {
    const resourcePerms = getResourcePermissions(resource);
    return (
      resourcePerms.some((p) => userPermissions.includes(p)) &&
      !isAllResourceSelected(resource)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SpinnerLoading noWrapper size={32} className="text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Quản lý quyền - {username}</h3>
            <span className="text-sm text-muted-foreground">
              Role: <Badge variant="outline">{userRole}</Badge>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Đặt lại
          </Button>
          <Button
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <SpinnerLoading noWrapper size={16} className="mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Permission Grid */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Tài nguyên</th>
              {Object.values(ACTIONS).map((action) => (
                <th key={action} className="text-center p-3 font-medium w-24">
                  {action}
                </th>
              ))}
              <th className="text-center p-3 font-medium w-24">Tất cả</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(RESOURCES).map((resource) => (
              <tr key={resource} className="border-t">
                <td className="p-3 font-medium capitalize">{resource}</td>
                {Object.values(ACTIONS).map((action) => {
                  const permission = `${resource}:${action}`;
                  const isChecked = userPermissions.includes(permission);
                  const isFromRole = isPermissionFromRole(permission);

                  return (
                    <td key={action} className="text-center p-3">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() =>
                            handleTogglePermission(permission)
                          }
                          className={isFromRole ? "border-primary" : ""}
                        />
                        {isFromRole && (
                          <span className="ml-1 text-xs text-primary">*</span>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="text-center p-3">
                  <Checkbox
                    checked={isAllResourceSelected(resource)}
                    onCheckedChange={(checked) =>
                      handleSelectAllResource(resource, checked as boolean)
                    }
                    className={
                      isSomeResourceSelected(resource) ? "opacity-50" : ""
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="text-primary">*</span> Quyền mặc định từ role
        </span>
        <span>
          Đã chọn: {userPermissions.length} / {allPermissions.length}
        </span>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thay đổi quyền</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn cập nhật quyền cho người dùng {username}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              <strong>Thêm:</strong>{" "}
              {userPermissions
                .filter((p) => !originalPermissions.includes(p))
                .join(", ") || "Không có"}
            </p>
            <p className="text-sm mt-2">
              <strong>Xóa:</strong>{" "}
              {originalPermissions
                .filter((p) => !userPermissions.includes(p))
                .join(", ") || "Không có"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
