import { NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";

function safeNext(value:string){
  let decoded="/dashboard";
  try{decoded=decodeURIComponent(value)}catch{}
  return decoded.startsWith("/")&&!decoded.startsWith("//")?decoded:"/dashboard";
}
function same(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
async function uniqueUsername(input:string){const base=(input||"googleuser").slice(0,34);let value=base;let n=1;while(await db.user.findUnique({where:{username:value}})){value=(base+String(n++)).slice(0,40)}return value}

export async function GET(req:Request){
  const url=new URL(req.url);
  const code=url.searchParams.get("code");
  const state=url.searchParams.get("state");
  const error=url.searchParams.get("error");
  const requestCookies=req.headers.get("cookie")||"";
  const match=requestCookies.match(/(?:^|;\s*)ns_oauth_state=([^;]+)/);
  let stored="";
  if(match){try{stored=decodeURIComponent(match[1])}catch{return NextResponse.redirect(new URL("/login?error=google_cookie",url.origin))}}
  if(error||!code||!state||!stored)return NextResponse.redirect(new URL("/login?error=google_denied",url.origin));
  const split=stored.indexOf(":");
  const expected=split>=0?stored.slice(0,split):stored;
  const nextEncoded=split>=0?stored.slice(split+1):"";
  if(!expected||!same(expected,state))return NextResponse.redirect(new URL("/login?error=google_state",url.origin));
  const clientId=process.env.GOOGLE_CLIENT_ID;
  const clientSecret=process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri=process.env.GOOGLE_REDIRECT_URI||new URL("/api/auth/google/callback",process.env.NEXT_PUBLIC_SITE_URL||url.origin).toString();
  if(!clientId||!clientSecret)return NextResponse.redirect(new URL("/login?error=google_config",url.origin));
  try{
    const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,grant_type:"authorization_code"})});
    if(!tokenResponse.ok)throw new Error("token_exchange_failed");
    const token=await tokenResponse.json() as {access_token?:string};
    if(!token.access_token)throw new Error("missing_access_token");
    const userResponse=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:"Bearer "+token.access_token}});
    if(!userResponse.ok)throw new Error("userinfo_failed");
    const profile=await userResponse.json() as {sub?:string;email?:string;email_verified?:boolean;name?:string};
    if(!profile.sub||!profile.email||profile.email_verified!==true)throw new Error("unverified_google_account");
    let user=await db.user.findUnique({where:{googleId:profile.sub}});
    if(!user)user=await db.user.findUnique({where:{email:profile.email.toLowerCase()}});
    if(user){
      user=await db.user.update({where:{id:user.id},data:{googleId:profile.sub,name:profile.name?.slice(0,120)||user.name}});
    }else{
      const base=(profile.email.split("@")[0].replace(/[^a-z0-9_]/gi,"").toLowerCase()||"googleuser");
      const username=await uniqueUsername(base);
      user=await db.user.create({data:{name:profile.name?.slice(0,120)||username,username,email:profile.email.toLowerCase(),passwordHash:"GOOGLE_OAUTH$"+randomBytes(24).toString("hex"),googleId:profile.sub}});
    }
    await createSession(user.id);
    const res=NextResponse.redirect(new URL(safeNext(nextEncoded),url.origin));
    res.cookies.set({name:"ns_oauth_state",value:"",httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:new Date(0)});
    return res;
  }catch{
    return NextResponse.redirect(new URL("/login?error=google_failed",url.origin));
  }
}