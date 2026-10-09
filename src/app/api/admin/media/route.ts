import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { uploadMedia } from "@/lib/media";
import type { MediaAsset } from "@/lib/types";
import { mediaAssetRepo } from "@/lib/repositories";

const folders = new Set<MediaAsset["purpose"]>(["PRODUCT", "RECEIPT", "BANNER", "ARTICLE", "SUPPORT", "CATEGORY", "BRAND"]);
const folderMap: Record<string, "products" | "receipts" | "banners" | "articles" | "support" | "categories"> = { PRODUCT: "products", RECEIPT: "receipts", BANNER: "banners", ARTICLE: "articles", SUPPORT: "support", CATEGORY: "categories", BRAND: "brands" };
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const purpose = String(form.get("purpose") || "").toUpperCase() as MediaAsset["purpose"];
    if (!(file instanceof File) || !folders.has(purpose)) throw new Error("VALIDATION_ERROR");
    // CATEGORY uploads are managed with products permission; other media with settings
    const session =
      purpose === "CATEGORY" || purpose === "BRAND"
        ? await requirePermission("products.update")
        : await requirePermission("settings");
    return ok(await uploadMedia(file, folderMap[purpose], session.id), 201);
  } catch(e) { return fail(e); }
}

export async function GET() { try { await requirePermission("settings"); return ok(await mediaAssetRepo.all()); } catch(e) { return fail(e); } }
