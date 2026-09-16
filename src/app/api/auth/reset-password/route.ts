import { NextResponse } from "next/server";
import { getJson,writeJson } from "@/lib/github";
import { hashPassword } from "@/lib/auth";
export async function POST(req:Request){
 try{
  const {phone,code,newPassword}=await req.json();
  if(!phone||!code||!newPassword||newPassword.length<8)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"اطلاعات یا رمز جدید نامعتبر است"}},{status:400});
  if(!process.env.PASSWORD_RESET_CODE||code!==process.env.PASSWORD_RESET_CODE)return NextResponse.json({success:false,error:{code:"INVALID_RESET_CODE",message:"کد بازیابی صحیح نیست"}},{status:403});
  const f=await getJson<any[]>("users.json",[]);const i=f.data.findIndex(u=>u.phone===phone);if(i<0)return NextResponse.json({success:false,error:{code:"USER_NOT_FOUND",message:"کاربر پیدا نشد"}},{status:404});
  f.data[i]={...f.data[i],passwordHash:hashPassword(newPassword),updatedAt:new Date().toISOString()};
  await writeJson("users.json",f.data,`Reset password ${f.data[i].id}`,f.sha||undefined);
  return NextResponse.json({success:true,data:null});
 }catch(e:any){return NextResponse.json({success:false,error:{code:"RESET_ERROR",message:e.message}},{status:500})}
}
