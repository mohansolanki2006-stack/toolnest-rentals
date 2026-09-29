import { createHash } from "node:crypto";
import type { Booking, RentalMessage } from "../rental";

// Only server routes import this module. Tokens are never exposed to the browser.
export const key=(name:string)=>`toolnest:v1:${name}`;
export function storageReady(){return Boolean(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN);}
export class AppError extends Error { constructor(message:string,public status=400){super(message);} }
export async function redis<T=unknown>(...command:(string|number)[]):Promise<T> {
  if(!storageReady())throw new AppError("Account setup is not finished yet. Please try the presentation demo or contact the site owner.",503);
  const response=await fetch(process.env.UPSTASH_REDIS_REST_URL!,{
    method:"POST",headers:{Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,"Content-Type":"application/json"},
    body:JSON.stringify(command),cache:"no-store",signal:AbortSignal.timeout(10000),
  });
  const data=await response.json() as {error?:string;result:T};
  if(!response.ok||data.error)throw new AppError("The service is temporarily unavailable. Please try again.",503);
  return data.result as T;
}
export async function readHash<T>(hash:string,id:string):Promise<T|null>{const raw=await redis<string|null>("HGET",key(hash),id);return raw?JSON.parse(raw):null;}
export async function allHash<T>(hash:string):Promise<T[]>{const flat=await redis<string[]>("HGETALL",key(hash));return flat.filter((_,i)=>i%2===1).map(s=>JSON.parse(s));}
export async function rateLimit(identity:string,limit=12,seconds=900){
  const digest=createHash("sha256").update(identity).digest("hex");
  const hits=await redis<number>("EVAL","local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",1,key(`limit:${digest}`),seconds);
  if(hits>limit)throw new AppError("Too many attempts. Please try again in a few minutes.",429);
}
export function availabilityKey(b:Pick<Booking,"tool"|"shop">){return key(`slots:${createHash("sha256").update(b.tool.name+"|"+b.shop.name).digest("hex")}`);}
export async function customerBookings(userId:string){
  const ids=await redis<string[]>("SMEMBERS",key(`customer:${userId}`));
  if(!ids.length)return [];
  const raw=await redis<(string|null)[]>("HMGET",key("bookings"),...ids);
  return raw.filter((v):v is string=>Boolean(v)).map(v=>JSON.parse(v) as Booking).sort((a,b)=>b.createdAt-a.createdAt);
}
export async function bookingMessages(bookingId:string){
  const ids=await redis<string[]>("SMEMBERS",key(`messages:${bookingId}`));
  if(!ids.length)return [];
  const raw=await redis<(string|null)[]>("HMGET",key("messages"),...ids);
  return raw.filter((v):v is string=>Boolean(v)).map(v=>JSON.parse(v) as RentalMessage).sort((a,b)=>a.createdAt-b.createdAt);
}
export async function enqueue(message:RentalMessage){
  return redis<number>("EVAL",`if redis.call('HSETNX',KEYS[1],ARGV[1],ARGV[2])==1 then
    redis.call('SADD',KEYS[2],ARGV[1]); redis.call('ZADD',KEYS[3],ARGV[3],ARGV[1]); return 1 end; return 0`,
  3,key("messages"),key(`messages:${message.bookingId}`),key("outbox"),message.id,JSON.stringify(message),message.createdAt);
}
export async function insertBooking(booking:Booking,requestId:string,message:RentalMessage|null){
  const result=await redis<string>("EVAL",`
    local existing=redis.call('GET',KEYS[4]); if existing then return existing end
    for day=tonumber(ARGV[3]),tonumber(ARGV[4]) do if redis.call('HEXISTS',KEYS[2],day)==1 then return 'conflict' end end
    redis.call('HSET',KEYS[1],ARGV[1],ARGV[2]); redis.call('SADD',KEYS[3],ARGV[1]); redis.call('SET',KEYS[4],ARGV[1],'EX',86400)
    for day=tonumber(ARGV[3]),tonumber(ARGV[4]) do redis.call('HSET',KEYS[2],day,ARGV[1]) end
    if ARGV[5]~='' then redis.call('HSET',KEYS[5],ARGV[5],ARGV[6]); redis.call('SADD',KEYS[6],ARGV[5]); redis.call('ZADD',KEYS[7],ARGV[7],ARGV[5]) end
    return ARGV[1]`,7,key("bookings"),availabilityKey(booking),key(`customer:${booking.customerId}`),key(`request:${booking.customerId}:${requestId}`),key("messages"),key(`messages:${booking.id}`),key("outbox"),
    booking.id,JSON.stringify(booking),booking.start,booking.end,message?.id??"",message?JSON.stringify(message):"",Date.now());
  if(result==="conflict")throw new AppError("These dates were just reserved. Please choose another date range.",409);
  return result===booking.id?booking:(await readHash<Booking>("bookings",result))!;
}
export async function changeBooking(before:Booking,after:Booking,message:RentalMessage|null){
  const changed=await redis<number>("EVAL",`
    if redis.call('HGET',KEYS[1],ARGV[1])~=ARGV[2] then return 0 end
    redis.call('HSET',KEYS[1],ARGV[1],ARGV[3])
    if ARGV[4]=='release' then for day=tonumber(ARGV[5]),tonumber(ARGV[6]) do if redis.call('HGET',KEYS[2],day)==ARGV[1] then redis.call('HDEL',KEYS[2],day) end end end
    if ARGV[7]~='' and redis.call('HSETNX',KEYS[3],ARGV[7],ARGV[8])==1 then redis.call('SADD',KEYS[4],ARGV[7]); redis.call('ZADD',KEYS[5],ARGV[9],ARGV[7]) end
    return 1`,5,key("bookings"),availabilityKey(before),key("messages"),key(`messages:${before.id}`),key("outbox"),before.id,JSON.stringify(before),JSON.stringify(after),["cancelled","previous"].includes(after.status)?"release":"keep",before.start,before.end,message?.id??"",message?JSON.stringify(message):"",Date.now());
  if(!changed)throw new AppError("This booking changed. Refresh and try again.",409);
}
