import { Suspense } from "react";
import StoreHeader from "@/components/layout/StoreHeader";
import LoginForm from "@/components/auth/LoginForm";
import AccountOverview from "@/components/auth/AccountOverview";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function Account() {
  const session = await getSession();
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="card p-7">
          {session ? (
            <AccountOverview session={session} />
          ) : (
            <>
              <div className="text-sm font-bold text-[var(--primary)]">حساب کاربری</div>
              <h1 className="mt-2 text-2xl font-black">ورود به ابزارینو</h1>
              <Suspense>
                <LoginForm />
              </Suspense>
              <p className="mt-5 text-center text-sm text-[var(--muted)]">حساب ندارید؟ <Link href="/register" className="font-bold text-[var(--primary)]">ثبت‌نام</Link></p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
