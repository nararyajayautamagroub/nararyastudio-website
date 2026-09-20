"use client";
import { useEffect, useState } from "react";

type Customer={id:string;name:string;username:string;email:string;role:string|null;locale:string;theme:string;createdAt:string;_count:{orders:number;requests:number;tickets:number}};

export default function CustomersAdmin(){
  const[data,setData]=useState<Customer[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/admin/customers").then(async r=>{const x=await r.json();if(!r.ok)throw new Error(x.error||"Gagal memuat customers");setData(x.customers||[])}).catch(e=>setError(e instanceof Error?e.message:"Gagal memuat customers")).finally(()=>setLoading(false))},[]);
  return <main className="page"><div className="eyebrow">ADMIN / CUSTOMERS</div><h1>Customers</h1>{loading&&<p className="muted mt-6">Memuat customers...</p>}{error&&<div className="card p-4 mt-6 text-red-700" role="alert">{error}</div>}<div className="stack mt-6">{data.map(c=><article className="card p-6" key={c.id}><div className="flex flex-wrap justify-between gap-4"><div><b>{c.name}</b><p className="text-sm muted mt-1">@{c.username} · {c.email}</p></div>{c.role&&<span className="text-xs text-violet-700">{c.role}</span>}</div><div className="grid sm:grid-cols-3 gap-3 mt-5 text-sm"><div><span className="muted">Orders</span><b className="block mt-1">{c._count.orders}</b></div><div><span className="muted">Requests</span><b className="block mt-1">{c._count.requests}</b></div><div><span className="muted">Tickets</span><b className="block mt-1">{c._count.tickets}</b></div></div><p className="text-xs muted mt-4">{c.locale} · {c.theme} · dibuat {new Date(c.createdAt).toLocaleDateString("id-ID")}</p></article>)}</div></main>
}
