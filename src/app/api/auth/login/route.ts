import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
import { setSession, verifyPassword } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
export async function POST(req:Request){
 try{
  const {phone,password}=await req.json();
  if(!phone||!password)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"شماره موبایل و رمز عبور الزامی است"}},{status:400});
  const {data}=await getJson<any[]>("users.json",[]);
  const user=data.find(u=>u.phone===phone);
  if(!user||!verifyPassword(password,user.passwordHash))return NextResponse.json({success:false,error:{code:"INVALID_CREDENTIALS",message:"شماره موبایل یا رمز عبور اشتباه است"}},{status:401});
  await setSession({id:user.id,phone:user.phone,name:user.name,role:user.role,permissions:user.permissions||permissions[user.role as keyof typeof permissions]||[]});
  return NextResponse.json({success:true,data:{id:user.id,name:user.name,role:user.role}});
 }catch(e:any){return NextResponse.json({success:false,error:{code:"LOGIN_ERROR",message:e.message}},{status:500})}
}
