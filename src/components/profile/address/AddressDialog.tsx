'use client';
import { useState, useEffect } from 'react';
import { useCreateAddress, useUpdateAddress } from '@/hooks/queries/useProfile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AddressDialogProps, AddressFormData } from '@/types/address';
import { MapPin, Navigation, Home } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { getSafeErrorMessage } from '@/api';

export default function AddressDialog({
  open,
  onClose,
  editingAddress,
  onSuccess,
  user,
}: AddressDialogProps) {
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();

  const [addressForm, setAddressForm] = useState<AddressFormData>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    isDefault: false,
  });

  const isSubmitting = createAddressMutation.isPending || updateAddressMutation.isPending;
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setAddressForm({
        fullName: editingAddress.fullName || '',
        phone: editingAddress.phone || '',
        address: editingAddress.address || '',
        city: editingAddress.city || '',
        district: editingAddress.district || '',
        ward: editingAddress.ward || '',
        isDefault: editingAddress.isDefault || false,
      });
    } else {
      setAddressForm({
        fullName: user?.username || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        district: '',
        ward: '',
        isDefault: (user?.addresses?.length || 0) === 0,
      });
    }
  }, [editingAddress, user, open]);

  // Hàm phân tích địa chỉ và điền vào các trường phù hợp
  const parseAndFillAddress = (fullAddress: string) => {
    const address = fullAddress.replace(/,\s*Việt Nam$/, '').replace(/,\s*Vietnam$/i, '');

    // Mẫu regex để phân tích địa chỉ Việt Nam
    const patterns = [
      // Pattern cho địa chỉ dạng: Ấp X, Xã Y, Huyện Z, Thành phố/Tỉnh ABC
      /(.*?),\s*(Phường|Xã|Thị trấn)\s*(.*?),\s*(Quận|Huyện|Thị xã|Thành phố)\s*(.*?),\s*(Tỉnh|Thành phố)\s*(.*)/,
      // Pattern cho địa chỉ dạng: Số nhà, Đường, Phường, Quận, Thành phố
      /(.*?),\s*(Phường|Xã)\s*(.*?),\s*(Quận|Huyện)\s*(.*?),\s*(.*)/,
      // Pattern đơn giản hơn
      /(.*?),\s*(.*?),\s*(.*?),\s*(.*)/,
    ];

    let city = '';
    let district = '';
    let ward = '';
    let detailedAddress = address;

    for (const pattern of patterns) {
      const match = address.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          // Pattern chi tiết
          detailedAddress = match[1].trim();
          ward = `${match[2]} ${match[3]}`.trim();
          district = `${match[4]} ${match[5]}`.trim();
          city = `${match[6]} ${match[7]}`.trim();
        } else if (pattern === patterns[1]) {
          // Pattern trung bình
          detailedAddress = match[1].trim();
          ward = `${match[2]} ${match[3]}`.trim();
          district = `${match[4]} ${match[5]}`.trim();
          city = match[6].trim();
        } else {
          // Pattern đơn giản - chia thành 4 phần
          const parts = address.split(',').map((part) => part.trim());
          if (parts.length >= 4) {
            detailedAddress = parts.slice(0, parts.length - 3).join(', ');
            ward = parts[parts.length - 3];
            district = parts[parts.length - 2];
            city = parts[parts.length - 1];
          }
        }
        break;
      }
    }

    // Nếu không phân tích được bằng regex, thử phân tích thủ công
    if (!city) {
      const parts = address.split(',').map((part) => part.trim());

      if (parts.length > 0) {
        // Phần cuối cùng thường là thành phố/tỉnh
        city = parts[parts.length - 1];

        if (parts.length > 1) {
          // Phần trước đó thường là quận/huyện
          district = parts[parts.length - 2];
        }

        if (parts.length > 2) {
          // Phần trước nữa thường là phường/xã
          ward = parts[parts.length - 3];
        }

        // Phần còn lại là địa chỉ chi tiết
        detailedAddress = parts.slice(0, Math.max(0, parts.length - 3)).join(', ');
      }
    }

    // Chuẩn hóa tên thành phố
    if (city.includes('Hồ Chí Minh') || city.includes('TP.HCM') || city.includes('TP HCM')) {
      city = 'Thành phố Hồ Chí Minh';
    } else if (city.includes('Hà Nội')) {
      city = 'Thành phố Hà Nội';
    } else if (city.includes('Đà Nẵng')) {
      city = 'Thành phố Đà Nẵng';
    }

    return {
      detailedAddress: detailedAddress || address,
      city,
      district,
      ward,
    };
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị');
      return;
    }

    if (locationPermissionDenied) {
      toast.info('Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt');
      return;
    }

    setIsGettingLocation(true);
    setLocationPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=vi`,
          );

          if (!response.ok) {
            throw new Error('Không thể lấy thông tin địa chỉ');
          }

          const data = await response.json();

          if (data && data.display_name) {
            const fullAddress = data.display_name;
            const parsedAddress = parseAndFillAddress(fullAddress);

            setAddressForm((prev) => ({
              ...prev,
              address: parsedAddress.detailedAddress,
              city: parsedAddress.city,
              district: parsedAddress.district,
              ward: parsedAddress.ward,
            }));

            toast.success('Đã cập nhật vị trí');
          } else {
            toast.error('Không tìm thấy thông tin địa chỉ cho vị trí này');
          }
        } catch (error: unknown) {
          console.error('Error fetching address:', error);
          toast.error(getSafeErrorMessage(error, 'Không thể lấy địa chỉ từ vị trí hiện tại'));
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermissionDenied(true);
            toast.error('Bạn đã từ chối quyền truy cập vị trí');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Thông tin vị trí không khả dụng');
            break;
          case error.TIMEOUT:
            toast.error('Yêu cầu vị trí quá thời gian');
            break;
          default:
            toast.error('Không thể lấy vị trí hiện tại');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CHỈ VALIDATE CÁC TRƯỜNG TỐI THIỂU
    if (!addressForm.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }

    try {
      const addressDataToSend = {
        fullName: addressForm.fullName.trim() || 'Khách hàng',
        phone: addressForm.phone.trim() || 'Chưa cập nhật',
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        district: addressForm.district.trim(),
        ward: addressForm.ward.trim(),
        isDefault: addressForm.isDefault,
      };

      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          addressId: editingAddress._id,
          ...addressDataToSend,
        });
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await createAddressMutation.mutateAsync(addressDataToSend);
        toast.success('Thêm địa chỉ thành công');
      }

      onClose();
      onSuccess();
    } catch (error: unknown) {
      console.error('Address operation error:', error);
      const errorMessage = getSafeErrorMessage(error, 'Đã xảy ra lỗi');
      toast.error(
        `${
          editingAddress ? 'Cập nhật địa chỉ thất bại' : 'Thêm địa chỉ thất bại'
        }: ${errorMessage}`,
      );
    }
  };

  const handleClose = () => {
    onClose();
    setLocationPermissionDenied(false);
    setTimeout(() => {
      setAddressForm({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        isDefault: false,
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </DialogTitle>
          <DialogDescription>Điền thông tin giao hàng của bạn bên dưới.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="0123 456 789"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Chi tiết địa chỉ
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="h-8 text-xs text-info hover:text-info hover:bg-info/15"
              >
                {isGettingLocation ? (
                  <SpinnerLoading size={14} noWrapper className="mr-1.5" />
                ) : (
                  <Navigation className="h-3.5 w-3.5 mr-1.5" />
                )}
                Dùng vị trí hiện tại
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Địa chỉ cụ thể <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                placeholder="Số nhà, tên đường"
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Tỉnh/Thành phố</Label>
                <Input
                  id="city"
                  placeholder="Tỉnh/Thành phố"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  placeholder="Quận/Huyện"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã</Label>
                <Input
                  id="ward"
                  placeholder="Phường/Xã"
                  value={addressForm.ward}
                  onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center">
                <Home className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label htmlFor="isDefault" className="font-medium cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </Label>
                <p className="text-xs text-muted-foreground">Địa chỉ này sẽ được chọn mặc định</p>
              </div>
            </div>
            <Switch
              id="isDefault"
              checked={addressForm.isDefault}
              onCheckedChange={(checked) => setAddressForm({ ...addressForm, isDefault: checked })}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
