"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Store, Upload, MapPin } from "lucide-react";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/hooks";
import {
  useMyShop,
  useRegisterShop,
  useUploadShopLogo,
  useUploadShopBanner,
} from "@/hooks/queries/useShop";
import { useRefreshAuthSession } from "@/hooks/queries";
import { CreateShopPayload } from "@/types/shop";
import { getSafeErrorMessage } from "@/api";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { data: myShop, isLoading } = useMyShop();
  const registerShopMutation = useRegisterShop();
  const uploadLogoMutation = useUploadShopLogo();
  const uploadBannerMutation = useUploadShopBanner();
  const refreshSessionMutation = useRefreshAuthSession();
  const { isAuthenticated, data } = useAppSelector((state) => state.auth);

  const isRegistering = registerShopMutation.isPending;
  const isUploadingLogo = uploadLogoMutation.isPending;
  const isUploadingBanner = uploadBannerMutation.isPending;

  // Check if user has seller or admin role (can have a shop)
  const roles = data?.roles;
  const canHaveShop =
    roles === "seller" ||
    roles === "admin" ||
    (Array.isArray(roles) &&
      (roles.includes("seller") || roles.includes("admin")));

  const [formData, setFormData] = useState<CreateShopPayload>({
    name: "",
    description: "",
    logo: "",
    banner: "",
    pickupAddress: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      ward: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Redirect if user already has a shop
  useEffect(() => {
    if (!isAuthenticated || !data) return;

    if (myShop) {
      toast.info("Bạn đã có shop, chuyển đến trang quản lý");
      router.replace("/seller/settings");
    }
  }, [data, isAuthenticated, myShop, router]);

  // Also redirect if user is seller/admin (they likely have a shop)
  useEffect(() => {
    if (!isAuthenticated || !data) return;
    if (canHaveShop && !isLoading) {
      const timer = setTimeout(() => {
        if (canHaveShop && !myShop) {
          // User is seller/admin but myShop not loaded - redirect anyway
          router.replace("/seller/settings");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [canHaveShop, data, isAuthenticated, isLoading, myShop, router]);

  if (!isAuthenticated) return null;
  if (!data) return <SpinnerLoading fullPage />;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên shop là bắt buộc";
    } else if (formData.name.length < 3) {
      newErrors.name = "Tên shop phải có ít nhất 3 ký tự";
    }
    if (!formData.pickupAddress?.fullName?.trim()) {
      newErrors.fullName = "Họ tên người nhận là bắt buộc";
    }
    if (!formData.pickupAddress?.phone?.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.pickupAddress.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!formData.pickupAddress?.address?.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }
    if (!formData.pickupAddress?.city?.trim()) {
      newErrors.city = "Tỉnh/Thành phố là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng ký bán hàng");
      router.push("/login");
      return;
    }
    if (!validateForm()) return;

    try {
      await registerShopMutation.mutateAsync(formData);
      try {
        await refreshSessionMutation.mutateAsync();
      } catch {
        toast.warning(
          "Đăng ký shop thành công, vui lòng tải lại để cập nhật quyền"
        );
      }
      toast.success("Đăng ký shop thành công!");
      router.push("/seller/settings");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Đăng ký shop thất bại"));
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
    type: "logo" | "banner",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File ảnh không được vượt quá 5MB");
        return;
      }

      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        if (type === "logo") {
          const result = await uploadLogoMutation.mutateAsync(formDataUpload);
          setFormData((prev) => ({ ...prev, logo: result.logo }));
        } else {
          const result = await uploadBannerMutation.mutateAsync(formDataUpload);
          setFormData((prev) => ({ ...prev, banner: result.banner }));
        }
        toast.success(
          `Upload ${type === "logo" ? "logo" : "banner"} thành công!`,
        );
      } catch (error: unknown) {
        toast.error(
          getSafeErrorMessage(error, `Upload ${type === "logo" ? "logo" : "banner"} thất bại`),
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 -mt-4 -mx-4 px-4">
      <div className="max-w-[600px] mx-auto">
        {/* Loading state while checking shop (only for sellers/admins) */}
        {canHaveShop && isLoading ? (
          <div className="bg-white rounded border border-[#f0f0f0] p-12 flex flex-col items-center justify-center">
            <SpinnerLoading size={32} className="mb-4" />
            <p className="text-gray-500">Đang kiểm tra thông tin...</p>
          </div>
        ) : (
          <div className="bg-white rounded border border-[#f0f0f0] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center">
                <Store className="h-6 w-6 text-[#E53935]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Đăng ký bán hàng
                </h1>
                <p className="text-sm text-gray-500">
                  Tạo shop của bạn trên nền tảng
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Info */}
              <div className="space-y-4">
                <h2 className="font-medium text-gray-800 border-b pb-2">
                  Thông tin Shop
                </h2>
                <div>
                  <Label htmlFor="name">Tên Shop *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên shop"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Mô tả Shop</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả về shop của bạn"
                    rows={3}
                  />
                </div>
                {/* Shop Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Logo Shop</Label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logo")}
                    />
                    <div
                      className="mt-2 relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#E53935] transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {isUploadingLogo ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <SpinnerLoading size={20} />
                        </div>
                      ) : formData.logo ? (
                        <Image
                          src={formData.logo}
                          alt="Logo"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Upload className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Click để upload
                    </p>
                  </div>
                  <div>
                    <Label>Banner Shop</Label>
                    <input
                      type="file"
                      ref={bannerInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "banner")}
                    />
                    <div
                      className="mt-2 relative w-full h-20 rounded overflow-hidden border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#E53935] transition-colors"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      {isUploadingBanner ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <SpinnerLoading size={20} />
                        </div>
                      ) : formData.banner ? (
                        <Image
                          src={formData.banner}
                          alt="Banner"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Upload className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Click để upload
                    </p>
                  </div>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="space-y-4">
                <h2 className="font-medium text-gray-800 border-b pb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ lấy hàng
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Họ tên *</Label>
                    <Input
                      id="fullName"
                      value={formData.pickupAddress?.fullName}
                      onChange={(e) =>
                        updatePickupAddress("fullName", e.target.value)
                      }
                      placeholder="Họ tên người gửi"
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={formData.pickupAddress?.phone}
                      onChange={(e) =>
                        updatePickupAddress("phone", e.target.value)
                      }
                      placeholder="0912345678"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ *</Label>
                  <Input
                    id="address"
                    value={formData.pickupAddress?.address}
                    onChange={(e) =>
                      updatePickupAddress("address", e.target.value)
                    }
                    placeholder="Số nhà, tên đường"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Tỉnh/Thành *</Label>
                    <Input
                      id="city"
                      value={formData.pickupAddress?.city}
                      onChange={(e) =>
                        updatePickupAddress("city", e.target.value)
                      }
                      placeholder="TP. Hồ Chí Minh"
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <Input
                      id="district"
                      value={formData.pickupAddress?.district}
                      onChange={(e) =>
                        updatePickupAddress("district", e.target.value)
                      }
                      placeholder="Quận 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ward">Phường/Xã</Label>
                    <Input
                      id="ward"
                      value={formData.pickupAddress?.ward}
                      onChange={(e) =>
                        updatePickupAddress("ward", e.target.value)
                      }
                      placeholder="Phường Bến Nghé"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-[#E53935] hover:bg-[#D32F2F]"
              >
                {isRegistering ? (
                  <>
                    <SpinnerLoading size={16} noWrapper className="mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng ký bán hàng"
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
