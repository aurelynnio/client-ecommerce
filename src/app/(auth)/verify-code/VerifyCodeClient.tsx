'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useVerifyCode } from '@/hooks/queries';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSafeErrorMessage } from '@/api';

type VerifyCodeClientProps = {
  initialEmail?: string | null;
  initialCode?: string | null;
};

const OTP_LENGTH = 6;
const OTP_SLOT_CLASS = 'h-12 w-12 rounded-lg border-border text-lg';

function isValidOtp(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d{6}$/.test(value);
}

export default function VerifyCodeClient({ initialEmail, initialCode }: VerifyCodeClientProps) {
  const router = useRouter();
  const verifyCodeMutation = useVerifyCode();

  const email = useMemo(() => (initialEmail ?? '').trim(), [initialEmail]);
  const canVerify = email.length > 0;

  const [otp, setOtp] = useState<string>(() => (isValidOtp(initialCode) ? initialCode : ''));
  const isLoading = verifyCodeMutation.isPending;

  const otpInputRef = useRef<HTMLInputElement>(null);

  const autoSubmittedRef = useRef(false);

  const submitVerification = useCallback(
    async (code: string) => {
      if (!canVerify) {
        toast.error('Thiếu email để xác thực. Vui lòng nhập lại email.');
        return;
      }
      if (!/^\d{6}$/.test(code)) return;

      try {
        await verifyCodeMutation.mutateAsync({ email, code });
        toast.success('Xác thực email thành công!');
        router.replace('/login');
      } catch (error: unknown) {
        toast.error(getSafeErrorMessage(error, 'Xác thực email thất bại'));
      }
    },
    [canVerify, email, router, verifyCodeMutation],
  );

  useEffect(() => {
    if (autoSubmittedRef.current) return;
    if (!isValidOtp(initialCode)) return;
    if (!canVerify) return;

    autoSubmittedRef.current = true;
    void submitVerification(initialCode);
  }, [canVerify, initialCode, submitVerification]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitVerification(otp);
  };

  const handleOtpChange = (value: string) => {
    // Be defensive: keep digits only, max length 6.
    const digits = value.replace(/[^\d]/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kiểm tra email</h1>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi mã xác nhận đến{' '}
          {canVerify ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            'email của bạn'
          )}
        </p>
      </div>

      {!canVerify ? (
        <div className="rounded-lg border border-warning/30 bg-warning/15 px-4 py-3 text-sm text-warning">
          Thiếu email để xác thực. Quay lại trang gửi mã để nhập email.
          <div className="mt-2">
            <Link
              href="/send-code"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Đi đến trang gửi mã
            </Link>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="flex flex-col items-center gap-3">
          <InputOTP
            value={otp}
            onChange={handleOtpChange}
            maxLength={OTP_LENGTH}
            disabled={isLoading || !canVerify}
            ref={otpInputRef}
            inputMode="numeric"
            autoFocus
            aria-label="Mã xác thực 6 số"
          >
            <InputOTPGroup>
              {[0, 1, 2].map((i) => (
                <InputOTPSlot key={i} index={i} className={OTP_SLOT_CLASS} />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator className="text-muted-foreground" />
            <InputOTPGroup>
              {[3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className={OTP_SLOT_CLASS} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className="text-xs text-muted-foreground">Vui lòng nhập mã 6 số đã được gửi</p>
        </div>

        <Button
          type="submit"
          disabled={!canVerify || isLoading || otp.length !== OTP_LENGTH}
          className="h-11 w-full rounded-lg bg-primary text-base font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {isLoading ? <SpinnerLoading noWrapper size={18} className="mr-2 text-primary-foreground" /> : null}
          Xác nhận
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
