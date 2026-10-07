import { mergeGuestCartIntoUser } from "@/lib/cart";
import { trackServerEvent } from "@/lib/events";
import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
import { setSession, verifyPassword } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { AppUser } from "@/lib/types";

/** Canonical owner phone for the store. */
const OWNER_PHONE = "09129999999";

function failure(code: string, message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ success: false, error: { code, message } }, { status, headers });
}

async function findLoginUser(phone: string): Promise<AppUser | undefined> {
  // Auth identities may live in users.json (CUSTOMER/SUPPLIER/legacy ADMIN)
  // or admins.json (separated ADMIN accounts). Search both.
  const [usersFile, adminsFile] = await Promise.all([
    getJson<AppUser[]>("users.json", []),
    getJson<AppUser[]>("admins.json", []).catch(() => ({ data: [] as AppUser[], sha: "missing", path: "admins.json" })),
  ]);

  const fromAdmins = adminsFile.data.find((item) => item.phone === phone);
  if (fromAdmins) return fromAdmins;

  return usersFile.data.find((item) => item.phone === phone);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { phone?: unknown; password?: unknown } | null;
    const phone = normalizePhone(body?.phone);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!phone || !password) {
      return failure("VALIDATION_ERROR", "شماره موبایل و رمز عبور الزامی است", 400);
    }

    const limit = rateLimit(`login:${clientIp(req)}:${phone}`, 8, 10 * 60 * 1000);
    if (!limit.allowed) {
      return failure("RATE_LIMITED", "تعداد تلاش‌های ورود زیاد است. کمی بعد دوباره تلاش کنید.", 429, {
        "Retry-After": String(limit.retryAfter),
      });
    }

    const user = await findLoginUser(phone);

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return failure("INVALID_CREDENTIALS", "شماره موبایل یا رمز عبور اشتباه است", 401);
    }

    // Never promote unknown or missing roles to ADMIN. Role comes from the persisted
    // user record and is validated against the domain role set before issuing a session.
    if (user.role !== "ADMIN" && user.role !== "SUPPLIER" && user.role !== "CUSTOMER") {
      return failure("INVALID_ROLE", "حساب کاربری نقش معتبر ندارد؛ با مدیر سامانه تماس بگیرید.", 403);
    }
    const role = user.role;
    const isOwner = role === "ADMIN" && (user.isOwner === true || user.phone === OWNER_PHONE);
    const userPermissions =
      role === "ADMIN"
        ? isOwner
          ? ["*"]
          : Array.isArray(user.permissions)
            ? user.permissions.filter((value): value is string => typeof value === "string")
            : []
        : role === "SUPPLIER"
          ? [...permissions.SUPPLIER]
          : [...permissions.CUSTOMER];

    await setSession({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role,
      isOwner,
      permissions: userPermissions,
      ...(role === "SUPPLIER" && user.supplierId
        ? { supplierId: user.supplierId }
        : {}),
    });

    try {
      await mergeGuestCartIntoUser(user.id);
    } catch (error) {
      console.error("mergeGuestCartIntoUser failed", error);
    }
    await trackServerEvent("LOGIN");

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role,
          permissions: userPermissions,
          supplierId: user.supplierId || null,
          isOwner,
        },
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login", error);
    return failure("LOGIN_ERROR", "خطای ورود. لطفاً دوباره تلاش کنید.", 500);
  }
}
