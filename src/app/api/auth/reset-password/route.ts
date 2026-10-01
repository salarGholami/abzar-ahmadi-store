import { NextResponse } from "next/server";
import { mutateJson } from "@/lib/github";
import { hashPassword } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { timingSafeEqual } from "node:crypto";
import type { AppUser } from "@/lib/types";

function failure(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`reset:${clientIp(req)}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) return failure("RATE_LIMITED", "تعداد تلاش‌ها زیاد است. کمی بعد دوباره تلاش کنید.", 429);

    const body = (await req.json().catch(() => null)) as { phone?: unknown; code?: unknown; newPassword?: unknown } | null;
    const phone = normalizePhone(body?.phone);
    const code = typeof body?.code === "string" ? body.code : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!phone || !code || newPassword.length < 8 || newPassword.length > 128) {
      return failure("VALIDATION_ERROR", "اطلاعات یا رمز جدید نامعتبر است", 400);
    }
    const expected = process.env.PASSWORD_RESET_CODE || "";
    if (!expected || !safeEqual(code, expected)) {
      return failure("INVALID_RESET_CODE", "کد بازیابی صحیح نیست", 403);
    }

    await mutateJson<AppUser[], null>(
      "users.json",
      [],
      (current) => {
        const index = current.findIndex((item) => item.phone === phone);
        if (index < 0) throw new Error("USER_NOT_FOUND");
        const next = current.map((item, i) =>
          i === index ? { ...item, passwordHash: hashPassword(newPassword), updatedAt: new Date().toISOString() } : item,
        );
        return { next, result: null };
      },
      `Reset password ${phone}`,
    );
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return failure("USER_NOT_FOUND", "کاربر پیدا نشد", 404);
    }
    console.error("POST /api/auth/reset-password", error);
    return failure("RESET_ERROR", "بازیابی رمز انجام نشد.", 500);
  }
}
