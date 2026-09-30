"use client";

import { useCallback } from "react";
import { useAdminUsers } from "@/features/admin/hooks";
import type { PublicRole } from "@/lib/roles";
import type { LoginAccount, ProfileRow } from "./account.types";

export function useLoginAccounts(role: PublicRole) {
  const query = useAdminUsers();
  const accounts = (query.data ?? []).filter((account) => (account as LoginAccount).role === role) as LoginAccount[];

  const reload = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const findAccount = useCallback(
    (row: ProfileRow) =>
      accounts.find((account) =>
        role === "CUSTOMER"
          ? account.id === row.userId
          : account.supplierId === row.id || account.id === row.id,
      ) ?? null,
    [accounts, role],
  );

  return { accounts, findAccount, reload };
}
