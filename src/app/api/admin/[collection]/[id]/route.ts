import { ok,fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson,writeJson } from "@/lib/github";
const allowed=new Set(["products","customers","suppliers","sales","sale-items","purchases","purchase-items","inventory","finance","checks","quotations","expenses","incomes","brands","categories","settings"]);
const perms:any={products:"products",customers:"customers",suppliers:"suppliers",sales:"sales","sale-items":"sales",purchases:"purchases","purchase-items":"purchases",inventory:"inventory",finance:"finance",checks:"checks",quotations:"quotations",expenses:"finance",incomes:"finance",brands:"products",categories:"products",settings:"settings"};
export async function PATCH(req:Request,{params}:{params:Promise<{collection:string;id:string}>}){
 try{const {collection,id}=await params;if(!allowed.has(collection))throw new Error("NOT_FOUND");await requirePermission(`${perms[collection]}.update`);const f=await getJson<any[]>(`${collection}.json`,[]);const i=f.data.findIndex(x=>x.id===id);if(i<0)throw new Error("NOT_FOUND");f.data[i]={...f.data[i],...(await req.json()),id,updatedAt:new Date().toISOString()};await writeJson(`${collection}.json`,f.data,`Update ${collection}/${id}`,f.sha||undefined);return ok(f.data[i])}catch(e){return fail(e)}
}
export async function DELETE(req:Request,{params}:{params:Promise<{collection:string;id:string}>}){
 try{const {collection,id}=await params;if(!allowed.has(collection))throw new Error("NOT_FOUND");await requirePermission(`${perms[collection]}.delete`);const f=await getJson<any[]>(`${collection}.json`,[]);const next=f.data.filter(x=>x.id!==id);if(next.length===f.data.length)throw new Error("NOT_FOUND");await writeJson(`${collection}.json`,next,`Delete ${collection}/${id}`,f.sha||undefined);return ok({id})}catch(e){return fail(e)}
}
