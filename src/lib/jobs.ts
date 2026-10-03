import "server-only";

import { runDataIntegrityCheck } from "@/lib/maintenance";
import { expireReservations } from "@/lib/inventory-reservations";

export async function runMaintenanceJobs() {
  const integrityIssues = await runDataIntegrityCheck();
  const expiredReservations = await expireReservations();
  return {
    executedAt: new Date().toISOString(),
    jobs: ["data-integrity", "expire-inventory-reservations"],
    expiredReservations,
    integrityIssues,
  };
}
