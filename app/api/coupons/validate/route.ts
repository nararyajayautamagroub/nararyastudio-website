import{NextResponse}from"next/server";import{safeText}from"@/lib/security";import{findValidCoupon,calculateCouponDiscount}from"@/lib/coupons";import{db}from"@/lib/db";
export async function POST(req:Request){
 try{
  const body=await req.json();
  const code=safeText(body.code,64).toUpperCase();
  if(!code||!Array.isArray(body.items)||body.items.length===0)return NextResponse.json({error:"Coupon request tidak valid."},{status:400});
  const ids:string[]=[];
  for(const rawItem of body.items as unknown[]){const x=rawItem as{id?:unknown;productId?:unknown};const id=safeText(x.id??x.productId,80);if(id&&!ids.includes(id))ids.push(id)}
  const products=await db.product.findMany({where:{productId:{in:ids},status:"PUBLISHED"},select:{productId:true,price:true,discount:true}});
  const map=new Map(products.map(p=>[p.productId,p]));
  let subtotal=0;
  for(const rawItem of body.items as unknown[]){
   const x=rawItem as{id?:unknown;productId?:unknown;quantity?:unknown};
   const id=safeText(x.id??x.productId,80),quantity=Number(x.quantity),product=map.get(id);
   if(!product||!Number.isInteger(quantity)||quantity<1||quantity>99)return NextResponse.json({error:"Item coupon tidak valid."},{status:400});
   const d=Math.min(100,Math.max(0,product.discount)),price=Math.max(0,product.price-Math.round(product.price*d/100));
   subtotal+=price*quantity;
  }
  const coupon=await findValidCoupon(code,subtotal);
  if(!coupon)return NextResponse.json({valid:false,error:"Coupon tidak valid untuk subtotal ini."},{status:400});
  return NextResponse.json({valid:true,code:coupon.code,subtotal,discount:calculateCouponDiscount(coupon,subtotal),minSubtotal:coupon.minSubtotal})
 }catch{return NextResponse.json({error:"Gagal memvalidasi coupon."},{status:500})}
}