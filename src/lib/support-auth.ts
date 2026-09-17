import "server-only";
import { getSession } from "./auth";
export async function requireSession() { const session = await getSession(); if (!session) throw new Error("UNAUTHENTICATED"); return session; }
