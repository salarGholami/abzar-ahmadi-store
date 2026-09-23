import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/features/admin/ui/DashboardShell";

export const metadata: Metadata = {
  title: "حساب مشتری | ابزار احمدی",
  robots: { index: false, follow: false },
};

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/account?next=/customer");

  if (session.role === "ADMIN") redirect("/dashboard");
  if (session.role === "SUPPLIER") redirect("/supplier");
  if (session.role !== "CUSTOMER") redirect("/account");

  return <DashboardShell user={session}>{children}</DashboardShell>;
}
