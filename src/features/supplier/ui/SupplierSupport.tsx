import { PageHeader, Panel } from "@/features/portal/ui/PortalUI";

export default function SupplierSupport() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="مرکز پشتیبانی"
        description="پیگیری سفارش، تسویه و تخصیص محصول از طریق مدیر فروشگاه."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="راه‌های ارتباطی">
          <ul className="space-y-3 text-sm leading-7 text-[var(--muted)]">
            <li>تماس با مدیر از شماره ثبت‌شده در تنظیمات فروشگاه</li>
            <li>پیگیری فاکتور و موجودی در ساعات اداری</li>
            <li>درخواست تخصیص محصول جدید فقط از مسیر مدیر</li>
          </ul>
        </Panel>
        <Panel title="محدوده MVP">
          <p className="text-sm leading-7 text-[var(--muted)]">
            این پنل داده‌های مالک‌محور (محصولات تخصیص‌یافته و خریدهای مرتبط با شناسه
            تأمین‌کننده شما) را نمایش می‌دهد. ثبت خرید و تغییر موجودی از پنل مدیر انجام
            می‌شود.
          </p>
        </Panel>
      </div>
    </div>
  );
}
