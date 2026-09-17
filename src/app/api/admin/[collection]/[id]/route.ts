import { ok,fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson,writeJson,batchCommit } from "@/lib/github";
import { deleteMedia } from "@/lib/media";
import type { Product } from "@/lib/types";
const allowed=new Set(["products","customers","suppliers","sales","sale-items","purchases","purchase-items","inventory","finance","checks","quotations","expenses","incomes","brands","categories","settings","activity-logs"]);
const perms:Record<string,string>={products:"products",customers:"customers",suppliers:"suppliers",sales:"sales","sale-items":"sales",purchases:"purchases","purchase-items":"purchases",inventory:"inventory",finance:"finance",checks:"checks",quotations:"quotations",expenses:"finance",incomes:"finance",brands:"products",categories:"products",settings:"settings","activity-logs":"settings"};
export async function PATCH(req:Request,{params}:{params:Promise<{collection:string;id:string}>}){try{const{collection,id}=await params;if(!allowed.has(collection))throw new Error("NOT_FOUND");await requirePermission(`${perms[collection]}.update`);const f=await getJson<any[]>(`${collection}.json`,[]);const i=f.data.findIndex(x=>x.id===id);if(i<0)throw new Error("NOT_FOUND");const body=await req.json();
    if (collection === "sales" && body.paymentStatus && !["PAID", "PENDING_TRANSFER", "PARTIAL", "CANCELED"].includes(String(body.paymentStatus))) {
      throw new Error("VALIDATION_ERROR");
    }
    const updated={...f.data[i],...body,id,updatedAt:new Date().toISOString()};

    f.data[i]=collection==="products"?normalizeProduct(updated as Product):updated;

    if (collection === "sales" && body.paymentStatus === "PAID" && f.data[i].paymentStatus === "PAID") {
      const finance = await getJson<any[]>("finance.json", []);
      const alreadyRecorded = finance.data.some((entry) => entry.type === "SALE" && entry.referenceId === id);
      if (!alreadyRecorded) {
        await batchCommit([
          { path: "sales.json", data: f.data, message: `Confirm payment ${id}`, expectedSha: f.sha || undefined },
          { path: "finance.json", data: [...finance.data, { id: crypto.randomUUID(), type: "SALE", referenceId: id, amount: Number(updated.netAmount || 0), createdAt: new Date().toISOString() }], message: `Record payment ${id}`, expectedSha: finance.sha || undefined }
        ]);
        return ok(f.data[i]);
      }
    }

    await writeJson(`${collection}.json`,f.data,`Update ${collection}/${id}`,f.sha||undefined);
    return ok(f.data[i]);}catch(e){return fail(e)}}
export async function DELETE(req:Request,{params}:{params:Promise<{collection:string;id:string}>}){try{const{collection,id}=await params;if(!allowed.has(collection))throw new Error("NOT_FOUND");await requirePermission(`${perms[collection]}.delete`);const f=await getJson<any[]>(`${collection}.json`,[]);const target=f.data.find(x=>x.id===id);if(!target)throw new Error("NOT_FOUND");const next=f.data.filter(x=>x.id!==id);await writeJson(`${collection}.json`,next,`Delete ${collection}/${id}`,f.sha||undefined);if(collection==="products"){for(const image of ((target as Product).images||[])){if(image.path)await deleteMedia(image.path).catch(()=>undefined);}}return ok({id});}catch(e){return fail(e)}}
