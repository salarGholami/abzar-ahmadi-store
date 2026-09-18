import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
import { setSession, verifyPassword } from "@/lib/auth";
import { permissions } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "شماره موبایل و رمز عبور الزامی است" } }, { status: 400 });
    }

    const { data } = await getJson<any[]>("users.json", []);
    const user = data.find((item) => item.phone === phone);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "شماره موبایل یا رمز عبور اشتباه است" } }, { status: 401 });
    }

    // Legacy staff roles are intentionally normalized to the single ADMIN role.
    const role = user.role === "CUSTOMER" ? "CUSTOMER" : "ADMIN";
    const userPermissions = role === "ADMIN"
      ? ["*"]
      : (user.permissions || [...permissions.CUSTOMER]);

    await setSession({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role,
      permissions: userPermissions
    });

    return NextResponse.json({ success: true, data: { id: user.id, name: user.name, role } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای ورود";
    return NextResponse.json({ success: false, error: { code: "LOGIN_ERROR", message } }, { status: 500 });
  }
}
