import { cn } from '@/utils/cn';

interface SpinnerLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: number;
  fullPage?: boolean;
  noWrapper?: boolean;
}

export default function SpinnerLoading({
  className,
  size = 20,
  fullPage = false,
  noWrapper = false,
  ...props
}: SpinnerLoadingProps) {
  const spinner = (
    <div
      className={cn(
        'relative flex items-center justify-center animate-spin',
        noWrapper && className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-10"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          className="opacity-80"
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  if (noWrapper) return spinner;

  return (
    <div
      className={cn(
        'flex items-center justify-center transition-[opacity] duration-300 motion-reduce:transition-none',
        fullPage ? 'min-h-[80px] w-full p-4' : 'p-2',
        className,
      )}
      {...props}
    >
      {spinner}
    </div>
  );
}
