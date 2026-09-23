import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

export function DashboardBreadcrumb({
  current,
  section = "مدیریت فروشگاه",
}: {
  current: string;
  section?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
      <span>{section}</span>
      <ChevronLeft size={13} />
      <strong className="text-[var(--text)]">{current}</strong>
    </div>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#18232d] p-5 text-white sm:p-6">
      <div className="absolute -left-20 -top-28 size-80 rounded-full bg-[#00adb5]/15 blur-3xl" />
      <div className="absolute bottom-0 right-1/3 h-px w-1/2 bg-gradient-to-l from-transparent via-[#00adb5]/60 to-transparent" />

      <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[#8adfe1]">
            <Icon size={15} />
            {eyebrow}
            <span className="rounded-md border border-white/15 px-2 py-1 text-[10px] text-slate-300">
              ABZAR AHMADI
            </span>
          </div>

          <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="relative flex flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}

export function DashboardKpi({
  title,
  value,
  caption,
  icon: Icon,
  tone = "primary",
  foot,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "violet";
  foot?: string;
}) {
  const tones = {
    primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
    violet: "bg-violet-500/10 text-violet-600",
  };

  return (
    <article className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="absolute -left-5 -top-6 size-24 rounded-full bg-current opacity-[0.035]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--muted)]">{title}</p>
          <p className="mt-2 break-words text-xl font-black leading-8 tabular-nums text-[var(--text)]">
            {value}
          </p>
          <p className="mt-1 text-[10px] text-[var(--muted)]">{caption}</p>
        </div>

        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>

      {foot ? (
        <div className="relative mt-3 flex items-center gap-1 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--muted)]">
          <Activity size={12} />
          {foot}
        </div>
      ) : null}
    </article>
  );
}

export function DashboardPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black text-[var(--text)]">{title}</h2>
          {description ? (
            <p className="mt-1 text-[11px] text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function DashboardEmpty({
  title = "اطلاعاتی ثبت نشده است",
  description = "با ثبت اولین رکورد، اطلاعات این بخش در داشبورد نمایش داده می‌شود.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-xl bg-[var(--surface-2)] px-4 text-center">
      <div className="mb-2 grid size-9 place-items-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
        <AlertCircle size={17} />
      </div>
      <p className="text-sm font-bold text-[var(--text)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
    </div>
  );
}

export function DashboardStatus({
  label,
  tone = "success",
}: {
  label: string;
  tone?: "success" | "warning" | "danger";
}) {
  const classes = {
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-extrabold ${classes[tone]}`}>
      <CheckCircle2 size={12} />
      {label}
    </span>
  );
}
