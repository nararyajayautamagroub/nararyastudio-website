"use client";
import { useEffect, useState } from "react";

type Ticket={id:string;ticketId:string;subject:string;category:string;message:string;status:string;createdAt:string;user:{name:string;username:string;email:string}};
const STATUSES=["OPEN","IN_PROGRESS","WAITING_CUSTOMER","RESOLVED","CLOSED"];

export default function TicketsAdmin(){
  const[data,setData]=useState<Ticket[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
  async function load(){setLoading(true);try{const r=await fetch("/api/admin/tickets");const x=await r.json();if(!r.ok)throw new Error(x.error||"Gagal memuat ticket");setData(x.tickets||[])}catch(e){setError(e instanceof Error?e.message:"Gagal memuat ticket")}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  async function update(id:string,status:string){const r=await fetch("/api/admin/tickets/"+encodeURIComponent(id),{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status})});if(!r.ok){const x=await r.json();setError(x.error||"Update gagal");return}setData(prev=>prev.map(t=>t.id===id?{...t,status}:t))}
  return <main className="page"><div className="eyebrow">ADMIN / SUPPORT</div><h1>Support Tickets</h1>{loading&&<p className="muted mt-6">Memuat ticket...</p>}{error&&<div role="alert" className="card p-4 mt-6 text-red-700">{error}</div>}<div className="stack mt-6">{data.map(t=><article className="card p-6" key={t.id}><div className="flex flex-wrap justify-between gap-4"><div><b>{t.ticketId}</b><h2 className="text-xl font-bold mt-1">{t.subject}</h2><p className="text-sm muted mt-1">{t.user.name} · {t.user.email} · {t.category}</p></div><select value={t.status} onChange={e=>update(t.id,e.target.value)}>{STATUSES.map(s=><option value={s} key={s}>{s}</option>)}</select></div><p className="mt-5 whitespace-pre-line text-neutral-700 dark:text-neutral-200">{t.message}</p><p className="text-xs muted mt-4">{new Date(t.createdAt).toLocaleString("id-ID")}</p></article>)}</div></main>
}