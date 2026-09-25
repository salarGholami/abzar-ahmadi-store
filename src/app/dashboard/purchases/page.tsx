import { getJson } from "@/lib/github";
import type { Purchase, Supplier } from "@/lib/types";
import PurchasesBrowser from "@/features/admin/ui/purchases/PurchasesBrowser";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const [purchasesFile, suppliersFile] = await Promise.all([
    getJson<Purchase[]>("purchases.json", []),
    getJson<Supplier[]>("suppliers.json", []),
  ]);

  const purchases = Array.isArray(purchasesFile.data)
    ? [...purchasesFile.data].reverse()
    : [];

  const suppliers = Array.isArray(suppliersFile.data) ? suppliersFile.data : [];

  return (
    <main className="mx-auto w-full max-w-[1500px] p-3 sm:p-5">
      <PurchasesBrowser purchases={purchases} suppliers={suppliers} />
    </main>
  );
}
