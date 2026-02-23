import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { RESOURCES, ACTIONS } from "@/constants/permissions";
import { getRolePermissions } from "@/api/permission";
import { UserRole } from "@/types/user";
import { CreateUserData } from "@/hooks/queries/useProfile";

interface CreateModelUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (userData: CreateUserData) => void;
  isLoading?: boolean;
}

export function CreateModelUser({
  open,
  onOpenChange,
  onCreate,
  isLoading = false,
}: CreateModelUserProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    roles: "user",
    isVerifiedEmail: false,
    password: "",
    permissions: [] as string[],
  });
  const [showPermissions, setShowPermissions] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  // Load role permissions on mount
  useEffect(() => {
    const loadRolePermissions = async () => {
      try {
        const perms = await getRolePermissions();
        setRolePermissions(perms?.rolePermissions || {});
      } catch (error) {
        console.error("Failed to load role permissions:", error);
      }
    };
    if (open) {
      loadRolePermissions();
    }
  }, [open]);

  // Get default permissions for selected role
  const defaultRolePerms = rolePermissions[formData.roles] || [];

  const handleTogglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSelectAllResource = (resource: string, checked: boolean) => {
    const resourcePermissions = Object.values(ACTIONS).map(
      (action) => `${resource}:${action}`
    );
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...resourcePermissions])],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !resourcePermissions.includes(p)),
      }));
    }
  };

  const isAllResourceSelected = (resource: string) => {
    const resourcePerms = Object.values(ACTIONS).map((action) => `${resource}:${action}`);
    return resourcePerms.every((p) => formData.permissions.includes(p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      roles: formData.roles as UserRole,
      permissions: formData.permissions.length > 0 ? formData.permissions : undefined,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      username: "",
      email: "",
      phone: "",
      roles: "user",
      isVerifiedEmail: false,
      password: "",
      permissions: [],
    });
    setShowPermissions(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="rounded-[2rem] border-border/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl p-6 max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader className="border-b border-border/50 pb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight">Thêm người dùng mới</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Nhập thông tin người dùng mới bên dưới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-6">
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                Họ và tên
                </Label>
                <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                }
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                required
                disabled={isLoading}
                placeholder="Nhập họ và tên"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                Email
                </Label>
                <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                }
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                required
                disabled={isLoading}
                placeholder="Nhập địa chỉ email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                Số điện thoại
                </Label>
                <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                }
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                required
                disabled={isLoading}
                placeholder="Nhập số điện thoại"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
                </Label>
                <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                }
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                required
                disabled={isLoading}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                minLength={6}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="roles" className="text-sm font-medium">
                    Vai trò
                    </Label>
                    <Select
                    value={formData.roles}
                    onValueChange={(value) =>
                        setFormData({ ...formData, roles: value })
                    }
                    disabled={isLoading}
                    >
                    <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:ring-0 shadow-sm h-10">
                        <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-lg">
                        <SelectItem value="user">Người dùng</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="isVerifiedEmail" className="text-sm font-medium">
                    Xác minh
                    </Label>
                    <Select
                    value={formData.isVerifiedEmail.toString()}
                    onValueChange={(value) =>
                        setFormData({ ...formData, isVerifiedEmail: value === "true" })
                    }
                    disabled={isLoading}
                    >
                    <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:ring-0 shadow-sm h-10">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-lg">
                        <SelectItem value="true">Đã xác minh</SelectItem>
                        <SelectItem value="false">Chưa xác minh</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPermissions(!showPermissions)}
                className="w-full justify-between rounded-xl border-gray-200 h-10"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permissions bổ sung
                  {formData.permissions.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {formData.permissions.length}
                    </Badge>
                  )}
                </span>
                {showPermissions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showPermissions && (
                <div className="border rounded-xl p-3 max-h-[200px] overflow-y-auto space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Role <Badge variant="outline">{formData.roles}</Badge> đã có {defaultRolePerms.length} quyền mặc định.
                    Chọn thêm quyền bổ sung bên dưới:
                  </p>
                  {Object.values(RESOURCES).map((resource) => (
                    <div key={resource} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isAllResourceSelected(resource)}
                          onCheckedChange={(checked) =>
                            handleSelectAllResource(resource, checked as boolean)
                          }
                        />
                        <span className="text-sm font-medium capitalize">{resource}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-6">
                        {Object.values(ACTIONS).map((action) => {
                          const perm = `${resource}:${action}`;
                          const isFromRole = defaultRolePerms.includes(perm);
                          return (
                            <Badge
                              key={perm}
                              variant={formData.permissions.includes(perm) ? "default" : "outline"}
                              className={`cursor-pointer text-xs ${isFromRole ? "border-primary" : ""}`}
                              onClick={() => handleTogglePermission(perm)}
                            >
                              {action}
                              {isFromRole && <span className="ml-1 text-primary">*</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl h-10 px-5 border-gray-200"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-10 px-6 bg-black text-white hover:bg-black/90 dark:bg-[#0071e3] shadow-sm flex items-center gap-2"
              disabled={isLoading}
            >
               {isLoading ? "Đang tạo..." : (
                   <>
                    <Plus className="h-4 w-4" />
                    Tạo người dùng
                   </>
               )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
