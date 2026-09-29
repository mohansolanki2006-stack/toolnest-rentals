import { requireStaff } from "@/lib/server/auth";
import { body, failure, json } from "@/lib/server/http";
import { allHash, rateLimit } from "@/lib/server/store";
import { runNotifications } from "@/lib/server/whatsapp";
import type { Booking, RentalMessage } from "@/lib/rental";
export async function GET(){try{await requireStaff();return json({bookings:(await allHash<Booking>("bookings")).sort((a,b)=>b.createdAt-a.createdAt),messages:await allHash<RentalMessage>("messages")});}catch(e){return failure(e);}}
export async function POST(request:Request){try{await body(request);await requireStaff();await rateLimit("staff:notifications",6,60);return json(await runNotifications());}catch(e){return failure(e);}}
export const maxDuration=60;
