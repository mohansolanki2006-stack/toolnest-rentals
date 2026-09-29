import { after } from "next/server";
import { requireAccount, requireStaff } from "@/lib/server/auth";
import { body, failure, json } from "@/lib/server/http";
import { AppError, bookingMessages, changeBooking, readHash } from "@/lib/server/store";
import { calculateFine, canCancelBooking, makeMessage, pickupTimestamp, type Booking } from "@/lib/rental";
import { dispatchMessage, scheduleForBooking, withBookingLock } from "@/lib/server/whatsapp";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const {action}=await body(request);const {id}=await params;
    if(!/^TN-[A-F0-9]{12}$/.test(id))throw new AppError("Booking not found.",404);
    if(!["cancel","pickup","return"].includes(action))throw new AppError("Unknown booking action.");
    const account=action==="cancel"?await requireAccount():null;
    if(action!=="cancel")await requireStaff();
    const booking=await withBookingLock(id,async()=>{
      const before=await readHash<Booking>("bookings",id);
      if(!before||(account&&before.customerId!==account.id))throw new AppError("Booking not found.",404);
      const now=Date.now();let after:Booking;
      if(action==="cancel"){
        if(before.status==="cancelled")return before;
        if(!canCancelBooking(before,now))throw new AppError("Cancellation is available only before the pickup slot starts.");
        after={...before,status:"cancelled"};
      }else if(action==="pickup"){
        if(before.status==="active")return before;
        if(before.status!=="upcoming"||now<pickupTimestamp(before)||now>=before.dueAt)throw new AppError("Pickup can be confirmed after the pickup slot starts and before the return deadline.");
        after={...before,status:"active",pickedUpAt:now};
      }else{
        if(before.status==="previous")return before;
        if(before.status!=="active")throw new AppError("Only a collected tool can be returned.");
        after={...before,status:"previous",returnedAt:now,fineAtReturn:calculateFine(before,now).amount};
      }
      await changeBooking(before,after,action==="pickup"&&after.whatsappConsent?makeMessage("pickup",after):null);return after;
    });
    if(action==="pickup")after(async()=>{try{await dispatchMessage(`${id}:pickup`);await scheduleForBooking(booking);await dispatchMessage(`${id}:reminder`);}catch{/* Persisted notifications remain available for the next scheduler run. */}});
    return json({booking,messages:await bookingMessages(id)});
  }catch(e){return failure(e);}
}
