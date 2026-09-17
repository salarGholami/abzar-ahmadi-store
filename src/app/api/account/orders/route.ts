import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson } from "@/lib/github";
import type { Sale } from "@/lib/types";
export async function GET(){try{const session=await requirePermission("sales.read");const file=await getJson<Sale[]>("sales.json",[]);return ok(file.data.filter(s=>s.customerUserId===session.id).reverse());}catch(error){return fail(error);}}
