import ResetPasswordForm from "@/features/auth/ui/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <>
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="card p-7">
          <div className="text-sm font-bold text-[var(--primary)]">بازیابی رمز عبور</div>
          <h1 className="mt-2 text-2xl font-black">فراموشی رمز عبور</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">کد بازیابی از طریق پشتیبانی فروشگاه در اختیار شما قرار می‌گیرد.</p>
          <ResetPasswordForm />
        </div>
      </main>
    </>
  );
}
