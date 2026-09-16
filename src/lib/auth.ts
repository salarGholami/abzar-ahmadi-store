import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type Role="ADMIN"|"SELLER"|"ACCOUNTANT"|"WAREHOUSE"|"CUSTOMER";
export type Session={id:string;phone:string;name:string;role:Role;permissions:string[];exp:number};

const secret=()=>process.env.AUTH_SECRET||"development-secret-change-me";
const b64=(s:string)=>Buffer.from(s).toString("base64url");
const unb64=(s:string)=>Buffer.from(s,"base64url").toString();
function sign(payload:string){return createHmac("sha256",secret()).update(payload).digest("base64url")}
export function createSession(s:Omit<Session,"exp">){const body=b64(JSON.stringify({...s,exp:Date.now()+7*864e5}));return `${body}.${sign(body)}`}
export function verifySession(token:string):Session|null{
 try{const [body,sig]=token.split(".");if(!body||!sig)return null;const expected=sign(body);if(!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;const s=JSON.parse(unb64(body));return s.exp>Date.now()?s:null}catch{return null}
}
export async function getSession(){return verifySession((await cookies()).get("session")?.value||"")}
export async function setSession(s:Omit<Session,"exp">){(await cookies()).set("session",createSession(s),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:7*86400})}
export async function clearSession(){(await cookies()).delete("session")}
export function hashPassword(password:string){const salt=randomBytes(16).toString("hex");return `scrypt:${salt}:${scryptSync(password,salt,64).toString("hex")}`}
export function verifyPassword(password:string,stored:string){
 const [alg,salt,hash]=stored.split(":");if(alg!=="scrypt"||!salt||!hash)return false;
 const actual=scryptSync(password,salt,64);const expected=Buffer.from(hash,"hex");return actual.length===expected.length&&timingSafeEqual(actual,expected)
}
