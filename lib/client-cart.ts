export type CartItem={id:string;quantity:number};
export const CART_KEY="ns-cart";
export function readCart():CartItem[]{if(typeof window==="undefined")return[];try{const value=JSON.parse(localStorage.getItem(CART_KEY)||"[]");if(!Array.isArray(value))return[];return value.filter((x):x is CartItem=>Boolean(x&&typeof x.id==="string"&&Number.isInteger(x.quantity)&&x.quantity>0)).map(x=>({id:x.id,quantity:Math.min(99,x.quantity)}))}catch{localStorage.removeItem(CART_KEY);return[]}}
export function writeCart(items:CartItem[]){if(typeof window==="undefined")return;localStorage.setItem(CART_KEY,JSON.stringify(items));window.dispatchEvent(new Event("ns-cart-updated"))}
export function addToCart(id:string,quantity=1){const cart=readCart();const item=cart.find(x=>x.id===id);if(item)item.quantity=Math.min(99,item.quantity+quantity);else cart.push({id,quantity:Math.min(99,Math.max(1,quantity))});writeCart(cart)}
