export default function LoadingScreen({ label = "در حال آماده‌سازی..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[55vh] items-center justify-center px-4 py-16"
    >
      <div className="relative flex w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,.08)]">
        <div className="absolute -top-20 size-40 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="relative grid size-16 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <span className="absolute inset-0 rounded-2xl border-2 border-[var(--primary)]/20 animate-pulse" />
          <span className="size-7 animate-spin rounded-full border-[3px] border-[var(--primary)]/20 border-t-[var(--primary)]" />
        </div>
        <p className="mt-5 text-sm font-black text-[var(--text)]">{label}</p>
        <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
          <span className="block h-full w-1/2 animate-[loadingSlide_1.15s_ease-in-out_infinite] rounded-full bg-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}
