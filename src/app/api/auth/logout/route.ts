import { trackServerEvent } from "@/lib/events";
import { clearSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function POST(){await trackServerEvent("LOGOUT");
    await clearSession();return NextResponse.json({success:true,data:null})}
