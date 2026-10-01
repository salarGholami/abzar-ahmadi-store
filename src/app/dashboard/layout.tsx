import type { Metadata } from "next";
import DashboardShell from "@/features/admin/ui/DashboardShell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "مدیریت فروشگاه", robots: { index: false, follow: false } };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/account?next=/dashboard");
  if (session.role !== "ADMIN") redirect("/account");
  return <DashboardShell user={session}>{children}</DashboardShell>;
}
