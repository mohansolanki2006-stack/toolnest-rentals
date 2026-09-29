"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, MessageCircle, UserRound } from "lucide-react";
import { api } from "@/lib/client";
import { demoLogin, demoRegister } from "@/lib/demo";
import type { Account, ServiceStatus } from "@/lib/rental";

export function AccountForm({service,demo,onDemoChange,onLogin}:{service:ServiceStatus|null;demo:boolean;onDemoChange:(v:boolean)=>void;onLogin:(account:Account)=>void}){
  const [mode,setMode]=useState<"register"|"login">("register");
  const [name,setName]=useState("");const [phone,setPhone]=useState("");const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");
  const [consent,setConsent]=useState(false);const [notice,setNotice]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){
    e.preventDefault();setError("");setNotice("");setBusy(true);
    try{
      if(mode==="register"){
        const data={name,phone,password,confirmPassword:confirm,whatsappConsent:consent};
        if(demo)await demoRegister(data);else await api("/api/account",{action:"register",...data});
        setMode("login");setPassword("");setConfirm("");setNotice("Registration successful. Log in with your mobile number and password.");
      }else{
        const account=demo?await demoLogin(phone,password):(await api<{account:Account}>("/api/account",{action:"login",phone,password})).account;
        setPassword("");onLogin(account);
      }
    }catch(e){setError(e instanceof Error?e.message:"Please try again.");}finally{setBusy(false);}
  }
  return <section className="bg-slate-50 px-5 py-10 sm:py-16"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[.9fr_1.1fr]">
    <div className="bg-slate-950 p-8 text-white sm:p-10"><p className="text-sm font-bold uppercase tracking-widest text-blue-300">Your next project starts here</p><h1 className="mt-5 text-4xl font-black leading-tight">The right tools.<br/>Every step covered.</h1><p className="mt-5 text-base leading-7 text-slate-300">Create your Toolnest account, reserve a tool and keep track of your rental from pickup to return.</p><div className="mt-9 space-y-6">{[[UserRound,"Register once","Your name, mobile number and password."],[Phone,"Log in with your mobile","Access your own bookings whenever you need."],[MessageCircle,"Stay updated on WhatsApp","Order, pickup, return reminders and late fees."]].map(([Icon,title,description])=>{const Glyph=Icon as typeof Phone;return <div key={String(title)} className="flex gap-4"><Glyph className="mt-1 shrink-0 text-blue-300" size={23}/><div><h2 className="font-bold">{String(title)}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{String(description)}</p></div></div>})}</div><div className="mt-10 border-t border-white/15 pt-6 text-sm text-slate-400">Return by 6:00 PM IST. Late fee: ₹{service?.lateFeePerDay??50} per started 24 hours after your deadline.</div></div>
    <div className="p-6 sm:p-10"><div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Account action">{(["register","login"] as const).map(m=><button key={m} type="button" aria-pressed={mode===m} onClick={()=>{setMode(m);setError("");setNotice("");setPassword("");setConfirm("")}} className={`flex-1 rounded-lg px-3 py-3 text-sm font-bold ${mode===m?"bg-white text-blue-700 shadow-sm":"text-slate-600"}`}>{m==="register"?"1. Register":"2. Log in"}</button>)}</div>
    <h2 className="mt-7 text-2xl font-extrabold">{mode==="register"?"Create your account":"Welcome back"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{mode==="register"?"New to Toolnest? Register first, then log in.":"Use the mobile number you registered with."}</p>
    {notice&&<p role="status" className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="shrink-0" size={20}/>{notice}</p>}
    {demo&&<div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Presentation mode</strong><p>Accounts and bookings stay in this browser. Messages are previews; nothing is sent to WhatsApp. Use a demo password.</p></div>}
    {!demo&&service&&!service.accountsReady&&<p role="status" className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Account setup is still in progress. Use the presentation demo below to try registration and booking.</p>}
    <form onSubmit={submit} className="mt-6 space-y-4">
      {mode==="register"&&<label className="block text-sm font-bold">Full name<input name="name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={e=>setName(e.target.value)} className="field mt-2 w-full font-normal" placeholder="Enter your full name"/></label>}
      <label className="block text-sm font-bold">Mobile number<div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500"><span className="flex items-center bg-slate-100 px-3 text-slate-600">+91</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={18} value={phone} onChange={e=>setPhone(e.target.value)} className="min-w-0 flex-1 p-3 font-normal outline-none" placeholder="10-digit mobile number" aria-describedby="phone-hint"/></div></label><p id="phone-hint" className="text-sm text-slate-500">Use the number linked to your WhatsApp account.</p>
      <label className="block text-sm font-bold">Password<input name="password" autoComplete={mode==="register"?"new-password":"current-password"} type="password" required minLength={8} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} className="field mt-2 w-full font-normal" placeholder="At least 8 characters"/></label>
      {mode==="register"&&<><label className="block text-sm font-bold">Confirm password<input name="confirmPassword" autoComplete="new-password" type="password" required minLength={8} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)} className="field mt-2 w-full font-normal" placeholder="Re-enter your password"/></label><label className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"/><span>I agree to receive order confirmations, pickup updates, return reminders and overdue notices on WhatsApp at this number.</span></label></>}
      {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy||(!demo&&!service?.accountsReady)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50">{busy?"Please wait…":mode==="register"?"Register account":"Log in"}<ArrowRight size={18}/></button>
    </form><p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"><ShieldCheck size={16}/>{demo?"A demo password is used only in this browser.":"Your password is securely hashed."}</p>
    <div className="mt-6 border-t border-slate-100 pt-5"><button type="button" onClick={()=>{onDemoChange(!demo);setError("");setNotice("");setPassword("");setConfirm("");setMode("register")}} className="w-full text-sm font-bold text-blue-700 underline underline-offset-4">{demo?"Switch to live accounts":"Try presentation demo"}</button><a href="/manage" className="mt-4 block text-center text-sm text-slate-500 hover:text-blue-700">Staff sign in</a></div>
    </div></div></section>;
}
