import type { ReactNode } from "react";
import StoreShell from "../_shell/StoreShell";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
