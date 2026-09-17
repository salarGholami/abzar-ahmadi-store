import { NextResponse } from "next/server";
import { mergeGuestCartIntoUser } from "@/lib/cart";
import { trackServerEvent } from "@/lib/events";
import { setSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isPublicRole } from "@/lib/roles";
import { createUserWithProfile } from "@/lib/user-provisioning";

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
    const role = typeof body?.role === "string" ? body.role.toUpperCase() : "";

    // ADMIN can never be requested through public registration.
    if (!isPublicRole(role)) {
      return failure("INVALID_ROLE", "نوع حساب را مشخص کنید: تأمین‌کننده یا مشتری", 400);
    }
    if (!name || !phone || password.length < 8 || password.length > 128) {
      return failure("VALIDATION_ERROR", "نام، شماره موبایل معتبر و رمز عبور (حداقل ۸ کاراکتر) الزامی است", 400);
    }

    const user = await createUserWithProfile({ name, phone, password, role });

    await setSession({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isOwner: false,
      permissions: user.permissions || [],
      ...(user.supplierId ? { supplierId: user.supplierId } : {}),
    });

    try {
      await mergeGuestCartIntoUser(user.id);
    } catch (error) {
      console.error("mergeGuestCartIntoUser failed", error);
    }
    await trackServerEvent("REGISTER");

    return NextResponse.json({ success: true, data: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_PHONE") {
      return failure("DUPLICATE_PHONE", "این شماره موبایل قبلاً ثبت شده است", 409);
    }
    console.error("POST /api/auth/register", error);
    return failure("REGISTER_ERROR", "ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.", 500);
  }
}
