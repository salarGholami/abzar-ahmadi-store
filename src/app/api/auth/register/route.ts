import { NextResponse } from "next/server";
import { getJson, writeJson } from "@/lib/github";
import { setSession, hashPassword } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import type { AppUser } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();
    if (!name || !phone || !password || String(password).length < 8) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "نام، شماره موبایل و رمز عبور (حداقل ۸ کاراکتر) الزامی است" } }, { status: 400 });
    }
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "شماره موبایل معتبر نیست" } }, { status: 400 });
    }
    const f = await getJson<AppUser[]>("users.json", []);
    if (f.data.some((u) => u.phone === phone)) {
      return NextResponse.json({ success: false, error: { code: "DUPLICATE_PHONE", message: "این شماره موبایل قبلاً ثبت شده است" } }, { status: 409 });
    }
    const user: AppUser = {
      id: crypto.randomUUID(),
      name,
      phone,
      role: "CUSTOMER",
      permissions: [...permissions.CUSTOMER],
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await writeJson("users.json", [...f.data, user], `Register user ${user.id}`, f.sha || undefined);
    await setSession({ id: user.id, phone: user.phone, name: user.name, role: user.role, permissions: user.permissions || [] });
    return NextResponse.json({ success: true, data: { id: user.id, name: user.name, role: user.role } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: "REGISTER_ERROR", message: e.message } }, { status: 500 });
  }
}
