"use client";
import { dueLabel, calculateFine, type Booking } from "@/lib/rental";
export function RentalMessages({booking}:{booking:Booking}){
  const fine=calculateFine(booking,booking.simulatedNow??Date.now());
  return <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left">
    <div className="border-b border-slate-100 p-5"><div className="text-lg font-extrabold text-emerald-800">Rental details</div><p className="mt-2 text-sm text-slate-600">Your return deadline and late fee are shown below.</p></div>
    <div className="grid gap-4 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-2"><div><p className="text-sm text-slate-500">Return deadline</p><p className="mt-1 font-bold">{dueLabel(booking)}</p></div><div><p className="text-sm text-slate-500">Late return fee</p><p className="mt-1 font-bold">₹{booking.lateFeePerDay} / started 24 hours</p>{fine.amount>0&&<p className="mt-1 font-bold text-red-700">{booking.status==="previous"?"Final":"Current"} fine: ₹{fine.amount} ({fine.days} day{fine.days!==1?"s":""})</p>}</div></div>
    
  </section>;
}
