'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useForgotPassword } from '@/hooks/queries';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { getSafeErrorMessage } from '@/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
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
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      toast.success('Mã xác nhận đã được gửi đến email của bạn');
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gửi mã xác nhận'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quên mật khẩu</h1>
        <p className="text-sm text-muted-foreground">Nhập email để nhận mã xác nhận</p>
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

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-11 w-full rounded-lg bg-primary text-base font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {isLoading ? <SpinnerLoading noWrapper size={18} className="mr-2 text-primary-foreground" /> : null}
          Gửi mã xác nhận
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
