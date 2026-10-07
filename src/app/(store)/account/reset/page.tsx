import type { Metadata } from "next";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import ResetPasswordForm from "@/features/auth/ui/ResetPasswordForm";

export const metadata: Metadata = {
  title: "بازیابی رمز عبور",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-md items-center px-4 py-12">
      <div className="card w-full p-7">
        <div className="text-sm font-bold text-[var(--primary)]">بازیابی رمز عبور</div>
        <h1 className="mt-2 text-2xl font-black">فراموشی رمز عبور</h1>
        <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
          کد بازیابی را از پشتیبانی فروشگاه دریافت کنید، سپس شماره موبایل و رمز جدید را وارد کنید.
          این نسخه به‌صورت MVP با کد ثابت پیکربندی‌شده کار می‌کند و نیاز به پیامک ندارد.
        </p>

        <ResetPasswordForm />

        <div className="mt-6 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--primary)]"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </main>
  );
}
