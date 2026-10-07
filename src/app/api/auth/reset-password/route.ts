import { NextResponse } from "next/server";
import { mutateJson, getJson } from "@/lib/github";
import { hashPassword } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { timingSafeEqual } from "node:crypto";
import type { AppUser } from "@/lib/types";

/**
 * MVP password reset:
 * - Shared recovery code from env `PASSWORD_RESET_CODE` (store staff gives it to the user).
 * - Updates the account in `users.json` or `admins.json` (whichever holds the phone).
 * - No SMS/email provider required for MVP.
 */

function failure(code: string, message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ success: false, error: { code, message } }, { status, headers });
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function updatePasswordInFile(path: "users.json" | "admins.json", phone: string, passwordHash: string) {
  let found = false;
  await mutateJson<AppUser[], null>(
    path,
    [],
    (current) => {
      const index = current.findIndex((item) => item.phone === phone);
      if (index < 0) {
        return { next: current, result: null };
      }
      found = true;
      const next = current.map((item, i) =>
        i === index
          ? { ...item, passwordHash, updatedAt: new Date().toISOString() }
          : item,
      );
      return { next, result: null };
    },
    `MVP reset password for ${phone} in ${path}`,
  );
  return found;
}

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`reset:${clientIp(req)}`, 8, 15 * 60 * 1000);
    if (!limit.allowed) {
      return failure("RATE_LIMITED", "تعداد تلاش‌ها زیاد است. کمی بعد دوباره تلاش کنید.", 429, {
        "Retry-After": String(limit.retryAfter ?? 60),
      });
    }

    const body = (await req.json().catch(() => null)) as {
      phone?: unknown;
      code?: unknown;
      newPassword?: unknown;
    } | null;

    const phone = normalizePhone(body?.phone);
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!phone) {
      return failure("VALIDATION_ERROR", "شماره موبایل معتبر وارد کنید", 400);
    }
    if (!code) {
      return failure("VALIDATION_ERROR", "کد بازیابی الزامی است", 400);
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      return failure("VALIDATION_ERROR", "رمز جدید باید بین ۸ تا ۱۲۸ کاراکتر باشد", 400);
    }

    const expected = (process.env.PASSWORD_RESET_CODE || "").trim();
    if (!expected || !safeEqual(code, expected)) {
      return failure("INVALID_RESET_CODE", "کد بازیابی صحیح نیست", 403);
    }

    const passwordHash = hashPassword(newPassword);

    // Prefer the file that already holds this phone (admin may live in either store).
    const [usersFile, adminsFile] = await Promise.all([
      getJson<AppUser[]>("users.json", [], { cache: false }),
      getJson<AppUser[]>("admins.json", [], { cache: false }),
    ]);

    const inUsers = usersFile.data.some((u) => u.phone === phone);
    const inAdmins = adminsFile.data.some((u) => u.phone === phone);

    if (!inUsers && !inAdmins) {
      return failure("USER_NOT_FOUND", "حسابی با این شماره موبایل یافت نشد", 404);
    }

    if (inAdmins) {
      await updatePasswordInFile("admins.json", phone, passwordHash);
    }
    if (inUsers) {
      await updatePasswordInFile("users.json", phone, passwordHash);
    }

    return NextResponse.json({
      success: true,
      data: { reset: true, phone },
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password", error);
    return failure("RESET_ERROR", "بازیابی رمز انجام نشد. لطفاً دوباره تلاش کنید.", 500);
  }
}
