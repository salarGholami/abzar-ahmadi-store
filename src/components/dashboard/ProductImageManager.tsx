"use client";

import Image from "next/image";
import { Check, ImagePlus, Loader2, Pencil, Star, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ProductImage } from "@/lib/types";

type Props = { productId?: string; images: ProductImage[]; onChange: (images: ProductImage[]) => void; onPendingFiles?: (files: File[]) => void };

export default function ProductImageManager({ productId, images, onChange, onPendingFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altValue, setAltValue] = useState("");

  async function upload(files: File[]) {
    if (!files.length) return;
    setError("");
    if (!productId) {
      setPreviews(files.map((file) => URL.createObjectURL(file)));
      onPendingFiles?.(files);
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      const response = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "آپلود تصاویر انجام نشد.");
      onChange(result.data);
    } catch (e) { setError(e instanceof Error ? e.message : "خطا در آپلود تصویر."); }
    finally { setUploading(false); }
  }

  async function patchImage(imageId: string, patch: { makePrimary?: boolean; alt?: string }) {
    if (!productId) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageId, ...patch }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "ویرایش تصویر انجام نشد.");
      onChange(result.data);
      setEditingAlt(null);
    } catch (e) { setError(e instanceof Error ? e.message : "خطا در ویرایش تصویر."); }
  }

  async function setPrimary(imageId: string) {
    await patchImage(imageId, { makePrimary: true });
  }

  function startAltEdit(image: ProductImage) {
    setEditingAlt(image.id);
    setAltValue(image.alt || "");
    setError("");
  }

  async function remove(imageId: string) {
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageId }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "حذف تصویر انجام نشد.");
      onChange(result.data);
    } catch (e) { setError(e instanceof Error ? e.message : "خطا در حذف تصویر."); }
  }

  const allPreviews = productId ? images.map((image) => image.url) : [...images.map((image) => image.url), ...previews];
  return (
    <div className="sm:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="font-black">گالری محصول</div><div className="mt-1 text-xs text-[var(--muted)]">تصویر اول اصلی است و تصویر دوم هنگام Hover کارت نمایش داده می‌شود.</div></div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn btn-primary disabled:opacity-60"><UploadCloud size={16} />{uploading ? "در حال آپلود..." : "افزودن تصاویر"}</button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []).slice(0, 8); void upload(files); e.currentTarget.value = ""; }} />
      </div>
      {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      {allPreviews.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {allPreviews.map((url, index) => {
            const image = images[index];
            return <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <Image src={url} alt="" fill unoptimized className="object-cover" />
              <div className="absolute inset-x-2 top-2 flex items-center justify-between">
                {index === 0 && <span className="badge bg-black/70 text-white"><Star size={12} /> اصلی</span>}
                {productId && image && <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  {index !== 0 && <button type="button" onClick={() => void setPrimary(image.id)} className="grid size-8 place-items-center rounded-full bg-black/70 text-white" aria-label="تصویر اصلی"><Star size={14} /></button>}
                  <button type="button" onClick={() => startAltEdit(image)} className="grid size-8 place-items-center rounded-full bg-black/70 text-white" aria-label="ویرایش توضیح تصویر"><Pencil size={14} /></button>
                  <button type="button" onClick={() => void remove(image.id)} className="grid size-8 place-items-center rounded-full bg-black/70 text-white" aria-label="حذف تصویر"><Trash2 size={14} /></button>
                </div>}
              </div>
              {editingAlt === image?.id && <div className="absolute inset-x-2 bottom-2 z-10 rounded-xl bg-black/85 p-2" onClick={(e) => e.stopPropagation()}>
                <input autoFocus value={altValue} onChange={(e) => setAltValue(e.target.value)} className="w-full rounded-lg bg-white px-2 py-1.5 text-xs text-black outline-none" placeholder="توضیح تصویر" />
                <div className="mt-1.5 flex gap-1">
                  <button type="button" onClick={() => void patchImage(image.id, { alt: altValue.trim() })} className="grid size-7 place-items-center rounded-lg bg-emerald-500 text-white" aria-label="ذخیره"><Check size={14} /></button>
                  <button type="button" onClick={() => setEditingAlt(null)} className="grid size-7 place-items-center rounded-lg bg-white/20 text-white" aria-label="لغو"><X size={14} /></button>
                </div>
              </div>}
              {index === 1 && <div className="absolute bottom-2 right-2 badge bg-black/70 text-white">Hover</div>}
            </div>;
          })}
        </div>
      ) : <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 grid min-h-36 w-full place-items-center rounded-2xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted)]"><span><ImagePlus className="mx-auto mb-2" size={28} />تصاویر محصول را انتخاب کنید</span></button>}
      {uploading && <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]"><Loader2 className="animate-spin" size={14} />تصاویر در حال ذخیره در Backend هستند...</div>}
    </div>
  );
}
