'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useResetPassword } from '@/hooks/queries';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { cn } from '@/utils/cn';
import { getSafeErrorMessage } from '@/api';

const resetPasswordSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    code: z
      .string()
      .length(6, 'Mã xác nhận phải có 6 ký tự')
      .regex(/^\d+$/, 'Mã xác nhận chỉ được chứa số'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa chữ hoa, chữ thường và số'),
    confirmPassword: z.string().min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs transition-colors',
        met ? 'text-success' : 'text-muted-foreground/60',
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPassword();

  const emailFromUrl = (searchParams.get('email') ?? '').trim();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isLoading = resetPasswordMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromUrl,
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = useWatch({
    control,
    name: 'newPassword',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      });

      toast.success('Đặt lại mật khẩu thành công!');
      router.replace('/login');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể đặt lại mật khẩu'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Đặt lại mật khẩu</h1>
        <p className="text-sm text-muted-foreground">Tạo mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="name@example.com"
            className="h-11 rounded-lg border-input"
            disabled={isLoading}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Mã xác nhận
          </Label>
          <Input
            {...register('code')}
            id="code"
            placeholder="Nhập mã 6 số"
            maxLength={6}
            inputMode="numeric"
            className="h-11 rounded-lg border-input"
            disabled={isLoading}
          />
          {errors.code ? <p className="text-sm text-destructive">{errors.code.message}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">
            Mật khẩu mới
          </Label>
          <div className="relative">
            <Input
              {...register('newPassword')}
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-11 rounded-lg border-input pr-11"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showNewPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {newPassword ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
              <PasswordRequirement met={newPassword.length >= 8} text="8+ ký tự" />
              <PasswordRequirement met={/[A-Z]/.test(newPassword)} text="Chữ hoa" />
              <PasswordRequirement met={/[a-z]/.test(newPassword)} text="Chữ thường" />
              <PasswordRequirement met={/\d/.test(newPassword)} text="Số" />
            </div>
          ) : null}
          {errors.newPassword ? (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-11 rounded-lg border-input pr-11"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-11 w-full rounded-lg bg-primary text-base font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {isLoading ? <SpinnerLoading noWrapper size={18} className="mr-2 text-primary-foreground" /> : null}
          Đặt lại mật khẩu
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
