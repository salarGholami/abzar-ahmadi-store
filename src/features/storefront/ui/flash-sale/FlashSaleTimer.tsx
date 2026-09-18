type TimerProps = { hours: number; minutes: number; seconds: number };

function TimeBox({ value, label, large = false, highlight = false }: { value: number; label: string; large?: boolean; highlight?: boolean }) {
  return (
    <div dir="rtl" className={large ? "flex w-[76px] flex-col items-center" : "flex w-[38px] flex-col items-center justify-center sm:w-[42px] lg:hidden"}>
      <div className={`grid place-items-center font-black tabular-nums ${large ? "h-16 w-16 rounded-2xl text-2xl xl:h-[70px] xl:w-[70px] xl:text-[26px]" : "size-8 rounded-lg text-[11px] sm:size-9 sm:text-xs"} ${highlight ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"}`}>
        {String(value).padStart(2, "0")}
      </div>
      <span className={`${large ? "mt-2 text-[10px]" : "mt-1 text-[7px] sm:text-[8px]"} whitespace-nowrap font-bold leading-none text-[var(--muted)]`}>{label}</span>
    </div>
  );
}

function Separator({ large = false }: { large?: boolean }) {
  return <span className={`${large ? "h-16 w-5 pb-5 text-xl xl:h-[70px]" : "h-[52px] w-3 pb-3 text-sm sm:h-[58px] sm:w-4 sm:text-base lg:hidden"} flex items-center justify-center font-black leading-none text-[var(--muted)]`}>:</span>;
}

export default function FlashSaleTimer({ hours, minutes, seconds }: TimerProps) {
  return (
    <div className="flex w-full justify-center">
      <div dir="ltr" className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 lg:gap-3 lg:rounded-[22px] lg:px-6 lg:py-4">
        <span className="hidden text-[var(--primary)] lg:inline">⏱</span>
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-3">
          <TimeBox value={hours} label="ساعت" large={false} />
          <Separator />
          <TimeBox value={minutes} label="دقیقه" large={false} />
          <Separator />
          <TimeBox value={seconds} label="ثانیه" highlight />
        </div>
      </div>
      <div dir="ltr" className="ml-4 hidden items-center gap-3 lg:flex">
        <TimeBox value={hours} label="ساعت" large />
        <Separator large />
        <TimeBox value={minutes} label="دقیقه" large />
        <Separator large />
        <TimeBox value={seconds} label="ثانیه" large highlight />
      </div>
    </div>
  );
}
