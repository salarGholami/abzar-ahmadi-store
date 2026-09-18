import { getSession } from "@/lib/auth";
import { ok,fail } from "@/lib/http";
export async function GET(){try{const s=await getSession();if(!s)throw new Error("UNAUTHENTICATED");return ok(s)}catch(e){return fail(e)}}
