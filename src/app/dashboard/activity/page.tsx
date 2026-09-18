"use client";
import CrudTable from "@/components/dashboard/CrudTable";
type Log={id:string;action:string;entityId?:string;createdAt?:string};
export default function ActivityPage(){return <CrudTable<Log> collection="activity-logs" title="لاگ فعالیت‌ها" searchKeys={["action","entityId"]} canCreate={false} canEdit={false} canDelete={false} fields={[]} columns={[{key:"action",label:"عملیات"},{key:"entityId",label:"شناسه"},{key:"createdAt",label:"تاریخ",render:r=>r.createdAt?new Date(r.createdAt).toLocaleString("fa-IR"):"—"}]}/>}
