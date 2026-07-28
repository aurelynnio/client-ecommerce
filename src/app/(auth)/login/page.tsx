'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAppSelector } from '@/hooks/hooks';
import { useLogin, useResendLoginTwoFactorCode, useVerifyLoginTwoFactor } from '@/hooks/queries';
import { TwoFactorLoginChallenge } from '@/types/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { getSafeErrorMessage } from '@/api';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorLoginChallenge | null>(
    null,
  );
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const loginMutation = useLogin();
  const verifyTwoFactorMutation = useVerifyLoginTwoFactor();
  const resendTwoFactorCodeMutation = useResendLoginTwoFactorCode();
  const loading =
    loginMutation.isPending ||
    verifyTwoFactorMutation.isPending ||
    resendTwoFactorCodeMutation.isPending;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync(data);

      if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
        setTwoFactorChallenge(result);
        setTwoFactorCode('');
        toast.success('Mã xác thực 2 yếu tố đã được gửi tới email của bạn');
        return;
      }

      toast.success('Chào mừng bạn trở lại!');
      router.replace('/');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Đăng nhập thất bại'));
    }
  };

  const handleVerifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!twoFactorChallenge) return;
    if (!/^\d{6}$/.test(twoFactorCode.trim())) {
      toast.error('Vui lòng nhập mã gồm 6 chữ số');
      return;
    }

    try {
      await verifyTwoFactorMutation.mutateAsync({
        challengeToken: twoFactorChallenge.challengeToken,
        code: twoFactorCode.trim(),
      });
      toast.success('Xác thực thành công');
      router.replace('/');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Xác thực 2 yếu tố thất bại'));
    }
  };

  const handleResendTwoFactorCode = async () => {
    if (!twoFactorChallenge) return;

    try {
      await resendTwoFactorCodeMutation.mutateAsync({
        challengeToken: twoFactorChallenge.challengeToken,
      });
      toast.success('Đã gửi lại mã xác thực');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gửi lại mã xác thực'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {twoFactorChallenge ? 'Xác thực 2 yếu tố' : 'Đăng nhập'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {twoFactorChallenge
            ? `Nhập mã gồm 6 chữ số đã gửi tới ${twoFactorChallenge.email}`
            : 'Nhập email và mật khẩu để đăng nhập'}
        </p>
      </div>

      {twoFactorChallenge ? (
        <form onSubmit={handleVerifyTwoFactor} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="twoFactorCode" className="text-sm font-medium">
              Mã xác thực
            </Label>
            <Input
              id="twoFactorCode"
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              disabled={loading}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              className="h-11 rounded-lg border-border text-center tracking-[0.4em] focus:border-primary focus:ring-primary/20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary-hover rounded-lg text-base font-medium text-white"
          >
            {loading ? <SpinnerLoading noWrapper size={18} className="mr-2 text-white" /> : null}
            Xác nhận đăng nhập
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setTwoFactorChallenge(null);
                setTwoFactorCode('');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                void handleResendTwoFactorCode();
              }}
              disabled={resendTwoFactorCodeMutation.isPending}
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Gửi lại mã
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
              {...form.register('email')}
              className="h-11 rounded-lg border-border focus:border-primary focus:ring-primary/20"
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline underline-offset-4"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={loading}
                {...form.register('password')}
                className="h-11 rounded-lg border-border focus:border-primary focus:ring-primary/20 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary-hover rounded-lg text-base font-medium mt-2 text-white"
          >
            {loading ? <SpinnerLoading noWrapper size={18} className="mr-2 text-white" /> : null}
            Đăng nhập
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link
          href="/register"
          className="text-primary hover:underline underline-offset-4 font-medium"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
