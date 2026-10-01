"use client";

import CrudTable from "@/features/admin/ui/CrudTable";

type Log = {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  actorRole?: string;
  createdAt?: string;
};

export default function ActivityPage() {
  return (
    <CrudTable<Log>
      collection="activity-logs"
      title="لاگ فعالیت‌ها"
      searchKeys={["action", "entityType", "entityId", "actorRole"]}
      canCreate={false}
      canEdit={false}
      canDelete={false}
      fields={[]}
      columns={[
        { key: "action", label: "عملیات" },
        { key: "entityType", label: "نوع موجودیت", render: (r) => r.entityType || "—" },
        { key: "entityId", label: "شناسه", render: (r) => r.entityId || "—" },
        { key: "actorRole", label: "نقش", render: (r) => r.actorRole || "—" },
        {
          key: "createdAt",
          label: "تاریخ",
          render: (r) =>
            r.createdAt ? new Date(r.createdAt).toLocaleString("fa-IR") : "—",
        },
      ]}
    />
  );
}
