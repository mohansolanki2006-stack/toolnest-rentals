import { safeEqual } from "@/lib/server/auth";
import { failure, json } from "@/lib/server/http";
import { recordDelivery, validWebhookSignature } from "@/lib/server/whatsapp";
export const runtime="nodejs";
export async function GET(request:Request){
  const q=new URL(request.url).searchParams;const token=process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if(token&&q.get("hub.mode")==="subscribe"&&safeEqual(q.get("hub.verify_token")??"",token))return new Response(q.get("hub.challenge")??"",{headers:{"Content-Type":"text/plain"}});
  return json({error:"Verification failed"},403);
}
export async function POST(request:Request){
  const raw=await request.text();if(raw.length>1024*1024)return json({error:"Payload too large"},413);
  if(!validWebhookSignature(raw,request.headers.get("x-hub-signature-256")??""))return json({error:"Invalid signature"},403);
  try{
    const payload=JSON.parse(raw);
    for(const entry of payload.entry??[])for(const change of entry.changes??[]){
      if(change.value?.metadata?.phone_number_id!==process.env.WHATSAPP_PHONE_NUMBER_ID)continue;
      for(const status of change.value?.statuses??[])await recordDelivery(status);
    }
    return json({ok:true});
  }catch(e){return failure(e);}
}
