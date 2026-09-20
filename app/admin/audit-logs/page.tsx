"use client";
import { useEffect, useState } from "react";

type Log={id:string;action:string;entity:string;entityId:string|null;metadata:unknown;ipHash:string|null;createdAt:string;actor:{name:string;username:string;email:string}|null};

export default function AuditLogs(){
  const[data,setData]=useState<Log[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/admin/audit-logs").then(async r=>{const x=await r.json();if(!r.ok)throw new Error(x.error||"Gagal memuat audit log");setData(x.logs||[])}).catch(e=>setError(e instanceof Error?e.message:"Gagal memuat audit log")).finally(()=>setLoading(false))},[]);
  return <main className="page"><div className="eyebrow">ADMIN / AUDIT</div><h1>Audit Logs</h1>{loading&&<p className="muted mt-6">Memuat audit log...</p>}{error&&<div className="card p-4 mt-6 text-red-700" role="alert">{error}</div>}<div className="stack mt-6">{!loading&&!data.length&&<section className="card p-6">Belum ada audit log.</section>}{data.map(log=><article className="card p-5" key={log.id}><div className="flex flex-wrap justify-between gap-3"><div><b>{log.action}</b><p className="text-sm muted mt-1">{log.entity}{log.entityId?" · "+log.entityId:""}</p></div><span className="text-xs muted">{new Date(log.createdAt).toLocaleString("id-ID")}</span></div><p className="text-sm mt-3">{log.actor?log.actor.name+" (@"+log.actor.username+")":"SYSTEM"}</p><pre className="text-xs muted mt-3 overflow-auto whitespace-pre-wrap">{JSON.stringify(log.metadata,null,2)}</pre></article>)}</div></main>
}
