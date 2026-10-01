import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/features/admin/ui/DashboardShell";

export const metadata: Metadata = {
  title: "پنل تأمین‌کننده | ابزار احمدی",
  robots: { index: false, follow: false },
};

export default async function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/account?next=/supplier");

  if (session.role !== "SUPPLIER") {
    redirect(session.role === "ADMIN" ? "/dashboard" : "/account");
  }

  return <DashboardShell user={session}>{children}</DashboardShell>;
}
