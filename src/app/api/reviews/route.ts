import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
import type { Review } from "@/lib/types";
export async function GET(req:Request){ const productId=new URL(req.url).searchParams.get("productId")||""; const f=await getJson<Review[]>("reviews.json",[]); return NextResponse.json({success:true,data:f.data.filter(x=>x.productId===productId&&x.status==="APPROVED")}); }
