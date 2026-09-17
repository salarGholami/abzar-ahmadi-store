import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import { uploadMedia, deleteMedia } from "@/lib/media";
import type { Product, ProductImage } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("products.update");
    const { id } = await params;
    const form = await req.formData();
    const files = form.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
    if (!files.length) throw new Error("حداقل یک تصویر انتخاب کنید.");
    const products = await getJson<Product[]>("products.json", []);
    const product = products.data.find((item) => item.id === id);
    if (!product) throw new Error("NOT_FOUND");
    const current = product.images?.length ? product.images : product.image ? [{ id: `legacy-${id}`, url: product.image, alt: product.title, position: 0, createdAt: product.createdAt || new Date(0).toISOString() }] : [];
    const uploaded: ProductImage[] = [];
    for (const file of files.slice(0, 8)) {
      const media = await uploadMedia(file, "products", id);
      uploaded.push({ id: crypto.randomUUID(), url: media.url, path: media.path, alt: product.title, position: current.length + uploaded.length, createdAt: new Date().toISOString() });
    }
    const images = [...current, ...uploaded].map((image, position) => ({ ...image, position }));
    const next = products.data.map((item) => item.id === id ? { ...item, image: images[0]?.url || "", images, updatedAt: new Date().toISOString() } : item);
    await writeJson("products.json", next, `Add product images ${id}`, products.sha || undefined);
    return ok(images, 201);
  } catch (error) { return fail(error); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("products.update");
    const { id } = await params;
    const body = await req.json() as { imageId?: string };
    if (!body.imageId) throw new Error("IMAGE_ID_REQUIRED");
    const products = await getJson<Product[]>("products.json", []);
    const product = products.data.find((item) => item.id === id);
    if (!product) throw new Error("NOT_FOUND");
    const current = product.images || [];
    if (!current.some((image) => image.id === body.imageId)) throw new Error("IMAGE_NOT_FOUND");
    const images = [current.find((image) => image.id === body.imageId)!, ...current.filter((image) => image.id !== body.imageId)].map((image, position) => ({ ...image, position }));
    const next = products.data.map((item) => item.id === id ? { ...item, image: images[0]?.url || "", images, updatedAt: new Date().toISOString() } : item);
    await writeJson("products.json", next, `Set primary product image ${id}/${body.imageId}`, products.sha || undefined);
    return ok(images);
  } catch (error) { return fail(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("products.update");
    const { id } = await params;
    const body = await req.json() as { imageId?: string };
    if (!body.imageId) throw new Error("IMAGE_ID_REQUIRED");
    const products = await getJson<Product[]>("products.json", []);
    const product = products.data.find((item) => item.id === id);
    if (!product) throw new Error("NOT_FOUND");
    const current = product.images || [];
    const target = current.find((image) => image.id === body.imageId);
    if (!target) throw new Error("IMAGE_NOT_FOUND");
    if (current.length <= 1) throw new Error("آخرین تصویر محصول قابل حذف نیست.");
    const images = current.filter((image) => image.id !== body.imageId).map((image, position) => ({ ...image, position }));
    const next = products.data.map((item) => item.id === id ? { ...item, image: images[0]?.url || "", images, updatedAt: new Date().toISOString() } : item);
    await writeJson("products.json", next, `Delete product image ${id}/${body.imageId}`, products.sha || undefined);
    if (target.path) await deleteMedia(target.path).catch(() => undefined);
    return ok(images);
  } catch (error) { return fail(error); }
}
