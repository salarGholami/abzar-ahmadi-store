import { Suspense } from "react";
import Image from "next/image";
import StoreHeader from "@/components/layout/StoreHeader";
import LoginForm from "@/components/auth/LoginForm";
import AccountOverview from "@/components/auth/AccountOverview";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { HomeIcon } from "lucide-react";

export default async function Account() {
  const session = await getSession();

  return (
    <>
      <StoreHeader />

      <main className="flex min-h-[calc(100dvh-120px)] items-center justify-center px-4 py-6">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* ===== سمت چپ: تصویر با لایه مشکی ثابت + لینک ===== */}
          <div className="group relative hidden h-[400px] overflow-hidden rounded-2xl md:block lg:h-[600px]">
            <Image
              src="/images/auth/login/cover-login.webp"
              alt="ورود به حساب کاربری"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* لایه مشکی همیشه روشن */}
            <div className="absolute inset-0 bg-black/50" />

            {/* متن روی لایه مشکی */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <span className="text-4xl font-bold text-white">
                  ابزار احمدی
                </span>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>بازگشت به صفحه اصلی</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ===== سمت راست: فرم ===== */}
          <div className="mx-auto w-full max-w-md">
            <div className="card p-7">
              {session ? (
                <AccountOverview session={session} />
              ) : (
                <>
                  <div className="text-xs font-bold text-[var(--primary)]">
                    حساب کاربری
                  </div>
                  <h1 className="mt-2 text-sm font-black">
                    وارد حساب کاربریت بشو !
                  </h1>

                  <Suspense>
                    <LoginForm />
                  </Suspense>

                  <p className="mt-5 text-center text-sm text-[var(--muted)]">
                    حساب ندارید؟{" "}
                    <Link
                      href="/register"
                      className="font-bold text-[var(--primary)]"
                    >
                      ثبت‌نام
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
