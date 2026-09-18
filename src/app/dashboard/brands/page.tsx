"use client";
import CrudTable from "@/components/dashboard/CrudTable";
type Brand = { id: string; name: string; productsCount?: number };
export default function BrandsPage(){return <CrudTable<Brand> collection="brands" title="برندها" searchKeys={["name"]} fields={[{key:"name",label:"نام برند",required:true}]} columns={[{key:"name",label:"برند"},{key:"productsCount",label:"تعداد محصول",render:r=>Number(r.productsCount||0).toLocaleString("fa-IR")}]}/>}
