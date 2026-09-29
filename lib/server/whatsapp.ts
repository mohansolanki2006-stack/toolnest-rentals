import { randomUUID, createHmac } from "node:crypto";
import { calculateFine, dueLabel, formatRentalDate, makeMessage, DAY_MS, type Booking, type RentalMessage, type MessageStatus } from "../rental";
import { AppError, allHash, enqueue, key, readHash, redis } from "./store";
import { safeEqual } from "./auth";

const templates={confirmed:"toolnest_order_confirmed",pickup:"toolnest_pickup_confirmed",reminder:"toolnest_return_reminder",overdue:"toolnest_overdue_notice"};
export function whatsappReady(){return process.env.WHATSAPP_ENABLED==="true"&&Boolean(process.env.WHATSAPP_ACCESS_TOKEN&&process.env.WHATSAPP_PHONE_NUMBER_ID&&/^v\d+\.\d+$/.test(process.env.WHATSAPP_API_VERSION??""));}
export function lateFeeRate(){const rate=Number(process.env.LATE_FEE_PER_DAY??50);return Number.isSafeInteger(rate)&&rate>=0&&rate<=100000?rate:50;}
export async function withBookingLock<T>(id:string,run:()=>Promise<T>):Promise<T>{
  const lock=key(`booking-lock:${id}`),token=randomUUID();
  if(!await redis("SET",lock,token,"NX","EX",60))throw new AppError("This booking is being updated. Please try again.",409);
  try{return await run();}finally{await redis("EVAL","if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end; return 0",1,lock,token);}
}
export function templatePayload(m:RentalMessage,b:Booking){
  const fee=String(b.lateFeePerDay);
  const vars=m.kind==="confirmed"?[b.customerName,b.id,b.tool.name,formatRentalDate(b.start),b.pickup,b.shop.name,b.shop.address,dueLabel(b),fee]:
    m.kind==="overdue"?[b.customerName,b.id,b.tool.name,dueLabel(b),String(calculateFine(b,m.createdAt).days),String(calculateFine(b,m.createdAt).amount),fee,b.shop.name]:
    [b.customerName,b.id,b.tool.name,b.shop.name,dueLabel(b),fee];
  return {messaging_product:"whatsapp",recipient_type:"individual",to:m.phone.replace("+",""),type:"template",biz_opaque_callback_data:m.id,
    template:{name:templates[m.kind],language:{code:process.env.WHATSAPP_TEMPLATE_LANGUAGE??"en_US"},components:[{type:"body",parameters:vars.map(text=>({type:"text",text}))}]}};
}
async function updateMessage(m:RentalMessage){await redis("HSET",key("messages"),m.id,JSON.stringify(m));}
async function completeAttempt(before:RentalMessage,next:RentalMessage){
  await redis("EVAL","if redis.call('HGET',KEYS[1],ARGV[1])~=ARGV[2] then return 0 end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[3]); return 1",1,key("messages"),before.id,JSON.stringify(before),JSON.stringify(next));
}
export async function dispatchMessage(id:string){
  if(!whatsappReady())return;
  const original=await readHash<RentalMessage>("messages",id);if(!original)return;
  await withBookingLock(original.bookingId,async()=>{
    let m=await readHash<RentalMessage>("messages",id);if(!m)return;
    // A crash after starting a network call must not blindly send a second message.
    if(m.status==="sending"){
      if(Date.now()-m.createdAt>120000){await updateMessage({...m,status:"unknown",error:"Delivery could not be confirmed. Check WhatsApp Manager before retrying."});await redis("ZREM",key("outbox"),id);}
      return;
    }
    if(m.status!=="queued")return;
    const b=await readHash<Booking>("bookings",m.bookingId);
    const expiredConfirmation=m.kind==="confirmed"&&b?.status!=="upcoming";
    const inactive=m.kind!=="confirmed"&&b?.status!=="active";
    const obsoleteReminder=m.kind==="reminder"&&Boolean(b&&Date.now()>=b.dueAt);
    if(!b||!b.whatsappConsent||expiredConfirmation||inactive||obsoleteReminder){await updateMessage({...m,status:"skipped",error:"No longer applicable."});await redis("ZREM",key("outbox"),id);return;}
    // Old queued overdue notices are replaced by the current fine, never sent in a burst.
    if(m.kind==="overdue"&&m.id!==makeMessage("overdue",b).id){await updateMessage({...m,status:"skipped"});await redis("ZREM",key("outbox"),id);return;}
    m={...m,status:"sending",attempts:m.attempts+1};await updateMessage(m);
    let response:Response;
    try{
      response=await fetch(`https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,{
        method:"POST",headers:{Authorization:`Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify(templatePayload(m,b)),signal:AbortSignal.timeout(12000),
      });
    }catch{
      await completeAttempt(m,{...m,status:"unknown",error:"No delivery response. Check WhatsApp Manager before retrying."});await redis("ZREM",key("outbox"),id);return;
    }
    const data=await response.json().catch(()=>({})) as {messages?:{id?:string}[];error?:{code?:number}};
    if(response.ok&&data.messages?.[0]?.id){
      const providerId=String(data.messages[0].id);
      await redis("HSET",key("provider-messages"),providerId,id);
      await completeAttempt(m,{...m,status:"accepted",providerId,error:undefined});
      await redis("ZREM",key("outbox"),id);
    }else if(response.status===429&&m.attempts<3){
      await completeAttempt(m,{...m,status:"queued",error:"WhatsApp is busy. A retry is scheduled."});await redis("ZADD",key("outbox"),Date.now()+15*60000,id);
    }else{
      await completeAttempt(m,{...m,status:response.status>=500?"unknown":"failed",error:`WhatsApp did not confirm delivery (code ${Number(data.error?.code)||response.status}).`});await redis("ZREM",key("outbox"),id);
    }
  });
}
export async function scheduleForBooking(b:Booking,now=Date.now()){
  if(b.status!=="active"||!b.whatsappConsent)return;
  if(now>=b.dueAt)await enqueue(makeMessage("overdue",b,now));
  else if(now>=b.dueAt-DAY_MS)await enqueue(makeMessage("reminder",b,now));
}
export async function runNotifications(){
  const bookings=await allHash<Booking>("bookings");
  for(const b of bookings)await scheduleForBooking(b);
  const ids=await redis<string[]>("ZRANGEBYSCORE",key("outbox"),"-inf",Date.now(),"LIMIT",0,30);
  let processed=0;
  const deadline=Date.now()+45000;
  for(const id of ids){if(Date.now()>deadline)break;try{await dispatchMessage(id);processed++;}catch{/* Durable queue retains failures for the next run. */}}
  return {checked:bookings.length,processed,whatsappConfigured:whatsappReady()};
}
export function validWebhookSignature(raw:string,signature:string){
  const secret=process.env.WHATSAPP_APP_SECRET;if(!secret)return false;
  return safeEqual(signature,`sha256=${createHmac("sha256",secret).update(raw).digest("hex")}`);
}
export async function recordDelivery(event:{id?:string;status?:string;biz_opaque_callback_data?:string}){
  const accepted:[string,MessageStatus][]=[["sent","sent"],["delivered","delivered"],["read","read"],["failed","failed"]];
  const status=accepted.find(([s])=>s===event.status)?.[1];if(!status||!event.id)return;
  const id=event.biz_opaque_callback_data??await redis<string|null>("HGET",key("provider-messages"),event.id);
  if(!id)return;
  // CAS preserves newer receipts when delivery webhooks arrive out of order.
  const rank:Record<MessageStatus,number>={queued:0,sending:1,accepted:2,sent:3,failed:3,unknown:1,skipped:0,preview:0,delivered:4,read:5};
  for(let attempt=0;attempt<3;attempt++){
    const m=await readHash<RentalMessage>("messages",id);if(!m||rank[m.status]>rank[status])return;
    const next={...m,status,providerId:event.id,error:status==="failed"?"WhatsApp reported delivery failure.":undefined};
    const changed=await redis<number>("EVAL","if redis.call('HGET',KEYS[1],ARGV[1])~=ARGV[2] then return 0 end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[3]); return 1",1,key("messages"),id,JSON.stringify(m),JSON.stringify(next));
    if(changed)return;
  }
  throw new AppError("Delivery update needs retry.",503);
}
