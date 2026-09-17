import { ok, fail } from "@/lib/http";
import { requireRole } from "@/lib/permissions";
import { uploadMedia } from "@/lib/media";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("فایل رسید ارسال نشده است.");
    return ok(await uploadMedia(file, "receipts", id), 201);
  } catch (error) { return fail(error); }
}
