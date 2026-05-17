"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useRegister } from "@/hooks/queries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { cn } from "@/utils/cn";
import { getSafeErrorMessage } from "@/api";

const registerSchema = z
  .object({
    username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string()
      .min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors",
        met ? "text-green-600" : "text-gray-400",
      )}
    >
      {met ? (
        <Check className="h-3 w-3" />
      ) : (
        <div className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      <span>{text}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const loading = registerMutation.isPending;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success(
        "Tạo tài khoản thành công! Vui lòng kiểm tra email để lấy mã xác thực.",
      );
      router.push(`/verify-code?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Đăng ký thất bại"));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Tạo tài khoản
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin để tạo tài khoản mới
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Tên người dùng
          </Label>
          <Input
            id="username"
            placeholder="tên người dùng"
            autoComplete="username"
            autoCorrect="off"
            disabled={loading}
            {...form.register("username")}
            className="h-11 rounded-xl border-gray-200 focus:border-[#E53935] focus:ring-[#E53935]/20"
          />
          {form.formState.errors.username ? (
            <p className="text-sm text-red-500">
              {form.formState.errors.username.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={loading}
            {...form.register("email")}
            className="h-11 rounded-xl border-gray-200 focus:border-[#E53935] focus:ring-[#E53935]/20"
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={loading}
              {...form.register("password")}
              className="h-11 rounded-xl border-gray-200 focus:border-[#E53935] focus:ring-[#E53935]/20 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {password ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
              <PasswordRequirement met={password.length >= 6} text="6+ ký tự" />
            </div>
          ) : null}
          {form.formState.errors.password ? (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={loading}
              {...form.register("confirmPassword")}
              className="h-11 rounded-xl border-gray-200 focus:border-[#E53935] focus:ring-[#E53935]/20 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-red-500">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#E53935] hover:bg-[#D32F2F] rounded-full text-base font-medium mt-2"
        >
          {loading ? (
            <SpinnerLoading noWrapper size={18} className="mr-2 text-white" />
          ) : null}
          Tạo tài khoản
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-[#E53935] hover:underline underline-offset-4 font-medium"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
