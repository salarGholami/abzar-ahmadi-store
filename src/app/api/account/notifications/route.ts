import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getJson, mutateJson } from "@/lib/github";
import type { StoreNotification } from "@/lib/types";

const isVisibleTo = (notification: StoreNotification, userId: string) => !notification.userId || notification.userId === userId;

const isReadBy = (notification: StoreNotification, userId: string) =>
  notification.userId ? Boolean(notification.read) : (notification.readBy ?? []).includes(userId);

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const file = await getJson<StoreNotification[]>("notifications.json", []);
  const data = file.data
    .filter((item) => isVisibleTo(item, session.id))
    .map((item) => ({ ...item, read: isReadBy(item, session.id) }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  let id = "";
  try {
    const body = (await req.json()) as { id?: unknown };
    id = typeof body.id === "string" ? body.id : "";
  } catch {
    return NextResponse.json({ success: false, error: { message: "درخواست نامعتبر است." } }, { status: 400 });
  }
  if (!id) return NextResponse.json({ success: false, error: { message: "شناسه اعلان الزامی است." } }, { status: 400 });

  await mutateJson<StoreNotification[], null>(
    "notifications.json",
    [],
    (all) => ({
      next: all.map((item) => {
        if (item.id !== id || !isVisibleTo(item, session.id)) return item;
        if (item.userId) return { ...item, read: true };
        const readBy = item.readBy ?? [];
        return readBy.includes(session.id) ? item : { ...item, readBy: [...readBy, session.id] };
      }),
      result: null,
    }),
    `Read notification ${id}`,
  );

  return NextResponse.json({ success: true });
}
