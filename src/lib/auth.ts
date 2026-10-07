import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "./roles";

export type { Role };

export type Session = {
  id: string;
  phone: string;
  name: string;
  role: Role;
  permissions: string[];
  supplierId?: string;
  isOwner: boolean;
  exp: number;
};

const OWNER_PHONE = "09129999999";

export function isOwnerPhone(phone: string) {
  return phone === OWNER_PHONE;
}

const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set (min 16 chars) in production");
  }
  return "development-secret-change-me";
};

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString();

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSession(s: Omit<Session, "exp">) {
  const body = b64(
    JSON.stringify({
      ...s,
      exp: Date.now() + 7 * 864e5,
    }),
  );
  return `${body}.${sign(body)}`;
}

export function verifySession(token: string): Session | null {
  if (!token) return null;

  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;

    const expected = sign(body);
    if (sig.length !== expected.length) return null;

    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

    const parsed = JSON.parse(unb64(body)) as Partial<Session> & {
      permissions?: unknown;
    };

    if (!parsed.exp || parsed.exp <= Date.now()) return null;

    const role = parsed.role;
    if (role !== "ADMIN" && role !== "SUPPLIER" && role !== "CUSTOMER") {
      return null;
    }

    const permissions = Array.isArray(parsed.permissions)
      ? parsed.permissions.filter((value): value is string => typeof value === "string")
      : [];

    return {
      id: String(parsed.id || ""),
      phone: String(parsed.phone || ""),
      name: String(parsed.name || ""),
      role,
      permissions,
      supplierId:
        typeof parsed.supplierId === "string" ? parsed.supplierId : undefined,
      isOwner:
        role === "ADMIN" &&
        (parsed.isOwner === true || isOwnerPhone(String(parsed.phone || ""))),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  return verifySession((await cookies()).get("session")?.value || "");
}

export async function setSession(s: Omit<Session, "exp">) {
  (await cookies()).set("session", createSession(s), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 86400,
  });
}

export async function clearSession() {
  (await cookies()).delete("session");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [alg, salt, hash] = stored.split(":");
  if (alg !== "scrypt" || !salt || !hash) return false;

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}
