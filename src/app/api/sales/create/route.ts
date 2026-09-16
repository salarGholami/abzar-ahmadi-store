import { createSale } from "@/lib/sales";
import { ok,fail } from "@/lib/http";
export async function POST(req:Request){try{return ok(await createSale(await req.json()),201)}catch(e){return fail(e)}}
