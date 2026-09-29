import { currentAccount, getSession, register, signIn, signOut, staffSignIn } from "@/lib/server/auth";
import { body, clientAddress, failure, json } from "@/lib/server/http";
import { rateLimit, storageReady, AppError } from "@/lib/server/store";
import { lateFeeRate, whatsappReady } from "@/lib/server/whatsapp";
export const runtime="nodejs";
export async function GET(){
  try{return json({account:storageReady()?await currentAccount():null,staff:storageReady()?(await getSession())?.role==="staff":false,
    service:{accountsReady:storageReady(),whatsappReady:whatsappReady(),lateFeePerDay:lateFeeRate()}});}catch(e){return failure(e);}
}
export async function POST(request:Request){
  try{
    const data=await body(request);
    await rateLimit(`account:${clientAddress(request)}`,30);
    if(data.action==="register")return json({account:await register(data)},201);
    if(data.action==="login")return json({account:await signIn(data)});
    if(data.action==="logout"){await signOut();return json({ok:true});}
    if(data.action==="staff"&&typeof data.password==="string"&&data.password.length<=256){await staffSignIn(data.password);return json({ok:true});}
    throw new AppError("Unknown account action.");
  }catch(e){return failure(e);}
}
