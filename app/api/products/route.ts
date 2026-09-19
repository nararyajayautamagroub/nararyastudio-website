import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(req:Request){
 const {searchParams}=new URL(req.url); const q=searchParams.get("q")?.trim(); const category=searchParams.get("category");
 const products=await db.product.findMany({where:{status:"PUBLISHED",...(category&&category!=="All"?{category}:{}),...(q?{OR:[{name:{contains:q,mode:"insensitive"}},{description:{contains:q,mode:"insensitive"}}]}:{})},orderBy:{createdAt:"desc"}});
 return NextResponse.json({products});
}
