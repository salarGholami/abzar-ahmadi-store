"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="card w-full max-w-lg p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-500/10 text-2xl">!</div>
        <h1 className="mt-5 text-xl font-black">مشکلی پیش آمد</h1>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">این صفحه موقتاً نتوانست بارگذاری شود. دوباره تلاش کنید.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">تلاش دوباره</button>
          <Link href="/" className="btn">صفحه اصلی</Link>
        </div>
      </div>
    </main>
  );
}
