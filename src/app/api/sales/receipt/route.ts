import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { uploadMedia } from "@/lib/media";

export async function POST(req: Request) {
  try {
    const session = await requirePermission("sales.create");
    if (session.role !== "CUSTOMER") throw new Error("ONLY_CUSTOMER_RECEIPT");
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("فایل رسید ارسال نشده است.");
    return ok(await uploadMedia(file, "receipts", session.id), 201);
  } catch (error) { return fail(error); }
}
