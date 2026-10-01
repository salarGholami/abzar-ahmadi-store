"use client";
import CrudTable from "@/features/admin/ui/CrudTable";
import type { StoreNotification } from "@/lib/types";

export default function NotificationsAdminPage() {
  return (
    <CrudTable<StoreNotification>
      collection="notifications"
      title="اعلان‌ها"
      searchKeys={["title", "message", "type"]}
      fields={[
        { key: "title", label: "عنوان", required: true },
        { key: "message", label: "پیام", type: "textarea" },
        {
          key: "type",
          label: "نوع",
          type: "select",
          options: [
            { value: "SYSTEM", label: "سیستمی" },
            { value: "ORDER", label: "سفارش" },
            { value: "PROMOTION", label: "تبلیغاتی" },
          ],
        },
        { key: "userId", label: "شناسه کاربر (خالی = عمومی)" },
        { key: "read", label: "خوانده شده", type: "boolean" },
      ]}
      columns={[
        { key: "title", label: "عنوان" },
        { key: "type", label: "نوع" },
        { key: "read", label: "وضعیت", render: (r) => (r.read ? "خوانده شده" : "خوانده نشده") },
        { key: "createdAt", label: "تاریخ", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fa-IR") : "-") },
      ]}
    />
  );
}
