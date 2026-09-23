'use client';
import { useUploadAvatar, useDeleteAvatar } from '@/hooks/queries/useProfile';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, User, Mail, MapPin, Check, Trash2, Phone, Calendar, Edit3 } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Address, ProfileTabProps } from '@/types/address';
import { getSafeErrorMessage } from '@/api';

export default function ProfileTab({ user, onEditProfile }: ProfileTabProps) {
  const uploadAvatarMutation = useUploadAvatar();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleUploadAvatar = () => {
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.onchange = async () => {
      const selectedFile = file.files?.item(0);
      if (!selectedFile) return;

      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      try {
        await uploadAvatarMutation.mutateAsync(formData);
        toast.success('Cập nhật ảnh đại diện thành công');
      } catch (error: unknown) {
        toast.error(getSafeErrorMessage(error, 'Cập nhật ảnh đại diện thất bại'));
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    file.click();
  };

  const deleteAvatarMutation = useDeleteAvatar();
  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      toast.success('Đã gỡ ảnh đại diện');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gỡ ảnh đại diện'));
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full ring-2 ring-border overflow-hidden transition-transform duration-200 group-hover:scale-105 relative">
            <Image
              src={user.avatar || '/images/placeholder-avatar.svg'}
              alt={user.username}
              fill
              className="object-cover rounded-full"
            />
          </div>
          <Button
            size="icon"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-card bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-200"
            onClick={handleUploadAvatar}
            disabled={isUploadingAvatar}
            aria-label="Đổi ảnh đại diện"
          >
            {isUploadingAvatar ? (
              <SpinnerLoading noWrapper size={16} className="text-primary-foreground" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          {user.avatar && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute bottom-0 left-0 h-8 w-8 rounded-full border-2 border-card"
              onClick={handleDeleteAvatar}
              disabled={deleteAvatarMutation.isPending}
              aria-label="Xóa ảnh đại diện"
            >
              {deleteAvatarMutation.isPending ? (
                <SpinnerLoading noWrapper size={14} />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{user.username}</h2>
          <p className="text-muted-foreground text-sm">
            Thành viên từ năm {new Date(user.createdAt).getFullYear()}
          </p>
          {onEditProfile && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="gap-1.5 rounded-lg text-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Chỉnh sửa thông tin
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-3">
        {user.fullName && (
          <InfoRow
            icon={User}
            label="Họ và tên"
            value={user.fullName}
            sublabel="Họ và tên của bạn"
          />
        )}

        <InfoRow
          icon={User}
          label="Tên người dùng"
          value={user.username}
          sublabel="Tên hiển thị của bạn với người dùng khác"
        />

        {user.phone && (
          <InfoRow
            icon={Phone}
            label="Số điện thoại"
            value={user.phone}
            sublabel="Số điện thoại liên hệ"
          />
        )}

        {user.gender && (
          <InfoRow
            icon={User}
            label="Giới tính"
            value={user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
          />
        )}

        {user.dateOfBirth && (
          <InfoRow
            icon={Calendar}
            label="Ngày sinh"
            value={new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
          />
        )}

        <InfoRow
          icon={Mail}
          label="Địa chỉ Email"
          value={user.email}
          sublabel="Dùng để đăng nhập và nhận thông báo"
          action={
            user.isVerifiedEmail ? (
              <Badge
                variant="secondary"
                className="bg-success/15 text-success hover:bg-success/15 gap-1 px-2 py-0.5 h-5 text-[10px]"
              >
                <Check className="h-3 w-3" />
                Đã xác minh
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-5 px-2">
                Chưa xác minh
              </Badge>
            )
          }
        />

        <InfoRow
          icon={MapPin}
          label="Địa chỉ mặc định"
          value={
            user.addresses && user.addresses.length > 0
              ? `${
                  user.addresses.find((addr: Address) => addr.isDefault)?.district ||
                  user.addresses[0]?.district
                }, ${
                  user.addresses.find((addr: Address) => addr.isDefault)?.city ||
                  user.addresses[0]?.city
                }`
              : 'Chưa thiết lập địa chỉ'
          }
          sublabel={
            user.addresses && user.addresses.length > 0
              ? 'Địa điểm giao hàng chính'
              : 'Thêm địa chỉ để thanh toán nhanh hơn'
          }
        />
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel?: string;
  action?: React.ReactNode;
}

const InfoRow = ({ icon: Icon, label, value, sublabel, action }: InfoRowProps) => (
  <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors duration-200 hover:bg-muted/30">
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">{value}</p>
          {action}
        </div>
        {sublabel && <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  </div>
);
