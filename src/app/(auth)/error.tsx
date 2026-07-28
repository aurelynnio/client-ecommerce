'use client';
import { RouteError } from '@/components/common/RouteFeedback';
export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError reset={reset} />;
}
