import CustomerOverview from "@/features/customer/ui/CustomerOverview";
import { getSession } from "@/lib/auth";

export default async function Page() {
  const session = await getSession();
  return <CustomerOverview name={session?.name ?? ""} />;
}
