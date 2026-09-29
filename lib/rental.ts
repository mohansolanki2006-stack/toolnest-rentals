import type { Tool, Shop } from "./catalog";
// Keep the original day-number epoch so saved bookings retain their dates.
export const RENTAL_EPOCH=Date.UTC(2026,8,1);
export const DAY_MS=86400000;
export const pickupSlots=["10:00 AM – 11:00 AM","11:00 AM – 12:00 PM","12:00 PM – 1:00 PM","2:00 PM – 3:00 PM","3:00 PM – 4:00 PM","4:00 PM – 5:00 PM"];
export function getRentalCalendar(now:number){
  const india=new Date(now+330*60*1000);
  const year=india.getUTCFullYear(),month=india.getUTCMonth();
  const today=Math.floor((Date.UTC(year,month,india.getUTCDate())-RENTAL_EPOCH)/DAY_MS)+1;
  const months=Array.from({length:3},(_,i)=>{
    const first=new Date(Date.UTC(year,month+i,1));
    return {name:first.toLocaleDateString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"}),
      days:new Date(Date.UTC(year,month+i+1,0)).getUTCDate(),
      offset:Math.floor((first.getTime()-RENTAL_EPOCH)/DAY_MS),
      weekday:(first.getUTCDay()+6)%7};
  });
  return {today,months,lastDay:months[2].offset+months[2].days};
}
// Stable sample availability: four reserved days per month for each tool/shop.
export function isSampleBooked(day:number,toolName:string,shopName:string){
  const date=new Date(RENTAL_EPOCH+(day-1)*DAY_MS);
  const key=`${toolName}|${shopName}|${date.getUTCFullYear()}-${date.getUTCMonth()}`;
  const hash=Array.from(key).reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,0);
  return [5+hash%3,12+(hash>>>3)%3,20+(hash>>>6)%3,26+(hash>>>9)%3].includes(date.getUTCDate());
}
export function isRentalDayBooked(day:number,toolName:string,shopName:string,bookings:Booking[]){
  return isSampleBooked(day,toolName,shopName)||bookings.some(b=>
    b.tool.name===toolName&&b.shop.name===shopName&&
    (b.status==="upcoming"||b.status==="active")&&day>=b.start&&day<=b.end);
}
export function rentalRangeFree(start:number|null,end:number|null,isBooked:(day:number)=>boolean){
  if(start===null||end===null||end<start)return false;
  for(let day=start;day<=end;day++)if(isBooked(day))return false;
  return true;
}
export function validRentalSelection(start:number|null,end:number|null,pickup:string,now:number){
  const calendar=getRentalCalendar(now);
  return start!==null&&end!==null&&start>=calendar.today&&end>=start&&end<=calendar.lastDay&&
    pickupSlots.includes(pickup)&&pickupTimestamp({start,pickup})>now;
}
export function formatRentalDate(value:number|null){if(value===null)return "Select date";return new Date(Date.UTC(2026,8,value)).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});}
export type RentalStatus="upcoming"|"active"|"previous"|"cancelled";
export type Booking={id:string;tool:Tool;shop:Shop;start:number;end:number;pickup:string;days:number;status:RentalStatus;demo?:boolean;
  customerId:string;customerName:string;customerPhone:string;whatsappConsent:boolean;createdAt:number;dueAt:number;lateFeePerDay:number;pickedUpAt?:number;returnedAt?:number;fineAtReturn?:number;simulatedNow?:number;
};
export const dashboardTabs:[string,RentalStatus][]=[["Upcoming Rentals","upcoming"],["Active Rentals","active"],["Previous Rentals","previous"],["Cancelled Bookings","cancelled"]];

// Pickup times are Mumbai time, regardless of the visitor's device timezone.
export function pickupTimestamp(booking:Pick<Booking,"start"|"pickup">){
  const match=booking.pickup.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if(!match)return NaN;
  const hour=Number(match[1])%12+(match[3].toUpperCase()==="PM"?12:0);
  return Date.UTC(2026,8,booking.start,hour,Number(match[2]))-330*60*1000;
}
export function canCancelBooking(booking:Booking,now=Date.now()){
  return booking.status==="upcoming"&&now<pickupTimestamp(booking);
}

export type Account = { id:string; name:string; phone:string; whatsappConsent:boolean };
export type ServiceStatus = { accountsReady:boolean; whatsappReady:boolean; lateFeePerDay:number };
export type MessageKind = "confirmed" | "pickup" | "reminder" | "overdue";
export type MessageStatus = "queued" | "sending" | "accepted" | "sent" | "delivered" | "read" | "failed" | "unknown" | "skipped" | "preview";
export type RentalMessage = { id:string; bookingId:string; kind:MessageKind; phone:string; body:string; createdAt:number; status:MessageStatus; providerId?:string; error?:string; attempts:number };
export const messageTitles:Record<MessageKind,string> = {confirmed:"Order confirmed",pickup:"Pickup confirmed",reminder:"Return reminder",overdue:"Overdue notice"};
export function normalizePhone(input:string) {
  const digits=input.replace(/[\s()+-]/g, "");
  const local=digits.startsWith("91")&&digits.length===12?digits.slice(2):digits;
  if(!/^[6-9]\d{9}$/.test(local))throw new Error("Enter a valid 10-digit Indian mobile number.");
  return `+91${local}`;
}
export function dueTimestamp(end:number) {
  // All returns are due at 6 PM India time on the selected return date.
  return RENTAL_EPOCH+(end-1)*DAY_MS+(18*60-330)*60*1000;
}
export function calculateFine(booking:Pick<Booking,"dueAt"|"lateFeePerDay"|"returnedAt"|"status">,now=Date.now()) {
  if(booking.status!=="active"&&booking.status!=="previous")return {days:0,amount:0};
  const elapsed=Math.max(0,(booking.returnedAt??now)-booking.dueAt);
  const days=Math.ceil(elapsed/DAY_MS);
  return {days,amount:days*booking.lateFeePerDay};
}
export function dueLabel(booking:Pick<Booking,"end">) { return `${formatRentalDate(booking.end)}, 6:00 PM IST`; }
export function messageBody(kind:MessageKind,b:Booking,now=Date.now()) {
  const start=`Hi ${b.customerName},`;
  const ref=`ToolNest • Booking ${b.id}`;
  if(kind==="confirmed")return `${start} your order has been confirmed!\n\nTool: ${b.tool.name}\nPickup: ${formatRentalDate(b.start)}, ${b.pickup} IST\nLocation: ${b.shop.name}, ${b.shop.address}\nReturn by: ${dueLabel(b)}\nLate return fee: ₹${b.lateFeePerDay} per started 24 hours after the deadline.\n\nBring a valid photo ID.\n${ref}`;
  if(kind==="pickup")return `${start} pickup confirmed!\n\nYou have collected ${b.tool.name} from ${b.shop.name}.\nReturn by: ${dueLabel(b)}\nLate return fee: ₹${b.lateFeePerDay} per started 24 hours after the deadline.\n\n${ref}`;
  if(kind==="reminder")return `${start} a reminder to return ${b.tool.name} to ${b.shop.name} by ${dueLabel(b)}.\n\nReturn on time to avoid a late fee of ₹${b.lateFeePerDay} per started 24 hours.\n${ref}`;
  const fine=calculateFine(b,now);
  return `${start} your rental of ${b.tool.name} is overdue.\n\nDue: ${dueLabel(b)}\nLate period: ${fine.days} day(s)\nCurrent fine: ₹${fine.amount}\nRate: ₹${b.lateFeePerDay} per started 24 hours.\nPlease return the tool to ${b.shop.name}. The fine increases until the return is confirmed.\n\n${ref}`;
}
export function makeMessage(kind:MessageKind,b:Booking,now=Date.now(),preview=false):RentalMessage {
  const suffix=kind==="overdue"?`:${calculateFine(b,now).days}`:"";
  return {id:`${b.id}:${kind}${suffix}`,bookingId:b.id,kind,phone:b.customerPhone,body:messageBody(kind,b,now),createdAt:now,status:preview?"preview":"queued",attempts:0};
}
