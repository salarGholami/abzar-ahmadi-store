import { NextResponse } from "next/server"; import { getJson } from "@/lib/github"; import type { ShippingOption } from "@/lib/types";
export async function GET(){const f=await getJson<ShippingOption[]>("shipping-methods.json",[]); return NextResponse.json({success:true,data:f.data.filter(x=>x.active)});}
