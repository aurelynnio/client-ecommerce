'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { useSendVerificationCode } from '@/hooks/queries';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { getSafeErrorMessage } from '@/api';

export default function SendCodePage() {
  const router = useRouter();
  const sendCodeMutation = useSendVerificationCode();

  const [email, setEmail] = useState<string>('');
  const isLoading = sendCodeMutation.isPending;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }

    try {
      await sendCodeMutation.mutateAsync({ email: normalizedEmail });
      toast.success('Mã xác nhận đã được gửi đến email của bạn');
      router.push(`/verify-code?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể gửi mã xác nhận'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Xác thực email</h1>
        <p className="text-sm text-muted-foreground">Nhập email để nhận mã xác thực</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-lg border-input"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
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
