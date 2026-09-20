"use client";
import { useEffect, useState } from "react";

type Order={id:string;orderId:string;total:number;paymentStatus:string;paymentMethod:string;status:string;createdAt:string;customer:{name:string;username:string;email:string};items:{quantity:number;product:{productId:string;name:string}}[]};
const statuses=["PENDING","PAID","FAILED","EXPIRED","REFUNDED"];

export default function OrdersAdmin(){
 const[data,setData]=useState<Order[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);try{const r=await fetch("/api/admin/orders");const x=await r.json();if(!r.ok)throw new Error(x.error||"Gagal memuat orders");setData(x.orders||[])}catch(e){setError(e instanceof Error?e.message:"Gagal memuat orders")}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function update(orderId:string,paymentStatus:string){const r=await fetch("/api/admin/orders",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({orderId,paymentStatus})});const x=await r.json();if(!r.ok){setError(x.error||"Update gagal");return}setData(prev=>prev.map(o=>o.orderId===orderId?{...o,paymentStatus, status:x.order.status}:o))}
 return <main className="page"><div className="eyebrow">ADMIN / ORDERS</div><h1>Order Management</h1>{loading&&<p className="muted mt-6">Memuat orders...</p>}{error&&<div className="card p-4 mt-6 text-red-700" role="alert">{error}</div>}<div className="stack mt-6">{data.map(o=><article className="card p-6" key={o.id}><div className="flex flex-wrap justify-between gap-4"><div><b>{o.orderId}</b><p className="text-sm muted mt-1">{o.customer.name} · @{o.customer.username} · {o.customer.email}</p></div><select value={o.paymentStatus} onChange={e=>update(o.orderId,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></div><p className="text-sm muted mt-3">{o.paymentMethod} · {new Date(o.createdAt).toLocaleString("id-ID")}</p><div className="stack mt-4">{o.items.map(i=><div className="flex justify-between gap-4 text-sm" key={i.product.productId}><span>{i.product.name}</span><span>×{i.quantity}</span></div>)}</div><b className="block mt-5">{o.total.toLocaleString("id-ID")} IDR</b></article>)}</div></main>
}
