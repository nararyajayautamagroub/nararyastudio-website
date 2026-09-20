const buckets=new Map<string,{count:number;reset:number}>();

export function rateLimit(key:string,limit=10,windowMs=60_000){
  const now=Date.now();
  const current=buckets.get(key);
  if(!current||current.reset<=now){
    buckets.set(key,{count:1,reset:now+windowMs});
    if(buckets.size>10_000){
      for(const [bucketKey,bucket] of buckets){
        if(bucket.reset<=now)buckets.delete(bucketKey);
        if(buckets.size<=8_000)break;
      }
    }
    return{allowed:true,remaining:limit-1};
  }
  if(current.count>=limit)return{allowed:false,remaining:0};
  current.count++;
  return{allowed:true,remaining:limit-current.count};
}
