"use client";
import CrudTable from "@/components/dashboard/CrudTable";
import type { FinanceEntry } from "@/lib/types";

const typeLabel: Record<string, string> = { SALE: "فروش", PURCHASE: "خرید", OTHER_INCOME: "درآمد متفرقه", OTHER_EXPENSE: "هزینه متفرقه" };

export default function FinancePage() {
  return (
    <CrudTable<FinanceEntry>
      collection="finance"
      title="مالی"
      searchKeys={["description", "type"]}
      fields={[
        { key: "type", label: "نوع تراکنش", type: "select", options: [{ value: "OTHER_INCOME", label: "درآمد متفرقه" }, { value: "OTHER_EXPENSE", label: "هزینه متفرقه" }], required: true },
        { key: "amount", label: "مبلغ (تومان)", type: "number", required: true },
        { key: "description", label: "توضیحات", type: "textarea" }
      ]}
      columns={[
        { key: "type", label: "نوع", render: (r) => (
          <span className={`badge ${["SALE", "OTHER_INCOME"].includes(r.type) ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"}`}>{typeLabel[r.type] || r.type}</span>
        )},
        { key: "description", label: "توضیحات" },
        { key: "amount", label: "مبلغ", render: (r) => <b>{Number(r.amount || 0).toLocaleString("fa-IR")} تومان</b> },
        { key: "createdAt", label: "تاریخ", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "-") }
      ]}
      canEdit={false}
      canDelete={false}
    />
  );
}
