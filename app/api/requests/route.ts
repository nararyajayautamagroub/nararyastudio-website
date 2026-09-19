import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidEmail,requestId,safeText } from "@/lib/security";
export async function POST(req:Request){
 try{const body=await req.json(); const name=safeText(body.name,120),email=safeText(body.email,160);
 if(!name||!isValidEmail(email)||!safeText(body.description,10000)) return NextResponse.json({error:"Data request belum lengkap atau email tidak valid."},{status:400});
 let customer=await db.user.findUnique({where:{email}});
 if(!customer){customer=await db.user.create({data:{name,username:safeText(body.username,60)||email.split("@")[0],email,passwordHash:"REQUEST_ONLY"}})}
 const item=await db.serviceRequest.create({data:{requestId:requestId(),customerId:customer.id,serviceType:safeText(body.serviceType,80),requestedProduct:safeText(body.requestedProduct,160)||null,description:safeText(body.description,10000),size:safeText(body.size,80)||null,format:safeText(body.format,80)||null,deadline:body.deadline?new Date(body.deadline):null,budget:Number(body.budget)||null,references:body.references||null,notes:safeText(body.notes,3000)||null}});
 return NextResponse.json({requestId:item.requestId,status:item.status},{status:201});
 }catch{return NextResponse.json({error:"Gagal membuat request."},{status:500})}
}
