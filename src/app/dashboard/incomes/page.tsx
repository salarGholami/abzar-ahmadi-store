"use client";
import CrudTable from "@/components/dashboard/CrudTable";
type Income={id:string;title:string;amount:number;createdAt?:string};
export default function IncomesPage(){return <CrudTable<Income> collection="incomes" title="درآمدهای متفرقه" searchKeys={["title"]} fields={[{key:"title",label:"عنوان درآمد",required:true},{key:"amount",label:"مبلغ (تومان)",type:"number",required:true}]} columns={[{key:"title",label:"عنوان"},{key:"amount",label:"مبلغ",render:r=><b>{Number(r.amount||0).toLocaleString("fa-IR")} تومان</b>},{key:"createdAt",label:"تاریخ",render:r=>r.createdAt?new Date(r.createdAt).toLocaleDateString("fa-IR"):"—"}]}/>}
