import "server-only";

import { cookies } from "next/headers";
import { getJson, mutateJson } from "./github";
import { getSession } from "./auth";
import type { CartLine, PersistedCart, Product } from "./types";

const GUEST_COOKIE = "abzar_guest_id";

type CartOwner = {
  type: "USER" | "GUEST";
  id: string;
};

async function getOwner(): Promise<{ owner: CartOwner; guestIdCreated: string | null }> {
  const session = await getSession();
  if (session) return { owner: { type: "USER", id: session.id }, guestIdCreated: null };

  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (existing) return { owner: { type: "GUEST", id: existing }, guestIdCreated: null };

  const id = crypto.randomUUID();
  store.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 90 * 86400,
  });
  return { owner: { type: "GUEST", id }, guestIdCreated: id };
}

function toView(cart: PersistedCart, products: Product[]) {
  return cart.lines
    .map((line) => {
      const product = products.find((item) => item.id === line.productId);
      if (!product) return null;
      const unitPrice = Math.round(product.price * (1 - Number(product.discount || 0) / 100));
      return {
        productId: product.id,
        title: product.title,
        sku: product.sku,
        image: product.image,
        unitPrice,
        stock: Number(product.stock),
        qty: Math.min(Number(line.quantity), Number(product.stock)),
      };
    })
    .filter(Boolean);
}

export async function getCart() {
  const { owner } = await getOwner();
  const [cartFile, productsFile] = await Promise.all([
    getJson<PersistedCart[]>("carts.json", []),
    getJson<Product[]>("products.json", []),
  ]);

  let cart = cartFile.data.find((item) => item.ownerType === owner.type && item.ownerId === owner.id);
  if (!cart) {
    cart = {
      id: crypto.randomUUID(),
      ownerType: owner.type,
      ownerId: owner.id,
      lines: [],
      updatedAt: new Date().toISOString(),
    };
  }

  return { owner, cart, lines: toView(cart, productsFile.data) };
}

export async function mutateCart(action: "ADD" | "SET" | "REMOVE" | "CLEAR", productId?: string, quantity?: number) {
  const { owner } = await getOwner();
  const products = (await getJson<Product[]>("products.json", [])).data;
  const product = productId ? products.find((item) => item.id === productId) : null;

  if (action !== "CLEAR" && !product) throw new Error("PRODUCT_NOT_FOUND");
  if (action !== "CLEAR" && action !== "REMOVE" && quantity !== undefined && !Number.isFinite(Number(quantity))) {
    throw new Error("INVALID_QUANTITY");
  }

  const now = new Date().toISOString();

  const cart = await mutateJson<PersistedCart[], PersistedCart>(
    "carts.json",
    [],
    (all) => {
      const existing = all.find((item) => item.ownerType === owner.type && item.ownerId === owner.id);
      const base: PersistedCart = existing || {
        id: crypto.randomUUID(),
        ownerType: owner.type,
        ownerId: owner.id,
        lines: [],
        updatedAt: now,
      };

      let lines = [...base.lines];
      if (action === "CLEAR") {
        lines = [];
      } else if (action === "REMOVE") {
        lines = lines.filter((line) => line.productId !== productId);
      } else {
        const index = lines.findIndex((line) => line.productId === productId);
        const requested = action === "ADD"
          ? Number(lines[index]?.quantity || 0) + Math.floor(Number(quantity || 1))
          : Math.floor(Number(quantity || 0));
        if (!Number.isFinite(requested) || requested <= 0 || Number(product!.stock) <= 0) {
          lines = lines.filter((line) => line.productId !== productId);
        } else {
          const line: CartLine = {
            productId: product!.id,
            quantity: Math.min(requested, Number(product!.stock)),
            createdAt: lines[index]?.createdAt || now,
            updatedAt: now,
          };
          lines = index < 0 ? [...lines, line] : lines.map((item, i) => (i === index ? line : item));
        }
      }

      const next: PersistedCart = { ...base, lines, updatedAt: now };
      const nextAll = existing
        ? all.map((item) => (item === existing ? next : item))
        : [...all, next];
      return { next: nextAll, result: next };
    },
    `Cart ${action.toLowerCase()} ${owner.id}`,
  );

  return { owner, cart, lines: toView(cart, products) };
}

export async function mergeGuestCartIntoUser(userId: string) {
  const store = await cookies();
  const guestId = store.get(GUEST_COOKIE)?.value;
  if (!guestId) return;

  const now = new Date().toISOString();
  await mutateJson<PersistedCart[], null>(
    "carts.json",
    [],
    (all) => {
      const guest = all.find((item) => item.ownerType === "GUEST" && item.ownerId === guestId);
      if (!guest) return { next: all, result: null };

      const userCart = all.find((item) => item.ownerType === "USER" && item.ownerId === userId);
      const merged = [...(userCart?.lines || [])];
      for (const guestLine of guest.lines) {
        const index = merged.findIndex((item) => item.productId === guestLine.productId);
        if (index < 0) merged.push(guestLine);
        else merged[index] = { ...merged[index], quantity: merged[index].quantity + guestLine.quantity, updatedAt: now };
      }

      const nextUser: PersistedCart = userCart
        ? { ...userCart, lines: merged, updatedAt: now }
        : { id: crypto.randomUUID(), ownerType: "USER", ownerId: userId, lines: merged, updatedAt: now };

      const withoutGuest = all.filter((item) => item !== guest);
      const next = userCart
        ? withoutGuest.map((item) => (item === userCart ? nextUser : item))
        : [...withoutGuest, nextUser];
      return { next, result: null };
    },
    `Merge guest cart into user ${userId}`,
  );
}
