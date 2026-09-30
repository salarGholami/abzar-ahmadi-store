"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import type { PublicRole } from "@/lib/roles";
import AccountModal from "./AccountModal";
import type { LoginAccount, ProfileRow } from "./account.types";

type Props = {
  role: PublicRole;
  row: ProfileRow;
  account: LoginAccount | null;
  onChanged: () => void;
};

export default function AccountAction({ role, row, account, onChanged }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary !p-2"
        aria-label={`مدیریت حساب ورود ${row.name}`}
        title="حساب ورود"
        onClick={() => setOpen(true)}
      >
        <KeyRound size={15} />
      </button>
      {open && (
        <AccountModal
          role={role}
          row={row}
          account={account}
          onClose={() => setOpen(false)}
          onDone={() => {
            setOpen(false);
            onChanged();
          }}
        />
      )}
    </>
  );
}
