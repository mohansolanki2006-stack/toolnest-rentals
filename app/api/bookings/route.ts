import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { z } from "zod";
import { categories, shops, toolsFor, quoteShop } from "@/lib/catalog";
import { dueTimestamp, validRentalSelection, rentalRangeFree, isSampleBooked, makeMessage, type Booking } from "@/lib/rental";
import { requireAccount } from "@/lib/server/auth";
import { body, failure, json } from "@/lib/server/http";
import { AppError, bookingMessages, customerBookings, insertBooking, rateLimit } from "@/lib/server/store";
import { dispatchMessage, lateFeeRate } from "@/lib/server/whatsapp";
export const runtime="nodejs";
const schema=z.object({requestId:z.string().uuid(),toolName:z.string().max(120),categorySlug:z.string().max(80),sub:z.string().max(100),shopName:z.string().max(100),start:z.number().int(),end:z.number().int(),pickup:z.string().max(40)});
export async function GET(){try{const account=await requireAccount();const bookings=await customerBookings(account.id);const messages=(await Promise.all(bookings.map(b=>bookingMessages(b.id)))).flat();return json({bookings,messages});}catch(e){return failure(e);}}
export async function POST(request:Request){
  try{
    const data=schema.parse(await body(request));const account=await requireAccount();await rateLimit(`booking:${account.id}`,20,3600);
    const category=categories.find(c=>c.slug===data.categorySlug&&c.subs.includes(data.sub));
    const tool=category?toolsFor(data.sub,category).find(t=>t.name===data.toolName):null;
    const location=shops.find(s=>s.name===data.shopName);
    if(!tool||!location)throw new AppError("Choose a valid tool and pickup location.");
    if(!validRentalSelection(data.start,data.end,data.pickup,Date.now())||!rentalRangeFree(data.start,data.end,day=>isSampleBooked(day,tool.name,location.name)))throw new AppError("Choose available dates and a future pickup slot.");
    const booking:Booking={id:`TN-${randomBytes(6).toString("hex").toUpperCase()}`,tool,shop:quoteShop(location,tool),start:data.start,end:data.end,pickup:data.pickup,days:data.end-data.start+1,status:"upcoming",customerId:account.id,customerName:account.name,customerPhone:account.phone,whatsappConsent:account.whatsappConsent,createdAt:Date.now(),dueAt:dueTimestamp(data.end),lateFeePerDay:lateFeeRate()};
    const saved=await insertBooking(booking,data.requestId,account.whatsappConsent?makeMessage("confirmed",booking):null);
    if(account.whatsappConsent)after(async()=>{try{await dispatchMessage(`${saved.id}:confirmed`);}catch{/* The durable outbox is retried by the scheduler. */}});
    return json({booking:saved,messages:await bookingMessages(saved.id)},201);
  }catch(e){return failure(e);}
}
