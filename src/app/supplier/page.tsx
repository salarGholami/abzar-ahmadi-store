import SupplierOverview from "@/features/supplier/ui/SupplierOverview";
import { getSession } from "@/lib/auth";

export default async function SupplierHome() {
  const session = await getSession();
  return <SupplierOverview name={session?.name ?? ""} />;
}
