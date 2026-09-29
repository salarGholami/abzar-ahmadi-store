import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getBusinessMetrics } from "@/lib/business-metrics";
export async function GET(){try{await requirePermission("reports");return ok(await getBusinessMetrics());}catch(e){return fail(e);}}
