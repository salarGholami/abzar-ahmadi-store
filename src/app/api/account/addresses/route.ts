import { ok, fail } from "@/lib/http";
import { getSession } from "@/lib/auth";
import { mutateJson, getJson } from "@/lib/github";
import { normalizePhone } from "@/lib/phone";
import type { CustomerAddress, Customer } from "@/lib/types";

const FILE = "customer-addresses.json";
const MAX_ADDRESSES = 10;

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function clean(body: Record<string, unknown>) {
  const digits = text(body.postalCode, 20).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const value = {
    title: text(body.title, 60) || "آدرس من",
    recipientName: text(body.recipientName, 100),
    phone: normalizePhone(body.phone),
    province: text(body.province, 60),
    city: text(body.city, 60),
    address: text(body.address, 500),
    postalCode: digits,
  };
  if (!value.recipientName || !value.province || !value.city || !value.address) throw new Error("اطلاعات کامل آدرس را وارد کنید.");
  if (!value.phone) throw new Error("شماره موبایل گیرنده معتبر نیست.");
  if (!/^\d{10}$/.test(value.postalCode)) throw new Error("کد پستی باید ۱۰ رقم باشد.");
  return value;
}

/** Sync default address into the admin-visible customers.json record. */
async function syncCustomerAddress(userId: string, phone: string, addressLine: string) {
  try {
    await mutateJson<Customer[], null>(
      "customers.json",
      [],
      (current) => {
        const idx = current.findIndex((c) => c.userId === userId || c.phone === phone);
        if (idx === -1) return { next: current, result: null };
        const next = [...current];
        next[idx] = {
          ...next[idx],
          address: addressLine,
          updatedAt: new Date().toISOString(),
        };
        return { next, result: null };
      },
      `Sync customer address for ${userId}`,
    );
  } catch (e) {
    console.error("syncCustomerAddress failed", e);
  }
}

export async function GET() {
  try {
    const session = await requireUser();
    const file = await getJson<CustomerAddress[]>(FILE, []);
    const list = file.data
      .filter((item) => item.userId === session.id)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.updatedAt.localeCompare(a.updatedAt));
    return ok(list);
  } catch (error) {
    return fail(error);
  }
}

/** Creates an address, or refreshes an identical one (idempotent so checkout can safely call it). */
export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) throw new Error("VALIDATION_ERROR");
    const value = clean(body);
    const makeDefault = body.isDefault !== false;

    const saved = await mutateJson<CustomerAddress[], CustomerAddress>(
      FILE,
      [],
      (all) => {
        const timestamp = new Date().toISOString();
        const mine = all.filter((item) => item.userId === session.id);
        const duplicate = mine.find(
          (item) => item.address === value.address && item.postalCode === value.postalCode && item.recipientName === value.recipientName,
        );
        if (!duplicate && mine.length >= MAX_ADDRESSES) throw new Error("حداکثر ۱۰ آدرس می‌توانید ذخیره کنید.");

        const record: CustomerAddress = duplicate
          ? { ...duplicate, ...value, isDefault: makeDefault || duplicate.isDefault, updatedAt: timestamp }
          : { id: crypto.randomUUID(), userId: session.id, ...value, isDefault: makeDefault || mine.length === 0, createdAt: timestamp, updatedAt: timestamp };

        const rest = all.filter((item) => item.id !== record.id);
        const normalized = record.isDefault
          ? rest.map((item) => (item.userId === session.id ? { ...item, isDefault: false } : item))
          : rest;
        return { next: [...normalized, record], result: record };
      },
      `Save address for ${session.id}`,
    );

    // Share default address with admin CMS (customers section)
    if (saved.isDefault) {
      const fullAddress = `${saved.province}، ${saved.city}، ${saved.address} (کدپستی: ${saved.postalCode})`;
      await syncCustomerAddress(session.id, session.phone, fullAddress);
    }

    return ok(saved, 201);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireUser();
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!id) throw new Error("VALIDATION_ERROR");
    await mutateJson<CustomerAddress[], null>(
      FILE,
      [],
      (all) => {
        if (!all.some((item) => item.id === id && item.userId === session.id)) throw new Error("NOT_FOUND");
        const rest = all.filter((item) => item.id !== id);
        const mine = rest.filter((item) => item.userId === session.id);
        const next = mine.length && !mine.some((item) => item.isDefault)
          ? rest.map((item) => (item.id === mine[0].id ? { ...item, isDefault: true } : item))
          : rest;
        return { next, result: null };
      },
      `Delete address ${id}`,
    );
    return ok({ id, deleted: true });
  } catch (error) {
    return fail(error);
  }
}
