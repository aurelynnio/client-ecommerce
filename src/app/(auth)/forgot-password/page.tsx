"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useForgotPassword } from "@/hooks/queries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { getSafeErrorMessage } from "@/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();
  const isLoading = forgotPasswordMutation.isPending;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      toast.success("Mã xác nhận đã được gửi đến email của bạn");
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Không thể gửi mã xác nhận"));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Quên mật khẩu
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập email để nhận mã xác nhận
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder="name@example.com"
            className="h-11 rounded-xl border-gray-200 focus:border-[#E53935] focus:ring-[#E53935]/20"
            disabled={isLoading}
          />
          {errors.email ? (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-[#E53935] hover:bg-[#D32F2F] rounded-full text-base font-medium mt-2"
        >
          {isLoading ? (
            <SpinnerLoading noWrapper size={18} className="mr-2 text-white" />
          ) : null}
          Gửi mã xác nhận
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[#E53935] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
