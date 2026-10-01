import { mergeGuestCartIntoUser } from "@/lib/cart";
import { trackServerEvent } from "@/lib/events";
import { NextResponse } from "next/server";
import { mutateJson } from "@/lib/github";
import { setSession, hashPassword } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { AppUser, Customer, Supplier } from "@/lib/types";

function failure(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`register:${clientIp(req)}`, 10, 60 * 60 * 1000);
    if (!limit.allowed) return failure("RATE_LIMITED", "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.", 429);

    const body = (await req.json().catch(() => null)) as {
      name?: unknown;
      phone?: unknown;
      password?: unknown;
      role?: unknown;
    } | null;
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const phone = normalizePhone(body?.phone);
    // Only allow CUSTOMER or SUPPLIER via public register. ADMIN is never creatable here.
    const requestedRole = typeof body?.role === "string" ? body.role.toUpperCase() : "CUSTOMER";
    const role = requestedRole === "SUPPLIER" ? "SUPPLIER" : "CUSTOMER";

    if (!name || !phone || password.length < 8 || password.length > 128) {
      return failure("VALIDATION_ERROR", "نام، شماره موبایل معتبر و رمز عبور (حداقل ۸ کاراکتر) الزامی است", 400);
    }

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const userPermissions =
      role === "SUPPLIER" ? [...permissions.SUPPLIER] : [...permissions.CUSTOMER];

    const user: AppUser = {
      id: userId,
      name,
      phone,
      role,
      permissions: userPermissions,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
      ...(role === "SUPPLIER" ? { supplierId: userId } : {}),
    };

    await mutateJson<AppUser[], null>(
      "users.json",
      [],
      (current) => {
        if (current.some((item) => item.phone === phone)) throw new Error("DUPLICATE_PHONE");
        return { next: [...current, user], result: null };
      },
      `Register user ${user.id}`,
    );

    if (role === "CUSTOMER") {
      const customer: Customer = {
        id: crypto.randomUUID(),
        userId: user.id,
        name: user.name,
        phone: user.phone,
        address: "",
        
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      await mutateJson<Customer[], null>(
        "customers.json",
        [],
        (current) => {
          if (current.some((item) => item.userId === user.id || item.phone === user.phone)) {
            return { next: current, result: null };
          }
          return { next: [...current, customer], result: null };
        },
        `Create customer profile ${user.id}`,
      );
    } else {
      const supplier: Supplier = {
        id: userId,
        name: user.name,
        phone: user.phone,
        address: "",
        
        createdAt: now,
        updatedAt: now,
      };
      await mutateJson<Supplier[], null>(
        "suppliers.json",
        [],
        (current) => {
          if (current.some((item) => item.id === supplier.id || item.phone === supplier.phone)) {
            return { next: current, result: null };
          }
          return { next: [...current, supplier], result: null };
        },
        `Create supplier profile ${user.id}`,
      );
    }

    await setSession({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      ...(role === "SUPPLIER" ? { supplierId: userId } : {}),
    });
    try {
      await mergeGuestCartIntoUser(user.id);
    } catch (error) {
      console.error("mergeGuestCartIntoUser failed", error);
    }
    await trackServerEvent("REGISTER");
    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_PHONE") {
      return failure("DUPLICATE_PHONE", "این شماره موبایل قبلاً ثبت شده است", 409);
    }
    console.error("POST /api/auth/register", error);
    return failure("REGISTER_ERROR", "ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.", 500);
  }
}
