import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/lib/db";

const scrypt=promisify(nodeScrypt);
export const SESSION_COOKIE="ns_session";
const SESSION_TTL_MS=1000*60*60*24*7;

async function derive(password:string,salt:Buffer){
  const key=await scrypt(password,salt,64) as Buffer;
  return key;
}
export async function hashPassword(password:string){
  if(password.length<8) throw new Error("Password minimal 8 karakter.");
  const salt=randomBytes(16);
  const key=await derive(password,salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}
export async function verifyPassword(password:string,stored:string){
  const [algo,saltHex,keyHex]=stored.split("$");
  if(algo!=="scrypt"||!saltHex||!keyHex)return false;
  try{
    const salt=Buffer.from(saltHex,"hex");
    const expected=Buffer.from(keyHex,"hex");
    const actual=await derive(password,salt);
    return expected.length===actual.length&&timingSafeEqual(expected,actual);
  }catch{return false}
}
export function hashSessionToken(token:string){return createHash("sha256").update(token).digest("hex")}
export async function createSession(userId:string){
  const token=randomBytes(32).toString("hex");
  const expiresAt=new Date(Date.now()+SESSION_TTL_MS);
  await db.userSession.create({data:{userId,tokenHash:hashSessionToken(token),expiresAt}});
  const store=await cookies();
  store.set({name:SESSION_COOKIE,value:token,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});
  return expiresAt;
}
export async function destroySession(){
  const store=await cookies();
  const token=store.get(SESSION_COOKIE)?.value;
  if(token) await db.userSession.deleteMany({where:{tokenHash:hashSessionToken(token)}});
  store.set({name:SESSION_COOKIE,value:"",httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:new Date(0)});
}
export async function getSessionUser(){
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token)return null;
  const session=await db.userSession.findUnique({where:{tokenHash:hashSessionToken(token)},include:{user:true}});
  if(!session)return null;
  if(session.expiresAt<=new Date()){
    await db.userSession.delete({where:{id:session.id}});
    return null;
  }
  return session.user;
}