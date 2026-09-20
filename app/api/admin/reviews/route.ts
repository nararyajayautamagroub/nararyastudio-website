import{NextResponse}from"next/server";import{requireStaff}from"@/lib/admin";import{db}from"@/lib/db";
const ROLES=["SUPER_ADMIN","ADMIN","CONTENT_MANAGER"] as const;
export async function GET(){const staff=await requireStaff(ROLES);if(!staff)return NextResponse.json({error:"Forbidden"},{status:403});const reviews=await db.review.findMany({orderBy:{createdAt:"desc"},include:{user:{select:{name:true,email:true}},product:{select:{name:true,productId:true}}}});return NextResponse.json({reviews})}
