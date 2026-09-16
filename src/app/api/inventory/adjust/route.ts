import { requirePermission } from "@/lib/permissions";
import { getJson,batchCommit } from "@/lib/github";
import { ok,fail } from "@/lib/http";
export async function POST(req:Request){
 try{
  await requirePermission("inventory.adjust");const b=await req.json();const q=Number(b.quantity);if(!b.productId||!Number.isFinite(q)||q===0)throw new Error("VALIDATION_ERROR");
  const [p,inv,logs]=await Promise.all([getJson<any[]>("products.json",[]),getJson<any[]>("inventory.json",[]),getJson<any[]>("activity-logs.json",[])]);
  const i=p.data.findIndex(x=>x.id===b.productId);if(i<0)throw new Error("PRODUCT_NOT_FOUND");
  const next=[...p.data];next[i]={...next[i],stock:Number(next[i].stock||0)+q,updatedAt:new Date().toISOString()};
  const inventory=[...inv.data];const row=inventory.find(x=>x.productId===b.productId);if(row)row.quantity=Number(row.quantity||0)+q;else inventory.push({id:crypto.randomUUID(),productId:b.productId,quantity:q,updatedAt:new Date().toISOString()});
  await batchCommit([{path:"products.json",data:next,message:"Inventory adjustment"},{path:"inventory.json",data:inventory,message:"Inventory movement"},{path:"activity-logs.json",data:[...logs.data,{id:crypto.randomUUID(),action:"INVENTORY_ADJUSTED",entityId:b.productId,quantity:q,reason:b.reason||"",createdAt:new Date().toISOString()}],message:"Inventory audit"}]);
  return ok(next[i]);
 }catch(e){return fail(e)}
}
