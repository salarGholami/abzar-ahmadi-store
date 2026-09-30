import type { PublicRole } from "@/lib/roles";

export type LoginAccount = {
  id: string;
  name: string;
  phone: string;
  role: PublicRole;
  supplierId?: string;
  createdAt?: string;
};

export type ProfileRow = {
  id: string;
  name: string;
  phone: string;
  userId?: string;
  [key: string]: unknown;
};
