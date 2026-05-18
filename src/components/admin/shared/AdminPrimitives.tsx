import { ComponentProps, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export const adminShellClass =
  "bg-[radial-gradient(circle_at_top_left,_rgba(216,71,60,0.1),_transparent_26%),linear-gradient(180deg,_#fcfbf8_0%,_#f4efe8_100%)] text-slate-950";

export const adminSurfaceClass =
  "rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.4)] backdrop-blur-sm";

export const adminSubtleSurfaceClass =
  "rounded-[28px] border border-slate-200/70 bg-[#f7f2eb]/92 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm";

export const adminFilterBarClass = cn(
  adminSubtleSurfaceClass,
  "flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between",
);

export const adminTableShellClass = cn(
  adminSurfaceClass,
  "overflow-hidden",
);

export const adminTableHeaderClass = "bg-[#f4ede5]/90";

export const adminRowHoverClass =
  "transition-colors hover:bg-[#fbf6f0]/80";

export const adminSearchInputClass =
  "rounded-2xl border-0 bg-white/95 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)] focus-visible:ring-[#d8473c]/15 focus-visible:ring-[3px] focus-visible:border-transparent";

export const adminFieldSurfaceClass =
  "rounded-2xl border-0 bg-white/95 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)] focus:ring-0";

export const adminNativeSelectClass =
  "h-10 w-full rounded-2xl border-0 bg-white/95 px-3 text-sm shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)] focus:outline-none focus:ring-2 focus:ring-[#d8473c]/15 sm:w-auto";

export const adminIconButtonClass =
  "h-10 w-10 rounded-2xl border-0 bg-white/95 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)] hover:bg-white";

export const adminSmallIconButtonClass =
  "h-8 w-8 rounded-xl border-0 bg-white/95 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)] hover:bg-white";

export const adminMediaPlaceholderClass =
  "bg-[#f5efe8]";

export const adminPrimaryButtonClass =
  "rounded-2xl border border-[#d8473c]/15 bg-[#d8473c] text-white shadow-[0_12px_24px_-18px_rgba(216,71,60,0.9)] hover:bg-[#c53b31]";

export const adminSecondaryButtonClass =
  "rounded-2xl border border-slate-200 bg-white/90 text-slate-700 hover:bg-white";

export const adminMenuContentClass =
  "rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm";

export const adminMenuLabelClass =
  "px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500";

export const adminMenuSeparatorClass = "my-1 bg-[#efe7de]";

export const adminCodePillClass =
  "relative rounded-lg bg-[#f5efe8] px-[0.45rem] py-[0.24rem] font-mono text-xs text-slate-500";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d8473c]" />
          <h1 className="text-[clamp(2rem,3vw,2.7rem)] font-semibold uppercase tracking-[0.12em] text-slate-950">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="max-w-3xl pl-5 text-sm leading-6 text-slate-500">
            {description}
          </p>
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

interface AdminActionButtonProps
  extends ComponentProps<typeof Button> {
  tone?: "primary" | "secondary" | "danger";
}

export function AdminActionButton({
  tone = "primary",
  className,
  ...props
}: AdminActionButtonProps) {
  const toneClass =
    tone === "primary"
      ? adminPrimaryButtonClass
      : tone === "danger"
        ? "rounded-2xl"
        : adminSecondaryButtonClass;

  return (
    <Button
      className={cn(
        "h-10 w-full gap-2 px-5 text-sm font-medium sm:w-auto",
        toneClass,
        className,
      )}
      variant={tone === "danger" ? "destructive" : undefined}
      {...props}
    />
  );
}

interface AdminStatsGridProps {
  children: ReactNode;
  className?: string;
}

export function AdminStatsGrid({
  children,
  className,
}: AdminStatsGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

interface AdminStatCardProps {
  title: string;
  value: ReactNode;
  description?: ReactNode;
  icon: LucideIcon;
  accent?: "brand" | "blue" | "green" | "amber" | "slate";
  meta?: ReactNode;
}

const statAccentClasses = {
  brand: "bg-[#d8473c]/10 text-[#d8473c]",
  blue: "bg-sky-500/10 text-sky-600",
  green: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/10 text-amber-600",
  slate: "bg-slate-500/10 text-slate-600",
};

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "brand",
  meta,
}: AdminStatCardProps) {
  return (
    <div className={cn(adminSurfaceClass, "p-6")}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <div className="text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </div>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            statAccentClasses[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {description || meta ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{description}</p>
          {meta ? <div className="shrink-0">{meta}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
