import { createHash, randomBytes } from "node:crypto";
export function hashToken(value:string){return createHash("sha256").update(value).digest("hex")}
export function newDownloadToken(){return randomBytes(32).toString("hex")}
export function safeText(value:unknown,max=5000){return String(value??"").trim().slice(0,max)}
export function isValidEmail(value:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
export function requestId(){return "NS-REQ-"+Date.now().toString().slice(-6)+randomBytes(2).toString("hex").toUpperCase()}
export function orderId(){return "NS-ORD-"+Date.now().toString().slice(-6)+randomBytes(2).toString("hex").toUpperCase()}
