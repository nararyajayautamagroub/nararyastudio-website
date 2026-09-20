"use client";
import { useEffect, useState } from "react";

type Staff={id:string;name:string;username:string;email:string;role:string|null;createdAt:string};
const roles=["SUPER_ADMIN","ADMIN","FINANCE","DESIGNER","ARTIST_3D","SUPPORT","PRODUCT_MANAGER","CONTENT_MANAGER"];

export default function StaffAdmin(){
  const[data,setData]=useState<Staff[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
  async function load(){setLoading(true);try{const r=await fetch("/api/admin/staff");const x=await r.json();if(!r.ok)throw new Error(x.error||"Gagal memuat staff");setData(x.staff||[])}catch(e){setError(e instanceof Error?e.message:"Gagal memuat staff")}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  async function update(id:string,role:string){const r=await fetch("/api/admin/staff",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,role})});const x=await r.json();if(!r.ok){setError(x.error||"Update role gagal");return}setData(prev=>prev.map(u=>u.id===id?{...u,role:x.user.role}:u))}
  return <main className="page"><div className="eyebrow">ADMIN / STAFF</div><h1>Staff & Roles</h1><p className="muted mt-3">Perubahan role dibatasi ke Super Admin.</p>{loading&&<p className="muted mt-6">Memuat staff...</p>}{error&&<div className="card p-4 mt-6 text-red-700" role="alert">{error}</div>}<div className="stack mt-6">{data.map(u=><article className="card p-6" key={u.id}><div className="flex flex-wrap justify-between gap-4"><div><b>{u.name}</b><p className="text-sm muted mt-1">@{u.username} · {u.email}</p></div><select value={u.role||"ADMIN"} onChange={e=>update(u.id,e.target.value)}>{roles.map(role=><option value={role} key={role}>{role}</option>)}</select></div><p className="text-xs muted mt-4">Bergabung {new Date(u.createdAt).toLocaleDateString("id-ID")}</p></article>)}</div></main>
}
