'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SpinnerLoading from '@/components/common/SpinnerLoading';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <SpinnerLoading />
        <p className="text-muted-foreground mt-4">Redirecting...</p>
      </div>
    </div>
  );
}
