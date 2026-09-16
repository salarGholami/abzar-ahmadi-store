import { ok,fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson,writeJson } from "@/lib/github";
const allowed=new Set(["products","customers","suppliers","sales","sale-items","purchases","purchase-items","inventory","finance","checks","quotations","expenses","incomes","brands","categories","settings"]);
const perms:any={products:"products",customers:"customers",suppliers:"suppliers",sales:"sales","sale-items":"sales",purchases:"purchases","purchase-items":"purchases",inventory:"inventory",finance:"finance",checks:"checks",quotations:"quotations",expenses:"finance",incomes:"finance",brands:"products",categories:"products",settings:"settings"};
const path=(c:string)=>`${c}.json`;
export async function GET(req:Request,{params}:{params:Promise<{collection:string}>}){
 try{const {collection}=await params;if(!allowed.has(collection))throw new Error("NOT_FOUND");await requirePermission(`${perms[collection]}.read`);return ok((await getJson<any[]>(path(collection),[])).data)}catch(e){return fail(e)}
}
export async function POST(req:Request,{params}:{params:Promise<{collection:string}>}){
 try{const {collection}=await params;if(!allowed.has(collection))throw new Error("NOT_FOUND");await requirePermission(`${perms[collection]}.create`);const body=await req.json();const f=await getJson<any[]>(path(collection),[]);const item={...body,id:crypto.randomUUID(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};f.data.push(item);await writeJson(path(collection),f.data,`Create ${collection}/${item.id}`,f.sha||undefined);return ok(item,201)}catch(e){return fail(e)}
}
