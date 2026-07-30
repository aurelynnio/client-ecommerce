'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Store, MapPin, Camera, Save, Upload } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUpdateShop, useUploadShopLogo, useUploadShopBanner } from '@/hooks/queries/useShop';
import { UpdateShopPayload, Shop } from '@/types/shop';
import { getSafeErrorMessage } from '@/api';

interface SettingsFormProps {
  myShop: Shop;
}

export function SettingsForm({ myShop }: SettingsFormProps) {
  const updateShopMutation = useUpdateShop();
  const uploadLogoMutation = useUploadShopLogo();
  const uploadBannerMutation = useUploadShopBanner();

  const [formData, setFormData] = useState<UpdateShopPayload>({
    name: myShop.name || '',
    description: myShop.description || '',
    logo: myShop.logo || '',
    banner: myShop.banner || '',
    pickupAddress: {
      fullName: myShop.pickupAddress?.fullName || '',
      phone: myShop.pickupAddress?.phone || '',
      address: myShop.pickupAddress?.address || '',
      city: myShop.pickupAddress?.city || '',
      district: myShop.pickupAddress?.district || '',
      ward: myShop.pickupAddress?.ward || '',
    },
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateShopMutation.mutateAsync(formData);
      toast.success('Cập nhật shop thành công!');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Cập nhật shop thất bại'));
    }
  };

  const updatePickupAddress = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      pickupAddress: { ...prev.pickupAddress!, [field]: value },
    }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner',
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File ảnh không được vượt quá 5MB');
        return;
      }

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        if (type === 'logo') {
          const result = await uploadLogoMutation.mutateAsync(formDataUpload);
          setFormData((prev) => ({ ...prev, logo: result.logo }));
        } else {
          const result = await uploadBannerMutation.mutateAsync(formDataUpload);
          setFormData((prev) => ({ ...prev, banner: result.banner }));
        }
        toast.success(`Upload ${type === 'logo' ? 'logo' : 'banner'} thành công!`);
      } catch (error: unknown) {
        toast.error(
          getSafeErrorMessage(error, `Upload ${type === 'logo' ? 'logo' : 'banner'} thất bại`),
        );
      }
    }
  };

  const isUploadingLogo = uploadLogoMutation.isPending;
  const isUploadingBanner = uploadBannerMutation.isPending;
  const isUpdating = updateShopMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cài đặt Shop</h1>
          <p className="text-sm text-muted-foreground">Quản lý thông tin và cài đặt shop của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner & Logo */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Banner */}
          <div className="relative h-36 sm:h-48 bg-muted">
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'banner')}
            />
            {formData.banner && (
              <Image src={formData.banner} alt="Banner" fill className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {isUploadingBanner ? (
                <SpinnerLoading size={16} noWrapper className="mr-2" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Đổi ảnh bìa
            </button>
          </div>

          {/* Logo */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
              <div className="relative">
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                />
                <div className="size-24 overflow-hidden rounded-lg border border-border bg-card">
                  {isUploadingLogo ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <SpinnerLoading size={24} className="text-primary" />
                    </div>
                  ) : formData.logo ? (
                    <Image
                      src={formData.logo}
                      alt="Logo"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="pb-2">
                <h2 className="font-semibold text-foreground">{formData.name}</h2>
                <p className="text-sm text-muted-foreground">Chọn ảnh để thay đổi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Thông tin cơ bản</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">
                Tên Shop
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5 h-11 bg-card"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-foreground">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1.5 resize-none bg-card"
                placeholder="Giới thiệu về shop của bạn..."
              />
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Địa chỉ lấy hàng</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Họ tên người gửi</Label>
                <Input
                  value={formData.pickupAddress?.fullName || ''}
                  onChange={(e) => updatePickupAddress('fullName', e.target.value)}
                  className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                />
              </div>
              <div>
                <Label className="text-foreground">Số điện thoại</Label>
                <Input
                  value={formData.pickupAddress?.phone || ''}
                  onChange={(e) => updatePickupAddress('phone', e.target.value)}
                  className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Địa chỉ chi tiết</Label>
              <Input
                value={formData.pickupAddress?.address || ''}
                onChange={(e) => updatePickupAddress('address', e.target.value)}
                className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                placeholder="Số nhà, tên đường..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-foreground">Tỉnh/Thành phố</Label>
                <Input
                  value={formData.pickupAddress?.city || ''}
                  onChange={(e) => updatePickupAddress('city', e.target.value)}
                  className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                />
              </div>
              <div>
                <Label className="text-foreground">Quận/Huyện</Label>
                <Input
                  value={formData.pickupAddress?.district || ''}
                  onChange={(e) => updatePickupAddress('district', e.target.value)}
                  className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                />
              </div>
              <div>
                <Label className="text-foreground">Phường/Xã</Label>
                <Input
                  value={formData.pickupAddress?.ward || ''}
                  onChange={(e) => updatePickupAddress('ward', e.target.value)}
                  className="mt-1.5 h-11 rounded-xl border-0 bg-card"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row sm:justify-end">
          <Button type="submit" disabled={isUpdating} className="h-11 w-full px-6 sm:w-auto">
            {isUpdating ? (
              <>
                <SpinnerLoading size={20} noWrapper className="mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
