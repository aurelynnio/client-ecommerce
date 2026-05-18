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

const sectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500";
const fieldLabelClass =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500";
const fieldSurfaceClass =
  "rounded-2xl border-slate-200 bg-[#fcfaf6] shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)] placeholder:text-slate-400 focus-visible:ring-[#E53935]/15 focus-visible:ring-[3px]";
const helperTextClass = "mt-2 text-xs leading-5 text-slate-400";
const requiredMark = <span className="ml-1 text-[#E53935]">*</span>;

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
                <h2 className={sectionTitleClass}>
                  Thông tin Shop
                </h2>
                <div>
                  <Label htmlFor="name" className={fieldLabelClass}>
                    Tên shop
                    {requiredMark}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên shop"
                    className={`${fieldSurfaceClass} ${errors.name ? "border-red-500 ring-1 ring-red-200" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description" className={fieldLabelClass}>
                    Mô tả shop
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả về shop của bạn"
                    rows={3}
                    className={`${fieldSurfaceClass} resize-none`}
                  />
                  <p className={helperTextClass}>
                    Tóm tắt ngắn về phong cách sản phẩm, dịch vụ hoặc thế mạnh của shop.
                  </p>
                </div>
                {/* Shop Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className={fieldLabelClass}>Logo shop</Label>
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
                    <p className={helperTextClass}>
                      Hình vuông, nền rõ, tối đa 5MB.
                    </p>
                  </div>
                  <div>
                    <Label className={fieldLabelClass}>Banner shop</Label>
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
                    <p className={helperTextClass}>
                      Ảnh ngang dùng cho phần nhận diện shop, tối đa 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="space-y-4">
                <h2 className={`${sectionTitleClass} flex items-center gap-2`}>
                  <MapPin className="h-4 w-4" />
                  Địa chỉ lấy hàng
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className={fieldLabelClass}>
                      Người liên hệ
                      {requiredMark}
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.pickupAddress?.fullName}
                      onChange={(e) =>
                        updatePickupAddress("fullName", e.target.value)
                      }
                      placeholder="Họ tên người gửi"
                      className={`${fieldSurfaceClass} ${errors.fullName ? "border-red-500 ring-1 ring-red-200" : ""}`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className={fieldLabelClass}>
                      Số điện thoại
                      {requiredMark}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.pickupAddress?.phone}
                      onChange={(e) =>
                        updatePickupAddress("phone", e.target.value)
                      }
                      placeholder="0912345678"
                      className={`${fieldSurfaceClass} ${errors.phone ? "border-red-500 ring-1 ring-red-200" : ""}`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className={fieldLabelClass}>
                    Địa chỉ chi tiết
                    {requiredMark}
                  </Label>
                  <Input
                    id="address"
                    value={formData.pickupAddress?.address}
                    onChange={(e) =>
                      updatePickupAddress("address", e.target.value)
                    }
                    placeholder="Số nhà, tên đường"
                    className={`${fieldSurfaceClass} ${errors.address ? "border-red-500 ring-1 ring-red-200" : ""}`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                  <p className={helperTextClass}>
                    Đây là địa chỉ shop dùng để lấy hàng và xử lý vận chuyển.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className={fieldLabelClass}>
                      Tỉnh/Thành
                      {requiredMark}
                    </Label>
                    <Input
                      id="city"
                      value={formData.pickupAddress?.city}
                      onChange={(e) =>
                        updatePickupAddress("city", e.target.value)
                      }
                      placeholder="TP. Hồ Chí Minh"
                      className={`${fieldSurfaceClass} ${errors.city ? "border-red-500 ring-1 ring-red-200" : ""}`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="district" className={fieldLabelClass}>
                      Quận/Huyện
                    </Label>
                    <Input
                      id="district"
                      value={formData.pickupAddress?.district}
                      onChange={(e) =>
                        updatePickupAddress("district", e.target.value)
                      }
                      placeholder="Quận 1"
                      className={fieldSurfaceClass}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ward" className={fieldLabelClass}>
                      Phường/Xã
                    </Label>
                    <Input
                      id="ward"
                      value={formData.pickupAddress?.ward}
                      onChange={(e) =>
                        updatePickupAddress("ward", e.target.value)
                      }
                      placeholder="Phường Bến Nghé"
                      className={fieldSurfaceClass}
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
