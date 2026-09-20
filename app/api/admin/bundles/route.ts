import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin";
import { safeText } from "@/lib/security";
import { randomBytes } from "node:crypto";
import { writeAudit } from "@/lib/audit";

const ROLES=["SUPER_ADMIN","ADMIN","PRODUCT_MANAGER"] as const;

function bundleId(){return "NS-BND-"+Date.now().toString().slice(-6)+randomBytes(2).toString("hex").toUpperCase()}
function slug(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)}

export async function GET(){
  const staff=await requireStaff(ROLES);if(!staff)return NextResponse.json({error:"Forbidden"},{status:403});
  const bundles=await db.bundle.findMany({orderBy:{createdAt:"desc"},include:{items:{include:{product:{select:{id:true,productId:true,name:true,price:true,discount:true,category:true,status:true}}}}}});
  return NextResponse.json({bundles});
}

export async function POST(req:Request){
  const staff=await requireStaff(ROLES);if(!staff)return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const b=await req.json(),name=safeText(b.name,160),description=safeText(b.description,5000),discountPercent=Number(b.discountPercent??0),products=Array.isArray(b.products)?b.products:[];
    if(!name||!description||!Number.isInteger(discountPercent)||discountPercent<0||discountPercent>100||products.length<1||products.length>50)return NextResponse.json({error:"Data bundle tidak valid."},{status:400});
    const productIds=[...new Set(products.flatMap((p:unknown)=>{const id=safeText(p,80);return id?[id]:[]}))];
    const dbProducts=await db.product.findMany({where:{productId:{in:productIds},status:"PUBLISHED"},select:{id:true,productId:true}});
    if(dbProducts.length!==productIds.length)return NextResponse.json({error:"Ada product bundle yang tidak tersedia."},{status:400});
    const productMap=new Map(dbProducts.map(p=>[p.productId,p.id]));
    const bundle=await db.bundle.create({data:{bundleId:bundleId(),slug:slug(safeText(b.slug,100)||name),name,description,discountPercent,active:true,items:{create:productIds.map(productId=>({productId:productMap.get(productId)! ,quantity:1}))}} ,include:{items:true}});
    await writeAudit({actorId:staff.id,action:"CREATE",entity:"Bundle",entityId:bundle.id,metadata:{bundleId:bundle.bundleId}});
    return NextResponse.json({bundle},{status:201});
  }catch{return NextResponse.json({error:"Bundle gagal dibuat. Slug atau data mungkin sudah digunakan."},{status:409})}
}

export async function PATCH(req:Request){
  const staff=await requireStaff(ROLES);if(!staff)return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const b=await req.json(),id=safeText(b.id,80);if(!id)return NextResponse.json({error:"Bundle ID wajib diisi."},{status:400});
    const data:{name?:string;description?:string;discountPercent?:number;active?:boolean}={};
    if(b.name!==undefined)data.name=safeText(b.name,160);
    if(b.description!==undefined)data.description=safeText(b.description,5000);
    if(b.discountPercent!==undefined){const v=Number(b.discountPercent);if(!Number.isInteger(v)||v<0||v>100)return NextResponse.json({error:"Diskon bundle tidak valid."},{status:400});data.discountPercent=v}
    if(b.active!==undefined)data.active=Boolean(b.active);
    const bundle=await db.bundle.update({where:{id},data});
    await writeAudit({actorId:staff.id,action:"UPDATE",entity:"Bundle",entityId:id,metadata:data});
    return NextResponse.json({bundle});
  }catch{return NextResponse.json({error:"Bundle tidak ditemukan."},{status:404})}
}
