import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useLayoutEffect, useEffect } from "react";
import { User as UserIcon, Mail, Shield, Key, CheckCircle, Loader2 } from "lucide-react";
import { User, UpdateUserData, UserRole } from "@/types/user";
import { RESOURCES, ACTIONS } from "@/constants/permissions";
import { getRolePermissions, getUserPermissions } from "@/api/permission";
import { cn } from "@/utils/cn";

interface UpdateModelUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUpdate: (userData: UpdateUserData) => void;
  isLoading?: boolean;
}

export function UpdateModelUser({
  open,
  onOpenChange,
  user,
  onUpdate,
  isLoading = false,
}: UpdateModelUserProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    roles: "user",
    isVerifiedEmail: false,
    permissions: [] as string[],
  });
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  useLayoutEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        roles: user.roles || "user",
        isVerifiedEmail: user.isVerifiedEmail || false,
        permissions: [],
      });
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      if (!open || !user) return;
      setLoadingPerms(true);
      try {
        const [rolePerms, userPerms] = await Promise.all([
          getRolePermissions(),
          getUserPermissions(user._id),
        ]);
        setRolePermissions(rolePerms?.rolePermissions || {});
        setFormData((prev) => ({
          ...prev,
          permissions: userPerms?.userPermissions || [],
        }));
      } catch (error) {
        console.error("Failed to load permissions:", error);
      } finally {
        setLoadingPerms(false);
      }
    };
    loadData();
  }, [open, user]);

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
    if (user) {
      onUpdate({
        ...formData,
        id: user._id,
        roles: formData.roles as UserRole,
        permissions: formData.permissions,
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-3xl border-border/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">Chỉnh sửa người dùng</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Cập nhật tài khoản cho {user.username}
              </DialogDescription>
            </div>
            <Badge className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border-0",
              formData.roles === "admin" 
                ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            )}>
              {formData.roles === "admin" ? "Quản trị viên" : "Người dùng"}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto no-scrollbar max-h-[calc(90vh-200px)]">
            <Tabs defaultValue="info" className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100/80 dark:bg-white/5 p-1">
                  <TabsTrigger value="info" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">
                    <UserIcon className="h-4 w-4" />
                    Thông tin
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10">
                    <Key className="h-4 w-4" />
                    Quyền hạn
                    {formData.permissions.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {formData.permissions.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="info" className="p-6 pt-4 space-y-5">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Tên người dùng
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="rounded-xl border-gray-200 bg-gray-50/50 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 transition-all h-11"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-gray-200 bg-gray-50/50 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 transition-all h-11"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Role & Verification */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roles" className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      Vai trò
                    </Label>
                    <Select
                      value={formData.roles}
                      onValueChange={(value) => setFormData({ ...formData, roles: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 dark:bg-white/5 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50 shadow-lg">
                        <SelectItem value="user">Người dùng</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isVerifiedEmail" className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      Xác minh
                    </Label>
                    <Select
                      value={formData.isVerifiedEmail.toString()}
                      onValueChange={(value) => setFormData({ ...formData, isVerifiedEmail: value === "true" })}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 dark:bg-white/5 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50 shadow-lg">
                        <SelectItem value="true">Đã xác minh</SelectItem>
                        <SelectItem value="false">Chưa xác minh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="p-6 pt-4 space-y-4">
                {loadingPerms ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Role <span className="font-semibold">{formData.roles}</span> có {defaultRolePerms.length} quyền mặc định.
                        <span className="text-blue-500 ml-1">*</span> = quyền từ role
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {Object.values(RESOURCES).map((resource) => (
                        <div key={resource} className="p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Checkbox
                              checked={isAllResourceSelected(resource)}
                              onCheckedChange={(checked) => handleSelectAllResource(resource, checked as boolean)}
                              className="rounded"
                            />
                            <span className="text-sm font-medium capitalize">{resource}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 ml-6">
                            {Object.values(ACTIONS).map((action) => {
                              const perm = `${resource}:${action}`;
                              const isFromRole = defaultRolePerms.includes(perm);
                              const isSelected = formData.permissions.includes(perm);
                              return (
                                <Badge
                                  key={perm}
                                  variant={isSelected ? "default" : "outline"}
                                  className={cn(
                                    "cursor-pointer text-xs transition-all",
                                    isFromRole && !isSelected && "border-blue-300 dark:border-blue-500",
                                    isSelected && "bg-black dark:bg-[#0071e3]"
                                  )}
                                  onClick={() => handleTogglePermission(perm)}
                                >
                                  {action}
                                  {isFromRole && <span className="ml-1 text-blue-400">*</span>}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/50 gap-2 sm:gap-0 bg-transparent">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl border-gray-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-black hover:bg-black/90 text-white dark:bg-[#0071e3] dark:hover:bg-[#0077ED] gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật người dùng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
