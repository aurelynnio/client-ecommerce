'use client';
import { RouteError } from '@/components/common/RouteFeedback';
export default function MainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError reset={reset} />;
}
