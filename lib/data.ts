export const formatIDR=(value:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Math.max(0,Number(value)||0));
