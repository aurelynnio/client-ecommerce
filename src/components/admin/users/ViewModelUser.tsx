import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Edit,
  Shield,
  Key,
  Phone,
} from 'lucide-react';
import { User } from '@/types/user';
import Image from 'next/image';
import UserPermissions from './UserPermissions';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format';
import {
  adminDialogContentClass,
  adminDialogFooterClass,
  adminInsetPanelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '@/components/admin/shared/AdminPrimitives';

interface ViewModelUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit?: (user: User) => void;
}

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export function ViewModelUser({ open, onOpenChange, user, onEdit }: ViewModelUserProps) {
  if (!user) return null;

  const statusConfig = {
    verified: {
      bg: 'bg-success/15',
      text: 'text-success',
      label: 'Đã xác minh',
    },
    unverified: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      label: 'Chưa xác minh',
    },
  };

  const roleConfig: Record<string, { bg: string; text: string }> = {
    admin: {
      bg: 'bg-info/15',
      text: 'text-info',
    },
    user: { bg: 'bg-info/15', text: 'text-info' },
    moderator: {
      bg: 'bg-warning/15',
      text: 'text-warning',
    },
  };

  const getStatus = () => (user.isVerifiedEmail ? statusConfig.verified : statusConfig.unverified);
  const getRoleStyle = () => roleConfig[user.roles] || roleConfig.user;
  const status = getStatus();
  const roleStyle = getRoleStyle();

  const handleEdit = () => {
    if (onEdit && user) {
      onOpenChange(false);
      onEdit(user);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(adminDialogContentClass, 'sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh]')}
      >
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Hồ sơ người dùng
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Thông tin chi tiết về {user.username}
              </DialogDescription>
            </div>
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border border-transparent',
                status.bg,
                status.text,
              )}
            >
              {status.label}
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto no-scrollbar max-h-[calc(90vh-180px)]">
          <Tabs defaultValue="profile" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <UserIcon className="h-4 w-4" />
                  Hồ sơ
                </TabsTrigger>
                <TabsTrigger
                  value="permissions"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground"
                >
                  <Key className="h-4 w-4" />
                  Quyền hạn
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="p-6 pt-4 space-y-6">
              {/* User Avatar & Basic Info */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-border/50 bg-muted flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {user.username}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={cn(
                        'px-2.5 py-0.5 rounded-lg text-xs font-medium',
                        roleStyle.bg,
                        roleStyle.text,
                      )}
                    >
                      {user.roles === 'admin'
                        ? 'Quản trị viên'
                        : user.roles === 'user'
                          ? 'Người dùng'
                          : user.roles}
                    </div>
                    {user.isVerifiedEmail ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(adminInsetPanelClass, 'p-4 space-y-2')}>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Ngày tham gia
                  </div>
                  <div className="text-sm font-semibold">
                    {formatDate(user.createdAt, LONG_DATE_OPTIONS)}
                  </div>
                </div>
                <div className={cn(adminInsetPanelClass, 'p-4 space-y-2')}>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Vai trò
                  </div>
                  <div className="text-sm font-semibold capitalize">
                    {user.roles === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Địa chỉ
                </h4>
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {user.addresses.map((addr, index) => (
                      <div key={index} className={cn(adminInsetPanelClass, 'p-4')}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-foreground">
                            {addr.fullName}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            <Phone className="h-3 w-3" />
                            {addr.phone}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-border/50 text-center bg-muted/30">
                    <MapPin className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Chưa đăng ký địa chỉ</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="p-6 pt-4">
              <UserPermissions
                userId={user._id}
                userRole={user.roles || 'user'}
                username={user.username}
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className={cn(adminDialogFooterClass, 'px-6 pb-6')}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={cn('sm:min-w-28', adminSecondaryButtonClass)}
          >
            Đóng
          </Button>
          {onEdit && (
            <Button
              onClick={handleEdit}
              className={cn('gap-2 sm:min-w-40', adminPrimaryButtonClass)}
            >
              <Edit className="h-4 w-4" />
              Sửa người dùng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
