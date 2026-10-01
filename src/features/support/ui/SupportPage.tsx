"use client";

import { useEffect, useState } from "react";

type Ticket = { id: string; subject: string; category: string; priority: string; status: string; orderId?: string | null; createdAt: string };

const labels: Record<string, string> = { OPEN: "باز", IN_PROGRESS: "در حال بررسی", WAITING_FOR_CUSTOMER: "منتظر پاسخ مشتری", RESOLVED: "حل‌شده", CLOSED: "بسته", LOW: "کم", NORMAL: "عادی", HIGH: "بالا", URGENT: "فوری" };

export default function SupportPage({ admin = false }: { admin?: boolean }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/customer/support", { cache: "no-store" });
    const json = await res.json();
    if (json.success) setTickets(json.data);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    if (!subject.trim() || !body.trim()) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/customer/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body, category: "OTHER", priority: "NORMAL" }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "ثبت تیکت انجام نشد");
      setSubject(""); setBody(""); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "خطا"); } finally { setBusy(false); }
  }

  return <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6" dir="rtl">
    <header><p className="text-sm font-medium text-teal-600">پشتیبانی</p><h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">مرکز پشتیبانی {admin ? "مدیریت" : "مشتری"}</h1></header>
    {!admin && <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-bold">تیکت جدید</h2>
      <div className="mt-4 grid gap-3"><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="موضوع" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-teal-500" /><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="شرح درخواست" rows={5} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-teal-500" /><button disabled={busy} onClick={create} className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">{busy ? "در حال ثبت..." : "ثبت تیکت"}</button>{error && <p className="text-sm text-red-600">{error}</p>}</div>
    </section>}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">تیکت‌ها</h2><span className="text-sm text-slate-500">{tickets.length} مورد</span></div>
      <div className="space-y-3">{tickets.map(t=><article key={t.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{t.subject}</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{labels[t.status] || t.status}</span></div><p className="mt-2 text-sm text-slate-500">اولویت: {labels[t.priority] || t.priority} · {new Date(t.createdAt).toLocaleDateString("fa-IR")}</p></article>)}{!tickets.length && <p className="py-8 text-center text-sm text-slate-500">هنوز تیکتی ثبت نشده است.</p>}</div>
    </section>
  </main>;
}
