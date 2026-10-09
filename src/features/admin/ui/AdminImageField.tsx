"use client";

import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

type Purpose = "CATEGORY" | "BRAND" | "BANNER" | "PRODUCT" | "ARTICLE" | "SUPPORT";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  purpose?: Purpose;
  label?: string;
  emptyHint?: string;
};

export default function AdminImageField({
  value,
  onChange,
  disabled = false,
  purpose = "CATEGORY",
  label = "تصویر",
  emptyHint = "اگر تصویری انتخاب نشود، بدون خطا جایگزین نمایش داده می‌شود.",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState(false);

  const hasImage = Boolean(value && String(value).trim() && !broken);

  async function uploadFile(file: File) {
    if (disabled) return;

    setError("");
    setBroken(false);

    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویری مجاز است.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حداکثر حجم تصویر ۵ مگابایت است.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", purpose);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || payload?.error || "آپلود تصویر ناموفق بود.",
        );
      }

      const url =
        payload?.data?.url ||
        payload?.url ||
        (typeof payload?.data === "string" ? payload.data : null);

      if (!url || typeof url !== "string") {
        throw new Error("پاسخ سرور معتبر نیست.");
      }

      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود تصویر.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function onFiles(files: FileList | File[] | null) {
    const list = files ? Array.from(files) : [];
    if (list[0]) {
      void uploadFile(list[0]);
    }
  }

  function clearImage() {
    if (disabled || uploading) return;
    setError("");
    setBroken(false);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="field-label mb-0">{label}</label>
        <span className="text-[10px] font-bold text-[var(--muted)]">اختیاری</span>
      </div>

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || uploading) return;
          onFiles(e.dataTransfer.files);
        }}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition
          ${
            dragOver
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--border)] bg-[var(--surface-2)]"
          }
          ${disabled ? "opacity-60" : ""}
        `}
      >
        {hasImage ? (
          <div className="relative">
            <div className="aspect-[16/10] w-full bg-[var(--surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value!}
                alt={label}
                className="h-full w-full object-contain p-3"
                onError={() => setBroken(true)}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] font-black text-[var(--text)] shadow-sm transition hover:bg-white disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ImagePlus size={14} />
                )}
                تعویض تصویر
              </button>

              <button
                type="button"
                disabled={disabled || uploading}
                onClick={clearImage}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/90 px-3 py-1.5 text-[11px] font-black text-white shadow-sm transition hover:bg-red-500 disabled:opacity-50"
              >
                <Trash2 size={14} />
                حذف
              </button>
            </div>

            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-black/40">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-[var(--text)] shadow-lg">
                  <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                  در حال آپلود...
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 px-4 py-10 text-center transition hover:bg-[var(--primary)]/[0.03] disabled:cursor-not-allowed"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              {uploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <UploadCloud size={24} />
              )}
            </span>

            <div>
              <p className="text-sm font-black text-[var(--text)]">
                {uploading ? "در حال آپلود تصویر..." : `آپلود ${label}`}
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                بکشید و رها کنید یا کلیک کنید · JPG, PNG, WEBP · حداکثر ۵ مگابایت
              </p>
            </div>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p className="text-[10px] text-[var(--muted)]">{emptyHint}</p>
      )}
    </div>
  );
}
