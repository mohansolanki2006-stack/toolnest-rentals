import { safeEqual } from "@/lib/server/auth";
import { failure, json } from "@/lib/server/http";
import { runNotifications } from "@/lib/server/whatsapp";
export const runtime="nodejs";
export const maxDuration=60;
export async function GET(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret||!safeEqual(request.headers.get("authorization")??"",`Bearer ${secret}`))return json({error:"Unauthorized"},401);
  try{return json(await runNotifications());}catch(e){return failure(e);}
}
