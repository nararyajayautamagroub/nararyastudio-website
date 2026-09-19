import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({ok:true,service:"nararya-studio",timestamp:new Date().toISOString()})}
