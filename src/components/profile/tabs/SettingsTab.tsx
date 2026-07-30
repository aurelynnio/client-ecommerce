'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useChangePassword,
  useConfirmTwoFactor,
  useSendTwoFactorCode,
} from '@/hooks/queries/useProfile';
import { useSendVerificationCode } from '@/hooks/queries/useAuth';
import { Shield, Key, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { cn } from '@/utils/cn';
import { getSafeErrorMessage } from '@/api';

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const router = useRouter();
  const changePasswordMutation = useChangePassword();
  const sendVerificationCodeMutation = useSendVerificationCode();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const sendTwoFactorCodeMutation = useSendTwoFactorCode();
  const confirmTwoFactorMutation = useConfirmTwoFactor();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.isTwoFactorEnabled || false);
  const [pendingTwoFactorAction, setPendingTwoFactorAction] = useState<'enable' | 'disable' | null>(
    null,
  );
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setTwoFactorEnabled(user?.isTwoFactorEnabled || false);
  }, [user?.isTwoFactorEnabled]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error('Vui lòng điền đầy đủ các trường');
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
      setIsChangingPassword(false);
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Đổi mật khẩu thành công');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Đổi mật khẩu thất bại'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTwoFactorToggle = async () => {
    if (!user?.isVerifiedEmail) {
      toast.error('Bạn cần xác minh email trước khi bật xác thực 2 yếu tố');
      return;
    }

    const action = twoFactorEnabled ? 'disable' : 'enable';

    try {
      await sendTwoFactorCodeMutation.mutateAsync(action);
      setPendingTwoFactorAction(action);
      setTwoFactorCode('');
      toast.success(
        action === 'enable'
          ? 'Mã xác minh đã được gửi để bật 2FA'
          : 'Mã xác minh đã được gửi để tắt 2FA',
      );
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gửi mã xác thực 2 yếu tố'));
    }
  };

  const handleConfirmTwoFactor = async () => {
    if (!pendingTwoFactorAction) return;

    if (!/^\d{6}$/.test(twoFactorCode.trim())) {
      toast.error('Vui lòng nhập mã gồm 6 chữ số');
      return;
    }

    try {
      const updatedUser = await confirmTwoFactorMutation.mutateAsync({
        action: pendingTwoFactorAction,
        code: twoFactorCode.trim(),
      });
      const enabled = !!updatedUser.isTwoFactorEnabled;
      setTwoFactorEnabled(enabled);
      setPendingTwoFactorAction(null);
      setTwoFactorCode('');
      toast.success(enabled ? 'Đã bật xác thực 2 yếu tố' : 'Đã tắt xác thực 2 yếu tố');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể xác nhận mã 2FA'));
    }
  };

  const handleSendVerificationCode = async () => {
    if (!user?.email) {
      toast.error('Không tìm thấy email để xác minh');
      return;
    }

    try {
      await sendVerificationCodeMutation.mutateAsync({ email: user.email.trim() });
      toast.success('Đã gửi mã xác minh đến email của bạn');
      router.push(`/verify-code?email=${encodeURIComponent(user.email.trim())}`);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gửi mã xác minh email'));
    }
  };

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
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
                  <div className="h-10 w-10 rounded-full bg-info/15 flex items-center justify-center text-info">
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
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Mật khẩu hiện tại
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
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
                        onClick={() => togglePasswordVisibility('current')}
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
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        Mật khẩu mới
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
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
                          onClick={() => togglePasswordVisibility('new')}
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
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Xác nhận mật khẩu
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
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
                          onClick={() => togglePasswordVisibility('confirm')}
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
                  className="mt-2 text-primary-foreground rounded-sm"
                >
                  {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </Button>
              </form>
            </div>

            <div className="bg-muted/20 p-5 rounded-md border border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-200',
                      twoFactorEnabled
                        ? 'bg-success/15 text-success'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base">Xác thực 2 yếu tố</h4>
                    <p className="text-xs text-muted-foreground">
                      Nhận mã xác minh qua email mỗi khi đăng nhập để tăng bảo mật tài khoản.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={() => {
                    void handleTwoFactorToggle();
                  }}
                  disabled={
                    !!pendingTwoFactorAction ||
                    sendTwoFactorCodeMutation.isPending ||
                    confirmTwoFactorMutation.isPending
                  }
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                {twoFactorEnabled ? (
                  <Badge className="bg-success/15 text-success hover:bg-success/15">
                    Đang bật
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-border bg-muted/50 text-muted-foreground">
                    Chưa bật
                  </Badge>
                )}
                {!user?.isVerifiedEmail ? (
                  <span className="text-xs text-warning">
                    Cần xác minh email trước khi sử dụng.
                  </span>
                ) : null}
              </div>
              {pendingTwoFactorAction ? (
                <div className="mt-4 rounded-md border border-border/40 bg-background p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nhập mã xác thực đã gửi tới {user.email}</p>
                    <p className="text-xs text-muted-foreground">Mã có hiệu lực trong 10 phút.</p>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập 6 chữ số"
                      className="sm:max-w-[220px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          void handleConfirmTwoFactor();
                        }}
                        disabled={confirmTwoFactorMutation.isPending}
                        className="text-primary-foreground"
                      >
                        {confirmTwoFactorMutation.isPending
                          ? 'Đang xác nhận...'
                          : pendingTwoFactorAction === 'enable'
                            ? 'Bật 2FA'
                            : 'Tắt 2FA'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={sendTwoFactorCodeMutation.isPending}
                        onClick={() => {
                          if (!pendingTwoFactorAction) return;
                          void sendTwoFactorCodeMutation
                            .mutateAsync(pendingTwoFactorAction)
                            .then(() => {
                              toast.success('Đã gửi lại mã xác thực');
                            })
                            .catch((error: unknown) => {
                              toast.error(
                                getSafeErrorMessage(
                                  error,
                                  'Không thể gửi lại mã xác thực 2 yếu tố',
                                ),
                              );
                            });
                        }}
                      >
                        Gửi lại mã
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPendingTwoFactorAction(null);
                          setTwoFactorCode('');
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-muted/20 p-5 rounded-md border border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-200',
                      user?.isVerifiedEmail
                        ? 'bg-info/15 text-info'
                        : 'bg-warning/15 text-warning',
                    )}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-base">Xác minh Email</h4>
                      {user?.isVerifiedEmail ? (
                        <Badge
                          variant="secondary"
                          className="bg-success/15 text-success hover:bg-success/15 h-5 px-1.5 text-[10px]"
                        >
                          Đã xác minh
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-warning border-warning/30 bg-warning/15 h-5 px-1.5 text-[10px]"
                        >
                          Chưa xác minh
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user?.isVerifiedEmail
                        ? 'Email của bạn đã được xác minh và bảo mật.'
                        : 'Vui lòng xác minh địa chỉ email của bạn.'}
                    </p>
                  </div>
                </div>
                {!user?.isVerifiedEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm"
                    disabled={sendVerificationCodeMutation.isPending}
                    onClick={() => {
                      void handleSendVerificationCode();
                    }}
                  >
                    {sendVerificationCodeMutation.isPending ? 'Đang gửi...' : 'Gửi mã xác minh'}
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
