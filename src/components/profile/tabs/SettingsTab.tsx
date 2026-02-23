"use client";
import { useState } from "react";
import { useChangePassword } from "@/hooks/queries/useProfile";
import { Shield, Key, Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User } from "@/types/user";
import { cn } from "@/utils/cn";
import { getSafeErrorMessage } from "@/api";

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const changePasswordMutation = useChangePassword();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.isTwoFactorEnabled || false,
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Vui lòng điền đầy đủ các trường");
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      setIsChangingPassword(false);
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Đổi mật khẩu thành công");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Đổi mật khẩu thất bại"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const SectionHeader = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div className="mb-4">
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Cài đặt</h2>
        <p className="text-muted-foreground text-sm">
          Quản lý các tùy chọn tài khoản và bảo mật của bạn.
        </p>
      </div>

      <div className="space-y-8">
        {/* Account Security */}
        <div>
          <SectionHeader
            title="Đăng nhập & Bảo mật"
            description="Quản lý mật khẩu và các tùy chọn bảo mật"
          />

          <div className="space-y-4">
            <div className="bg-muted/20 p-5 rounded-md border border-border/30">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base">Đổi mật khẩu</h4>
                    <p className="text-xs text-muted-foreground">
                      Đảm bảo tài khoản của bạn đang sử dụng mật khẩu dài và ngẫu nhiên.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-sm font-medium"
                    >
                      Mật khẩu hiện tại
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="pr-10 rounded-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-medium"
                      >
                        Mật khẩu mới
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="pr-10 rounded-sm"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium"
                      >
                        Xác nhận mật khẩu
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="pr-10 rounded-sm"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="mt-2 text-white rounded-sm"
                >
                  {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </Button>
              </form>
            </div>

            <div className="bg-muted/20 p-5 rounded-md border border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-200",
                      twoFactorEnabled
                        ? "bg-green-50 text-green-600"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base">
                      Xác thực 2 yếu tố
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Tính năng đang được phát triển và sẽ sớm khả dụng.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                  disabled
                />
              </div>
            </div>

            <div className="bg-muted/20 p-5 rounded-md border border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-200",
                      user?.isVerifiedEmail
                        ? "bg-blue-50 text-blue-600"
                        : "bg-amber-50 text-amber-600",
                    )}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-base">
                        Xác minh Email
                      </h4>
                      {user?.isVerifiedEmail ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 hover:bg-green-100 h-5 px-1.5 text-[10px]"
                        >
                          Đã xác minh
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-200 bg-amber-50 h-5 px-1.5 text-[10px]"
                        >
                          Chưa xác minh
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user?.isVerifiedEmail
                        ? "Email của bạn đã được xác minh và bảo mật."
                        : "Vui lòng xác minh địa chỉ email của bạn."}
                    </p>
                  </div>
                </div>
                {!user?.isVerifiedEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm"
                    disabled
                  >
                    Sắp hỗ trợ
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
