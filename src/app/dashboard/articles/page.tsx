"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Eye, FileText, Globe, Image as ImageIcon, Pencil, Plus, RefreshCw, Search, Send, Settings2, Trash2 } from "lucide-react";
import type { StoreArticle } from "@/lib/types";
import { useAdminCollection, useAdminCrud } from "@/features/admin/hooks";
import ArticleRichTextEditor from "@/features/admin/ui/ArticleRichTextEditor";
import { DashboardBreadcrumb, DashboardHero } from "@/features/admin/ui/DashboardUI";
import AdminImageField from "@/features/admin/ui/AdminImageField";

type ArticleForm = {
  title: string; slug: string; excerpt: string; content: string; contentHtml: string;
  category: string; tags: string; image: string; imageAlt: string; imageCaption: string;
  author: string; metaTitle: string; metaDescription: string; canonicalUrl: string;
  readingMinutes: string; publishedAt: string; active: boolean; noIndex: boolean;
};
const emptyForm: ArticleForm = {
  title: "", slug: "", excerpt: "", content: "", contentHtml: "<p>محتوای مقاله را از اینجا بنویسید...</p>",
  category: "راهنمای خرید", tags: "", image: "", imageAlt: "", imageCaption: "", author: "تحریریه ابزار احمدی",
  metaTitle: "", metaDescription: "", canonicalUrl: "", readingMinutes: "5", publishedAt: new Date().toISOString().slice(0, 10), active: false, noIndex: false,
};
const categories = ["راهنمای خرید", "آموزش ابزار", "بررسی تخصصی", "نگهداری و ایمنی", "مقایسه محصولات", "اخبار و مقالات"];
const slugify = (value: string) => value.trim().toLowerCase().replace(/[\u200c\s]+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");

export default function ArticlesPage() {
  const query = useAdminCollection<StoreArticle>("articles", { page: 1, pageSize: 100 });
  const crud = useAdminCrud();
  const rows = query.data?.items ?? [];
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StoreArticle | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [autoSlug, setAutoSlug] = useState(true);
  const [tab, setTab] = useState<"content" | "seo" | "media">("content");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const saving = crud.isPending;
  const filtered = useMemo(() => rows.filter((row) => `${row.title} ${row.slug} ${row.category || ""}`.toLocaleLowerCase("fa").includes(search.toLocaleLowerCase("fa"))), [rows, search]);
  const published = rows.filter((row) => row.active).length;
  const drafts = rows.length - published;

  const setField = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  function openCreate() {
    setEditing(null); setForm({ ...emptyForm, publishedAt: new Date().toISOString().slice(0, 10) });
    setAutoSlug(true); setTab("content"); setError(""); setSuccess(""); setModalOpen(true);
  }
  function openEdit(article: StoreArticle) {
    setEditing(article);
    setForm({
      title: article.title || "", slug: article.slug || "", excerpt: article.excerpt || "", content: article.content || "",
      contentHtml: article.contentHtml || (article.content ? `<p>${article.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "</p><p>")}</p>` : "<p></p>"),
      category: article.category || "راهنمای خرید", tags: (article.tags || []).join(", "), image: article.image || "", imageAlt: article.imageAlt || "",
      imageCaption: article.imageCaption || "", author: article.author || "تحریریه ابزار احمدی", metaTitle: article.metaTitle || "",
      metaDescription: article.metaDescription || article.excerpt || "", canonicalUrl: article.canonicalUrl || "",
      readingMinutes: String(article.readingMinutes || 5), publishedAt: (article.publishedAt || article.createdAt || "").slice(0, 10),
      active: Boolean(article.active), noIndex: Boolean(article.noIndex),
    });
    setAutoSlug(false); setTab("content"); setError(""); setSuccess(""); setModalOpen(true);
  }
  async function saveArticle() {
    setError(""); setSuccess("");
    if (!form.title.trim() || !form.slug.trim()) { setError("عنوان و اسلاگ مقاله الزامی است."); setTab("content"); return; }
    if (!form.contentHtml.replace(/<[^>]+>/g, "").trim() && !form.content.trim()) { setError("محتوای مقاله را وارد کنید."); setTab("content"); return; }
    const payload: Record<string, unknown> = {
      title: form.title.trim(), slug: slugify(form.slug), excerpt: form.excerpt.trim(), content: form.content.trim(),
      contentHtml: form.contentHtml, category: form.category, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      image: form.image.trim(), imageAlt: form.imageAlt.trim(), imageCaption: form.imageCaption.trim(), author: form.author.trim(),
      metaTitle: form.metaTitle.trim() || form.title.trim(), metaDescription: form.metaDescription.trim() || form.excerpt.trim(),
      canonicalUrl: form.canonicalUrl.trim(), readingMinutes: Math.max(1, Number(form.readingMinutes) || 1),
      publishedAt: form.publishedAt ? new Date(`${form.publishedAt}T09:00:00`).toISOString() : new Date().toISOString(),
      active: form.active, noIndex: form.noIndex,
    };
    try {
      await crud.mutateAsync({ collection: "articles", action: editing ? "update" : "create", id: editing?.id, payload });
      await query.refetch();
      setSuccess("مقاله با موفقیت در مخزن داده ذخیره شد.");
      setModalOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ذخیره مقاله ناموفق بود. اتصال و مجوزهای داشبورد را بررسی کنید.");
    }
  }
  async function removeArticle(article: StoreArticle) {
    if (!window.confirm(`مقاله «${article.title}» حذف شود؟ این عملیات قابل بازگشت نیست.`)) return;
    try { await crud.mutateAsync({ collection: "articles", action: "delete", id: article.id }); await query.refetch(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "حذف مقاله انجام نشد."); }
  }

  return <main dir="rtl" className="mx-auto w-full max-w-[1650px] space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"><DashboardBreadcrumb current="مدیریت مجله و مقالات" /><button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="btn btn-secondary"><RefreshCw size={15} className={query.isFetching ? "animate-spin" : ""}/> بروزرسانی</button></div>
    <DashboardHero eyebrow="مدیریت محتوا و سئو" title="استودیوی انتشار مقالات" description="مدیریت چرخه انتشار، دسته‌بندی، رسانه، محتوای غنی و متادیتای سئو در یک فضای یکپارچه." icon={BookOpen} actions={<button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#00adb5] px-4 py-3 text-sm font-extrabold text-[#10242a]"><Plus size={17}/> مقاله جدید</button>}/>
    {error && !modalOpen && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}
    {success && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600">{success}</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[{ label: "کل مقالات", value: rows.length, icon: FileText }, { label: "منتشرشده", value: published, icon: Globe }, { label: "پیش‌نویس", value: drafts, icon: Pencil }, { label: "دسته‌های محتوایی", value: new Set(rows.map((row) => row.category || "راهنمای خرید")).size, icon: Settings2 }].map((item) => <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[var(--muted)]">{item.label}</span><span className="grid size-10 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><item.icon size={18}/></span></div><div className="mt-4 text-3xl font-black tabular-nums">{item.value.toLocaleString("fa-IR")}</div></div>)}
    </section>
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="text-lg font-black">کتابخانه مقالات</h2><p className="mt-1 text-xs text-[var(--muted)]">ویرایش محتوا، تنظیمات SEO، انتشار و مدیریت رسانه</p></div><label className="relative w-full md:max-w-sm"><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی عنوان، اسلاگ یا دسته..." className="input w-full pr-9"/></label></div>
      {query.isLoading ? <div className="p-12 text-center text-sm text-[var(--muted)]">در حال دریافت مقالات از سرور...</div> : query.error ? <div className="p-12 text-center text-sm text-red-500">{query.error.message}</div> : !filtered.length ? <div className="p-12 text-center text-sm text-[var(--muted)]">مقاله‌ای یافت نشد. اولین مقاله را ایجاد کنید.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-right text-sm"><thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]"><tr><th className="p-4">مقاله</th><th className="p-4">دسته‌بندی</th><th className="p-4">وضعیت</th><th className="p-4">آخرین ویرایش</th><th className="p-4">عملیات</th></tr></thead><tbody>{filtered.map((article) => <tr key={article.id} className="border-t border-[var(--border)]"><td className="p-4"><div className="flex items-center gap-3"><div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--surface-2)]">{article.image ? <img src={article.image} alt="" className="size-full object-cover"/> : <FileText size={18} className="text-[var(--muted)]"/>}</div><div className="min-w-0"><p className="max-w-sm truncate font-extrabold">{article.title}</p><p dir="ltr" className="mt-1 max-w-sm truncate text-right text-[11px] text-[var(--muted)]">/magazine/{article.slug}</p></div></div></td><td className="p-4"><span className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5 text-xs">{article.category || "راهنمای خرید"}</span></td><td className="p-4"><span className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold ${article.active ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{article.active ? "منتشرشده" : "پیش‌نویس"}</span></td><td className="p-4 text-xs text-[var(--muted)]">{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString("fa-IR") : "—"}</td><td className="p-4"><div className="flex items-center gap-2">{article.active && <a href={`/magazine/${article.slug}`} target="_blank" rel="noreferrer" className="btn btn-secondary !p-2" title="مشاهده مقاله"><Eye size={15}/></a>}<button type="button" onClick={() => openEdit(article)} className="btn btn-secondary !p-2" title="ویرایش"><Pencil size={15}/></button><button type="button" onClick={() => void removeArticle(article)} className="btn btn-danger !p-2" title="حذف"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>}
      <div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted)]">نمایش {filtered.length.toLocaleString("fa-IR")} از {rows.length.toLocaleString("fa-IR")} مقاله</div>
    </section>

    {modalOpen && <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/65 p-3 backdrop-blur-sm sm:p-6"><section role="dialog" aria-modal="true" aria-labelledby="article-editor-title" className="my-3 w-full max-w-[1250px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4"><div><p className="text-[10px] font-extrabold text-[var(--primary)]">CONTENT STUDIO / SEO WORKSPACE</p><h2 id="article-editor-title" className="mt-1 text-lg font-black">{editing ? "ویرایش مقاله" : "ساخت مقاله جدید"}</h2></div><button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">بستن</button></header>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5 p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">{([{ id: "content", label: "محتوا", icon: FileText }, { id: "media", label: "رسانه و دسته‌بندی", icon: ImageIcon }, { id: "seo", label: "تنظیمات SEO", icon: Globe }] as const).map((item) => <button type="button" key={item.id} onClick={() => setTab(item.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold ${tab === item.id ? "bg-[var(--primary)] text-[#10242a]" : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}><item.icon size={15}/>{item.label}</button>)}</div>
          {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}
          {tab === "content" && <div className="space-y-4">
            <div><label className="mb-2 block text-xs font-extrabold">عنوان مقاله *</label><input className="input w-full text-base font-bold" value={form.title} onChange={(event) => { const title = event.target.value; setField("title", title); if (autoSlug) setField("slug", slugify(title)); if (!form.metaTitle) setField("metaTitle", title); }} placeholder="مثلاً راهنمای جامع انتخاب دریل شارژی"/></div>
            <div><label className="mb-2 block text-xs font-extrabold">آدرس مقاله (Slug) *</label><div className="flex gap-2"><input dir="ltr" className="input min-w-0 flex-1 text-left" value={form.slug} onChange={(event) => { setAutoSlug(false); setField("slug", slugify(event.target.value)); }} placeholder="drill-buying-guide"/><button type="button" onClick={() => { setAutoSlug(true); setField("slug", slugify(form.title)); }} className="btn btn-secondary shrink-0">تولید خودکار</button></div><p dir="ltr" className="mt-1 text-left text-[10px] text-[var(--muted)]">/magazine/{form.slug || "article-slug"}</p></div>
            <div><label className="mb-2 block text-xs font-extrabold">خلاصه مقاله / مقدمه</label><textarea className="input min-h-24 w-full" maxLength={320} value={form.excerpt} onChange={(event) => setField("excerpt", event.target.value)} placeholder="خلاصه دقیق و جذاب برای کارت مقاله و نتایج جست‌وجو..."/><p className="mt-1 text-left text-[10px] text-[var(--muted)]">{form.excerpt.length}/320</p></div>
            <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-extrabold">بدنه مقاله</label><span className="text-[10px] text-[var(--muted)]">ذخیره HTML فرمت‌بندی‌شده</span></div><ArticleRichTextEditor value={form.contentHtml} onChange={(value) => setField("contentHtml", value)}/></div>
          </div>}
          {tab === "media" && <div className="space-y-5">
            <div><label className="mb-2 block text-xs font-extrabold">دسته‌بندی اصلی</label><select className="input w-full" value={form.category} onChange={(event) => setField("category", event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div><label className="mb-2 block text-xs font-extrabold">برچسب‌ها</label><input className="input w-full" value={form.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="دریل، ابزار برقی، راهنمای خرید"/><p className="mt-1 text-[10px] text-[var(--muted)]">برچسب‌ها را با کاما از هم جدا کنید.</p></div>
            <AdminImageField value={form.image} onChange={(url) => setField("image", url || "")} disabled={saving} purpose="ARTICLE" label="تصویر شاخص مقاله"/>
            <div><label className="mb-2 block text-xs font-extrabold">متن جایگزین تصویر (Alt)</label><input className="input w-full" value={form.imageAlt} onChange={(event) => setField("imageAlt", event.target.value)} placeholder="توصیف دقیق تصویر برای دسترس‌پذیری و SEO"/></div>
            <div><label className="mb-2 block text-xs font-extrabold">توضیح تصویر</label><input className="input w-full" value={form.imageCaption} onChange={(event) => setField("imageCaption", event.target.value)} placeholder="توضیح اختیاری زیر تصویر"/></div>
            <div><label className="mb-2 block text-xs font-extrabold">نویسنده</label><input className="input w-full" value={form.author} onChange={(event) => setField("author", event.target.value)}/></div>
          </div>}
          {tab === "seo" && <div className="space-y-5">
            <div><div className="mb-2 flex items-center justify-between"><label className="text-xs font-extrabold">عنوان سئو (Meta title)</label><span className={`text-[10px] ${form.metaTitle.length > 60 ? "text-amber-500" : "text-[var(--muted)]"}`}>{form.metaTitle.length}/60</span></div><input className="input w-full" maxLength={80} value={form.metaTitle} onChange={(event) => setField("metaTitle", event.target.value)} placeholder="عنوان اختصاصی برای موتورهای جست‌وجو"/></div>
            <div><div className="mb-2 flex items-center justify-between"><label className="text-xs font-extrabold">توضیحات متا</label><span className={`text-[10px] ${form.metaDescription.length > 160 ? "text-amber-500" : "text-[var(--muted)]"}`}>{form.metaDescription.length}/160</span></div><textarea className="input min-h-24 w-full" maxLength={300} value={form.metaDescription} onChange={(event) => setField("metaDescription", event.target.value)} placeholder="توضیح روشن و ترغیب‌کننده درباره محتوای صفحه"/></div>
            <div><label className="mb-2 block text-xs font-extrabold">Canonical URL (اختیاری)</label><input dir="ltr" className="input w-full text-left" value={form.canonicalUrl} onChange={(event) => setField("canonicalUrl", event.target.value)} placeholder="https://example.com/magazine/article"/></div>
            <div><label className="mb-2 block text-xs font-extrabold">زمان مطالعه (دقیقه)</label><input type="number" min={1} max={120} className="input w-full" value={form.readingMinutes} onChange={(event) => setField("readingMinutes", event.target.value)}/></div>
            <div><label className="mb-2 block text-xs font-extrabold">تاریخ انتشار</label><input type="date" className="input w-full" value={form.publishedAt} onChange={(event) => setField("publishedAt", event.target.value)}/></div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] p-4"><input type="checkbox" checked={form.noIndex} onChange={(event) => setField("noIndex", event.target.checked)} className="mt-1 accent-[var(--primary)]"/><span><strong className="block text-sm">عدم ایندکس توسط موتور جست‌وجو</strong><span className="mt-1 block text-xs leading-6 text-[var(--muted)]">برای پیش‌نویس‌های منتشرشده یا صفحات کم‌ارزش از index شدن جلوگیری می‌کند.</span></span></label>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-[10px] font-extrabold text-[var(--muted)]">پیش‌نمایش نتیجه جست‌وجو</p><p className="mt-3 line-clamp-1 text-base font-medium text-blue-500">{form.metaTitle || form.title || "عنوان مقاله"}</p><p dir="ltr" className="mt-1 truncate text-left text-[10px] text-emerald-600">/magazine/{form.slug || "article-slug"}</p><p className="mt-1 line-clamp-2 text-xs leading-6 text-[var(--muted)]">{form.metaDescription || form.excerpt || "توضیحات مقاله در نتایج جست‌وجو نمایش داده می‌شود."}</p></div>
          </div>}
        </div>
        <aside className="border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 lg:border-r lg:border-t-0">
          <h3 className="flex items-center gap-2 font-black"><Settings2 size={17} className="text-[var(--primary)]"/> انتشار و تنظیمات</h3>
          <div className="mt-5 space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3"><input type="checkbox" checked={form.active} onChange={(event) => setField("active", event.target.checked)} className="mt-1 accent-[var(--primary)]"/><span><strong className="block text-sm">{form.active ? "منتشر شود" : "ذخیره به‌صورت پیش‌نویس"}</strong><span className="mt-1 block text-[11px] leading-5 text-[var(--muted)]">مقاله {form.active ? "در مجله عمومی نمایش داده می‌شود." : "فقط در داشبورد در دسترس است."}</span></span></label>
            <div className="rounded-xl border border-[var(--border)] p-3"><p className="text-xs font-extrabold">چک‌لیست محتوا</p>{[{ label: "عنوان مقاله", ok: Boolean(form.title.trim()) }, { label: "خلاصه مقاله", ok: Boolean(form.excerpt.trim()) }, { label: "تصویر شاخص", ok: Boolean(form.image.trim()) }, { label: "عنوان SEO", ok: Boolean((form.metaTitle || form.title).trim()) }, { label: "توضیحات SEO", ok: Boolean((form.metaDescription || form.excerpt).trim()) }].map((item) => <p key={item.label} className="mt-3 flex items-center gap-2 text-[11px]"><span className={`grid size-4 place-items-center rounded-full ${item.ok ? "bg-emerald-500/15 text-emerald-600" : "bg-[var(--surface-2)] text-[var(--muted)]"}`}>{item.ok && <Check size={11}/>}</span><span className={item.ok ? "text-[var(--text)]" : "text-[var(--muted)]"}>{item.label}</span></p>)}</div>
            <div className="space-y-2"><button type="button" disabled={saving} onClick={() => void saveArticle()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-[#10242a] disabled:opacity-50"><Send size={16}/>{saving ? "در حال ذخیره..." : form.active ? "ذخیره و انتشار" : "ذخیره پیش‌نویس"}</button><button type="button" disabled={saving} onClick={() => setModalOpen(false)} className="btn btn-secondary w-full justify-center">انصراف</button></div>
            <p className="text-[10px] leading-6 text-[var(--muted)]">داده‌ها از طریق API مدیریتی و مخزن JSON پروژه ذخیره می‌شوند. تغییرات پس از ذخیره در صفحات عمومی اعمال می‌شود.</p>
          </div>
        </aside>
      </div>
    </section></div>}
  </main>;
}
