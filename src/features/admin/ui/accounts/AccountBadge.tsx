export default function AccountBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-lg px-2.5 py-1 text-xs font-black ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-[var(--surface-2)] text-[var(--muted)]"
      }`}
    >
      {active ? "دارد" : "ندارد"}
    </span>
  );
}
