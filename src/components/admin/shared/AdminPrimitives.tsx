import { ComponentProps, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export const adminShellClass = 'bg-background text-foreground';

export const adminSurfaceClass = 'rounded-lg border border-border bg-card shadow-sm';

export const adminSubtleSurfaceClass = 'rounded-lg border border-border bg-muted/40 shadow-sm';

export const adminFilterBarClass = cn(
  adminSubtleSurfaceClass,
  'flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between',
);

export const adminTableShellClass = cn(adminSurfaceClass, 'overflow-hidden');

export const adminTableHeaderClass = 'bg-muted/60';

export const adminRowHoverClass = 'transition-colors hover:bg-muted/60';

export const adminSearchInputClass =
  'rounded-lg border border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export const adminFieldSurfaceClass =
  'rounded-lg border border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50';

export const adminDialogContentClass = cn(
  adminSurfaceClass,
  'rounded-lg border-border bg-card shadow-lg',
);

export const adminDialogFooterClass =
  'flex-col-reverse gap-3 border-t border-border bg-transparent pt-5 sm:flex-row sm:justify-end sm:gap-3';

export const adminInsetPanelClass = 'rounded-lg border border-border bg-muted/40';

export const adminNativeSelectClass =
  'h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 sm:w-auto';

export const adminIconButtonClass =
  'h-10 w-10 rounded-lg border border-border bg-card hover:bg-muted';

export const adminSmallIconButtonClass =
  'h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted';

export const adminMediaPlaceholderClass = 'bg-muted';

export const adminPrimaryButtonClass =
  'rounded-lg border border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover';

export const adminSecondaryButtonClass =
  'rounded-lg border border-border bg-card text-foreground hover:bg-muted';

export const adminMenuContentClass = 'rounded-lg border border-border bg-popover p-1 shadow-md';

export const adminMenuLabelClass =
  'px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground';

export const adminMenuSeparatorClass = 'my-1 bg-border';

export const adminCodePillClass =
  'relative rounded-md bg-muted px-[0.45rem] py-[0.24rem] font-mono text-xs text-muted-foreground';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({ title, description, actions, className }: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="max-w-3xl pl-5 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

interface AdminActionButtonProps extends ComponentProps<typeof Button> {
  tone?: 'primary' | 'secondary' | 'danger';
}

export function AdminActionButton({
  tone = 'primary',
  className,
  ...props
}: AdminActionButtonProps) {
  const toneClass =
    tone === 'primary'
      ? adminPrimaryButtonClass
      : tone === 'danger'
        ? 'rounded-lg'
        : adminSecondaryButtonClass;

  return (
    <Button
      className={cn('h-10 w-full gap-2 px-5 text-sm font-medium sm:w-auto', toneClass, className)}
      variant={tone === 'danger' ? 'destructive' : undefined}
      {...props}
    />
  );
}

interface AdminStatsGridProps {
  children: ReactNode;
  className?: string;
}

export function AdminStatsGrid({ children, className }: AdminStatsGridProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>{children}</div>
  );
}

interface AdminStatCardProps {
  title: string;
  value: ReactNode;
  description?: ReactNode;
  icon: LucideIcon;
  accent?: 'brand' | 'blue' | 'green' | 'amber' | 'slate';
  meta?: ReactNode;
}

const statAccentClasses = {
  brand: 'bg-primary/10 text-primary',
  blue: 'bg-info/15 text-info',
  green: 'bg-success/15 text-success',
  amber: 'bg-warning/15 text-warning',
  slate: 'bg-muted text-muted-foreground',
};

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = 'brand',
  meta,
}: AdminStatCardProps) {
  return (
    <div className={cn(adminSurfaceClass, 'p-6')}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
          <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg',
            statAccentClasses[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {description || meta ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{description}</p>
          {meta ? <div className="shrink-0">{meta}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
