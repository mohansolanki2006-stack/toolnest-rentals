"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, MapPin, Menu, X, Star, ArrowRight, ChevronLeft, CalendarDays, Clock, ShieldCheck, Wrench, CheckCircle2, Navigation, Phone, Mail, LocateFixed, UserRound, LogOut } from "lucide-react";

import { categories, equipmentNames, shops, toolsFor, quoteShop, type Category, type Tool } from "@/lib/catalog";
function PricingNote(){
  return <p className="mt-3 text-xs leading-5 text-slate-500">Budget rental and refundable deposit estimates, subject to shop confirmation and exact machine capacity. Actual supplier rates, especially for heavy equipment, may be higher. Daily rate assumes up to 8 operating hours. GST, transport, fuel, operator and consumables are extra where applicable; these are not included in the displayed total. Heavy/stationary machines require delivery or on-site arrangements.</p>;
}
import { AccountForm } from "@/components/account-form";
import { RentalMessages } from "@/components/rental-messages";
import { api } from "@/lib/client";
import { demoSession, demoRentals, demoLogout, saveDemoRentals } from "@/lib/demo";
import { makeMessage, DAY_MS } from "@/lib/rental";

type View = "home"|"subcategories"|"tools"|"detail"|"booking"|"confirmed"|"auth"|"dashboard";
import { getRentalCalendar, pickupSlots, isRentalDayBooked, rentalRangeFree, validRentalSelection, formatRentalDate, pickupTimestamp, canCancelBooking, dashboardTabs, dueTimestamp, calculateFine, type Booking, type RentalStatus, type Account, type RentalMessage, type ServiceStatus } from "@/lib/rental";
export default function Home() {
  const [view,setView]=useState<View>("auth");
  const [selectedCategory,setSelectedCategory]=useState(categories[0]);
  const [selectedSub,setSelectedSub]=useState("Drilling & Breaking");
  const [selectedTool,setSelectedTool]=useState<Tool>(toolsFor("Drilling & Breaking",categories[0])[0]);
  const [selectedShop,setSelectedShop]=useState(quoteShop(shops[0],toolsFor("Drilling & Breaking",categories[0])[0]));
  const [startDay,setStartDay]=useState<number|null>(null);
  const [endDay,setEndDay]=useState<number|null>(null);
  const [pickup,setPickup]=useState("10:00 AM – 11:00 AM");
  const [calendarMonth,setCalendarMonth]=useState(0);
  const [search,setSearch]=useState("");
  const [menu,setMenu]=useState(false);
  const [shopView,setShopView]=useState<"list"|"map">("list");
  const [account,setAccount]=useState<Account|null>(null);
  const loggedIn=Boolean(account);
  const [demo,setDemo]=useState(false);
  const [service,setService]=useState<ServiceStatus|null>(null);
  const [messages,setMessages]=useState<RentalMessage[]>([]);
  const [bookingBusy,setBookingBusy]=useState(false);
  const bookingLock=useRef(false);
  const requestRef=useRef({fingerprint:"",id:""});
  const [authReturn,setAuthReturn]=useState<View>("home");
  const [reservedDays,setReservedDays]=useState<number[]>([]);
  const [availabilityLoading,setAvailabilityLoading]=useState(false);
  const [availabilityError,setAvailabilityError]=useState("");
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [viewedBooking,setViewedBooking]=useState<Booking|null>(null);
  const [bookingNotice,setBookingNotice]=useState("");
  const [clock,setClock]=useState(0);
  useEffect(()=>{
    const update=()=>setClock(Date.now());
    const timer=window.setInterval(update,30000);
    window.addEventListener("focus",update);
    document.addEventListener("visibilitychange",update);
    update();
    return()=>{window.clearInterval(timer);window.removeEventListener("focus",update);document.removeEventListener("visibilitychange",update)};
  },[]);
  const calendar=getRentalCalendar(clock);
  const rentalMonths=calendar.months;
  const isBooked=(day:number)=>reservedDays.includes(day)||isRentalDayBooked(day,selectedTool.name,selectedShop.name,bookings);
  const bookingReady=clock>0&&!availabilityLoading&&!availabilityError&&validRentalSelection(startDay,endDay,pickup,clock)&&rentalRangeFree(startDay,endDay,isBooked);
  const [calendarError,setCalendarError]=useState("");
  useEffect(()=>{setCalendarMonth(0)},[rentalMonths[0].offset]);
  const [dashboardTab,setDashboardTab]=useState<RentalStatus>("upcoming");
  const pricedShops=useMemo(()=>shops.map(shop=>quoteShop(shop,selectedTool)),[selectedTool]);
  const currentTools=useMemo(()=>toolsFor(selectedSub,selectedCategory),[selectedSub,selectedCategory]);
  const days=startDay&&endDay?endDay-startDay+1:0;
  const filtered=useMemo(()=>categories.filter(c=>`${c.name} ${c.description} ${c.subs.join(" ")} ${c.subs.flatMap(sub=>equipmentNames[sub]??[]).join(" ")}`.toLowerCase().includes(search.toLowerCase())),[search]);
  const goHome=()=>{setView("home");scrollTo(0,0)};
  useEffect(()=>{
    let alive=true;
    try{const session=demoSession();if(session){setDemo(true);setAccount(session);const data=demoRentals(session.id);setBookings(data.bookings);setMessages(data.messages);setView("home");}}catch{setBookingNotice("Saved presentation data could not be loaded.");}
    api<{account:Account|null;service:ServiceStatus}>("/api/account").then(data=>{if(!alive)return;setService(data.service);if(data.account){setDemo(false);setAccount(data.account);setView("home");}}).catch(e=>{if(alive)setBookingNotice(e.message);});
    return()=>{alive=false};
  },[]);
  useEffect(()=>{
    if(!account||demo)return;
    let alive=true;
    const refresh=()=>api<{bookings:Booking[];messages:RentalMessage[]}>("/api/bookings").then(data=>{if(alive){setBookings(data.bookings);setMessages(data.messages);setViewedBooking(current=>current?data.bookings.find(b=>b.id===current.id)??current:null);}}).catch(e=>{if(alive)setBookingNotice(e.message);});
    refresh();
    const timer=window.setInterval(()=>{if(document.visibilityState==="visible"&&(view==="dashboard"||view==="confirmed"))refresh();},6000);
    return()=>{alive=false;window.clearInterval(timer)};
  },[account,demo,view]);
  useEffect(()=>{
    setReservedDays([]);setAvailabilityError("");
    if(view!=="booking"||!account||demo){setAvailabilityLoading(false);return;}
    let alive=true;setAvailabilityLoading(true);
    api<{days:number[]}>(`/api/availability?tool=${encodeURIComponent(selectedTool.name)}&shop=${encodeURIComponent(selectedShop.name)}`).then(data=>{if(alive)setReservedDays(data.days);}).catch(e=>{if(alive)setAvailabilityError(e.message);}).finally(()=>{if(alive)setAvailabilityLoading(false);});
    return()=>{alive=false};
  },[view,account,demo,selectedTool.name,selectedShop.name]);
  const acceptLogin=(user:Account)=>{
    setAccount(user);setBookingNotice("");
    if(demo){const data=demoRentals(user.id);setBookings(data.bookings);setMessages(data.messages);}
    setView(authReturn);scrollTo(0,0);
  };
  const applyBooking=(booking:Booking,newMessages:RentalMessage[]=[])=>{
    const next=[booking,...bookings.filter(b=>b.id!==booking.id)].sort((a,b)=>b.createdAt-a.createdAt);
    const combined=[...messages.filter(m=>!newMessages.some(n=>n.id===m.id)),...newMessages];
    if(demo&&account)saveDemoRentals(account.id,next,combined);
    setBookings(next);setMessages(combined);setViewedBooking(booking);
  };
  const cancelBooking=async(id:string)=>{
    const booking=bookings.find(b=>b.id===id);
    if(!booking||!canCancelBooking(booking)){setBookingNotice("This booking cannot be cancelled because its pickup time has passed.");return;}
    if(!window.confirm(`Cancel ${booking.tool.name} booking ${booking.id}?`))return;
    try{
      if(demo)applyBooking({...booking,status:"cancelled"});
      else{const result=await api<{booking:Booking;messages:RentalMessage[]}>(`/api/bookings/${id}`,{action:"cancel"});applyBooking(result.booking,result.messages);}
      setBookingNotice("Booking cancelled. You can find it in Cancelled Bookings.");
    }catch(e){setBookingNotice(e instanceof Error?e.message:"Could not cancel the booking.");}
  };
  const logout=async()=>{
    try{if(demo)demoLogout();else await api("/api/account",{action:"logout"});setAccount(null);setBookings([]);setMessages([]);setViewedBooking(null);setAuthReturn("home");setView("auth");scrollTo(0,0);}
    catch(e){setBookingNotice(e instanceof Error?e.message:"Could not log out.");}
  };
  const confirmBooking=async()=>{
    if(!account){setAuthReturn("booking");setView("auth");scrollTo(0,0);return;}
    if(bookingLock.current)return;
    if(!validRentalSelection(startDay,endDay,pickup,Date.now())||!rentalRangeFree(startDay,endDay,isBooked)){
      setClock(Date.now());setCalendarError("Choose an available date range without booked days and a pickup time that has not passed.");return;
    }
    if(startDay===null||endDay===null)return;
    bookingLock.current=true;setBookingBusy(true);setCalendarError("");
    try{
      let booking:Booking,newMessages:RentalMessage[];
      if(demo){
        booking={id:`DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}`,tool:selectedTool,shop:selectedShop,start:startDay,end:endDay,pickup,days,status:"upcoming",demo:true,customerId:account.id,customerName:account.name,customerPhone:account.phone,whatsappConsent:account.whatsappConsent,createdAt:Date.now(),dueAt:dueTimestamp(endDay),lateFeePerDay:service?.lateFeePerDay??50};
        newMessages=account.whatsappConsent?[makeMessage("confirmed",booking,Date.now(),true)]:[];
      }else{
        const input={toolName:selectedTool.name,categorySlug:selectedCategory.slug,sub:selectedSub,shopName:selectedShop.name,start:startDay,end:endDay,pickup};
        const fingerprint=JSON.stringify(input);if(requestRef.current.fingerprint!==fingerprint)requestRef.current={fingerprint,id:crypto.randomUUID()};
        const result=await api<{booking:Booking;messages:RentalMessage[]}>("/api/bookings",{...input,requestId:requestRef.current.id});booking=result.booking;newMessages=result.messages;
      }
      applyBooking(booking,newMessages);requestRef.current={fingerprint:"",id:""};setDashboardTab("upcoming");setView("confirmed");scrollTo(0,0);
    }catch(e){setCalendarError(e instanceof Error?e.message:"Could not save the booking.");}finally{bookingLock.current=false;setBookingBusy(false);}
  };
  const simulateBooking=(action:"pickup"|"reminder"|"overdue"|"return")=>{
    if(!demo||!viewedBooking)return;
    let booking={...viewedBooking};let now=booking.simulatedNow??Date.now();
    if(action==="pickup"&&booking.status==="upcoming"){now=pickupTimestamp(booking);booking={...booking,status:"active",pickedUpAt:now,simulatedNow:now};}
    else if(action==="reminder"&&booking.status==="active"){if(now>=booking.dueAt){setBookingNotice("This simulated rental is already overdue. Its reminder was due before the deadline.");return;}now=booking.dueAt-3600000;booking.simulatedNow=now;}
    else if(action==="overdue"&&booking.status==="active"){now=now>booking.dueAt?now+DAY_MS:booking.dueAt+3600000;booking.simulatedNow=now;}
    else if(action==="return"&&booking.status==="active"){booking={...booking,status:"previous",returnedAt:now,fineAtReturn:calculateFine(booking,now).amount};}
    else return;
    const nextMessages=action!=="return"&&booking.whatsappConsent?[makeMessage(action,booking,now,true)]:[];
    try{applyBooking(booking,nextMessages);setBookingNotice(action==="return"?"Demo return confirmed. Reminders stop and the final fine is fixed.":"Presentation updated. No WhatsApp message was sent.");}
    catch{setBookingNotice("Could not save the presentation. Check browser storage permissions.");}
  };
  const getDirections=()=>{
    const mapsTab=window.open("about:blank","_blank");
    const openRoute=(origin?:string)=>{
      const destination=`${selectedShop.lat},${selectedShop.lng}`;
      const url=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving${origin?`&origin=${encodeURIComponent(origin)}`:""}`;
      if(mapsTab)mapsTab.location.href=url;else window.location.href=url;
    };
    if(!navigator.geolocation){openRoute();return;}
    navigator.geolocation.getCurrentPosition(
      position=>openRoute(`${position.coords.latitude},${position.coords.longitude}`),
      ()=>openRoute(),
      {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
    );
  };
  const nav=(id:string)=>{setMenu(false);if(view!=="home")setView("home");setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"}),30)};
  return <main className="min-h-screen bg-white text-slate-900">
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button onClick={goHome} className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-blue-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white"><Wrench size={20}/></span>Toolnest</button>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex"><button onClick={goHome}>Home</button><button onClick={()=>nav("categories")}>Categories</button><button onClick={()=>nav("about")}>About</button><button onClick={()=>nav("how")}>How It Works</button><button onClick={()=>nav("contact")}>Contact</button></nav>
        <div className="hidden items-center gap-2 md:flex">{loggedIn?<><button onClick={()=>setView("dashboard")} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-700"><UserRound size={18}/> My Dashboard</button><button onClick={logout} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600"><LogOut size={17}/> Logout</button></>:<button onClick={()=>setView("auth")} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-700"><UserRound size={18}/> Register / Log in</button>}<button onClick={()=>nav("categories")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Find My Tool</button></div>
        <div className="flex items-center gap-2 md:hidden"><button aria-label={loggedIn?"Open dashboard":"Login"} onClick={()=>setView(loggedIn?"dashboard":"auth")} className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><UserRound size={20}/></button><button onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
      </div>
      {menu&&<div className="grid gap-1 border-t p-4 font-semibold md:hidden">{[["Home","home"],["Categories","categories"],["About","about"],["How It Works","how"],["Contact","contact"]].map(([label,id])=><button key={id} onClick={()=>id==="home"?goHome():nav(id)} className="rounded-lg px-3 py-3 text-left hover:bg-blue-50">{label}</button>)}<button onClick={()=>{setMenu(false);setView(loggedIn?"dashboard":"auth")}} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-blue-700 hover:bg-blue-50"><UserRound size={18}/>{loggedIn?"My Dashboard":"Login"}</button>{loggedIn&&<button onClick={()=>{setMenu(false);logout()}} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-red-600 hover:bg-red-50"><LogOut size={18}/>Logout</button>}</div>}
    </header>
    {demo&&view!=="auth"&&<div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-900"><strong>Presentation mode.</strong> Data stays in this browser. WhatsApp messages are previews only.</div>}
    {bookingNotice&&view!=="dashboard"&&<p role="status" className="mx-auto my-4 max-w-7xl rounded-xl bg-blue-50 p-4 text-sm text-blue-800">{bookingNotice}</p>}
    {view==="home"&&<>
      <section className="hero-grid overflow-hidden bg-slate-950 text-white"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24"><div><span className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">Professional tools. Local pickup. Fair daily prices.</span><h1 className="text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl">Borrow Tools.<br/><span className="text-blue-400">Build Together.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Rent professional equipment from trusted nearby shops without the cost of buying it for one project.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>nav("categories")} className="rounded-xl bg-blue-500 px-5 py-3.5 font-bold">Find My Tool</button><button onClick={()=>nav("categories")} className="rounded-xl border border-slate-600 px-5 py-3.5 font-bold">Browse Categories</button><button onClick={()=>nav("categories")} className="flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-3.5 font-bold"><LocateFixed size={18}/> Find Near Me</button></div></div><div className="rounded-3xl border border-white/10 bg-white/8 p-5 shadow-2xl backdrop-blur"><div className="rounded-2xl bg-white p-5 text-slate-900"><p className="mb-3 font-bold">What tool do you need?</p><div className="flex items-center gap-3 rounded-xl border-2 border-blue-100 bg-slate-50 px-4"><Search className="text-blue-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try “wall drilling” or “Bosch”" className="h-14 min-w-0 flex-1 bg-transparent outline-none"/><button onClick={()=>nav("categories")} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white">Search</button></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><Stat n="10" label="Categories"/><Stat n="50" label="Local shops"/><Stat n="₹200" label="Estimated from / day"/></div></div></div></div></section>
      <section id="categories" className="scroll-mt-24 py-18"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">EQUIPMENT DIRECTORY</p><h2 className="section-title">Browse by Category</h2><p className="mt-2 text-slate-600">Select a category to view professional tool options and local availability.</p></div><span className="text-sm font-semibold text-slate-500">{filtered.length} categories</span></div><div className="grid gap-7 md:grid-cols-2">{filtered.map(c=><button key={c.slug} onClick={()=>{setSelectedCategory(c);setView("subcategories");scrollTo(0,0)}} className="category-card group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="overflow-hidden"><img src={c.image} alt={c.name} className="h-[260px] w-full object-cover transition duration-300 group-hover:scale-[1.04]"/></div><div className="flex items-center justify-between gap-5 p-6"><div><h3 className="text-xl font-extrabold">{c.name}</h3><p className="mt-1.5 text-[15px] leading-6 text-slate-600">{c.description}</p></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700"><ArrowRight size={20}/></span></div></button>)}</div></div></section>
      <section id="about" className="scroll-mt-20 bg-slate-50 py-18"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="eyebrow">OUR PURPOSE</p><h2 className="section-title">About Toolnest</h2><p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">Toolnest is a local tool rental marketplace created to make professional tools more accessible and affordable. Instead of buying expensive equipment for one-time or short-term use, customers can browse tool categories, find nearby rental shops, check availability, and reserve tools online. Toolnest helps homeowners, workers, contractors, technicians and small businesses get the right equipment when they need it while reducing the cost of purchasing rarely used tools.</p><div className="mt-10 grid gap-5 md:grid-cols-3"><Feature icon={<CalendarDays/>} title="Affordable Daily Rentals" text="Pay only for the days you need."/><Feature icon={<MapPin/>} title="Nearby Tool Shops" text="Compare trusted local partners."/><Feature icon={<CheckCircle2/>} title="Easy Booking & Pickup" text="Reserve online and collect locally."/></div></div></section>
      <section id="how" className="scroll-mt-20 py-18"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="eyebrow">SIMPLE LOCAL RENTAL</p><h2 className="section-title">How It Works</h2><div className="mt-10 grid gap-5 md:grid-cols-4">{[["01","Find a Tool","Browse professional equipment."],["02","Choose Nearby Shop","Compare distance, price and rating."],["03","Select Rental Dates","Choose available days and pickup time."],["04","Pick Up & Return","Collect locally and return after use."]].map(x=><div key={x[0]} className="rounded-2xl border border-slate-200 p-6"><span className="text-sm font-black text-blue-600">{x[0]}</span><h3 className="mt-5 text-lg font-extrabold">{x[1]}</h3><p className="mt-2 text-slate-600">{x[2]}</p></div>)}</div></div></section>
      <section id="contact" className="scroll-mt-20 bg-blue-700 py-18 text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-sm font-bold tracking-widest text-blue-200">CONTACT</p><h2 className="mt-3 text-4xl font-black">How can we help?</h2><p className="mt-4 max-w-md text-blue-100">Questions about a tool, shop or booking? Send us a message and our support team will help.</p><div className="mt-8 space-y-3 text-blue-100"><p className="flex items-center gap-3"><Mail size={18}/> support@toolnest.in</p><p className="flex items-center gap-3"><Phone size={18}/> +91 90000 00000</p></div></div><form onSubmit={e=>e.preventDefault()} className="grid gap-4 rounded-2xl bg-white p-6 text-slate-900 sm:grid-cols-2"><input className="field" placeholder="Name"/><input className="field" placeholder="Email"/><input className="field" placeholder="Phone"/><input className="field" placeholder="City"/><textarea className="field min-h-28 sm:col-span-2" placeholder="Message"/><button className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white sm:col-span-2">Submit Message</button></form></div></section>
    </>}
    {view==="subcategories"&&<PageShell title={selectedCategory.name} crumb="Categories" onBack={goHome} intro="Choose the type of work to see available professional equipment."><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{selectedCategory.subs.map((s,i)=><button key={s} onClick={()=>{setSelectedSub(s);setView("tools");scrollTo(0,0)}} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-blue-300 hover:shadow-lg"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 font-black text-blue-700">0{i+1}</span><h3 className="mt-8 text-xl font-extrabold">{s}</h3><p className="mt-2 text-slate-600">Professional equipment available from nearby Toolnest partners.</p><span className="mt-6 flex items-center gap-2 font-bold text-blue-700">Browse tools <ArrowRight size={17}/></span></button>)}</div></PageShell>}
    {view==="tools"&&<PageShell title={selectedSub} crumb={selectedCategory.name} onBack={()=>setView("subcategories")} intro="Compare tool-specific indicative daily rental prices and nearby locations."><PricingNote/><div className="grid gap-6 lg:grid-cols-3">{currentTools.map(t=><article key={t.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><img src={t.image} alt={t.name} className="h-52 w-full bg-white object-contain p-3"/><div className="p-5"><div className="flex items-center justify-between"><span className="text-sm font-bold text-blue-700">{t.brand}</span><span className="available">Available</span></div><h3 className="mt-3 text-xl font-extrabold leading-7">{t.name}</h3><p className="mt-2 text-sm text-slate-500">{t.spec}</p><div className="mt-5 flex items-end justify-between"><div><p className="text-2xl font-black">₹{t.price.toLocaleString("en-IN")}<span className="text-sm font-semibold text-slate-500">/day</span></p><p className="text-xs text-slate-500">₹{t.deposit.toLocaleString("en-IN")} refundable deposit</p></div><p className="text-sm font-semibold text-slate-600">{t.shops} shops</p></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={()=>{setSelectedTool(t);setSelectedShop(quoteShop(shops[0],t));setView("detail");scrollTo(0,0)}} className="rounded-xl border border-slate-300 px-3 py-3 font-bold">View Tool</button><button onClick={()=>{setSelectedTool(t);setSelectedShop(quoteShop(shops[0],t));setView("detail");scrollTo(0,0)}} className="rounded-xl bg-blue-600 px-3 py-3 font-bold text-white">Book Now</button></div></div></article>)}</div></PageShell>}
    {view==="detail"&&<PageShell title={selectedTool.name} crumb={selectedSub} onBack={()=>setView("tools")} intro="Select a nearby shop, then choose your rental dates."><PricingNote/><div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><div><img src={selectedTool.image} alt={selectedTool.name} className="h-[390px] w-full rounded-2xl border border-slate-200 bg-white object-contain p-4"/><div className="mt-5 grid grid-cols-3 gap-3"><Spec label="Brand" value={selectedTool.brand}/><Spec label="Model" value={selectedTool.model}/><Spec label="Category" value={selectedSub}/></div><div className="mt-6 rounded-2xl bg-blue-50 p-5"><p className="font-extrabold text-blue-900">Pickup from Shop</p><p className="mt-1 text-sm text-blue-800">Reserve online, then collect the verified tool from your selected local partner.</p></div></div><div><div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-black">Available Near You</h2><p className="text-slate-500">Bhayandar to Churchgate · 50 city and highway pickup points</p></div><div className="flex rounded-xl bg-slate-100 p-1 text-sm font-bold"><button onClick={()=>setShopView("list")} className={`rounded-lg px-4 py-2 ${shopView==="list"?"bg-white text-slate-900 shadow-sm":"text-slate-500"}`}>List</button><button onClick={()=>setShopView("map")} className={`rounded-lg px-4 py-2 ${shopView==="map"?"bg-white text-blue-700 shadow-sm":"text-slate-500"}`}>Map</button></div></div>{shopView==="map"&&<div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><InteractiveShopMap shopOptions={pricedShops} selectedShop={selectedShop} onSelect={setSelectedShop}/><div className="grid gap-2 border-t p-4 sm:grid-cols-3">{pricedShops.map(s=><button key={s.name} onClick={()=>setSelectedShop(s)} className={`rounded-xl border p-3 text-left ${selectedShop.name===s.name?"border-blue-500 bg-blue-50":"border-slate-200"}`}><span className="block font-extrabold">{s.name}</span><span className="mt-1 block text-xs text-slate-500">{s.area} · {s.distance}</span></button>)}</div></div>}<div className="space-y-4">{pricedShops.map(s=><button key={s.name} onClick={()=>{setSelectedShop(s);setStartDay(null);setEndDay(null);setCalendarMonth(0);setCalendarError("");setClock(Date.now());setView("booking");scrollTo(0,0)}} className="w-full rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-md"><div className="flex justify-between gap-4"><div><h3 className="text-lg font-extrabold">{s.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-600"><MapPin size={15}/>{s.area} · {s.distance}</p><p className="mt-1 text-xs text-slate-500">{s.hours}</p></div><span className="flex h-fit items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold"><Star size={14} className="fill-amber-400 text-amber-400"/>{s.rating}</span></div><div className="mt-5 flex items-end justify-between border-t pt-4"><div><span className="text-xl font-black">₹{s.price.toLocaleString("en-IN")}/day</span><p className="text-xs text-slate-500">₹{s.deposit.toLocaleString("en-IN")} refundable deposit</p></div><span className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white">Select Shop</span></div></button>)}</div></div></div></PageShell>}
    {view==="booking"&&<PageShell title="Choose your rental dates" crumb={selectedShop.name} onBack={()=>setView("detail")} intro="Choose dates in the current month or next two months. Past dates and elapsed pickup times are unavailable (Mumbai time)."><div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-2xl border border-slate-200 p-5 sm:p-7"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">{rentalMonths[calendarMonth].name}</h2><p className="mt-1 text-sm text-slate-500">{endDay?"Rental range selected":"Click a start date, then click a return date"}</p></div><div className="flex gap-2"><button aria-label="Previous month" disabled={calendarMonth===0} onClick={()=>setCalendarMonth(m=>Math.max(0,m-1))} className="cal-nav disabled:opacity-30"><ChevronLeft size={18}/></button><button aria-label="Next month" disabled={calendarMonth===2} onClick={()=>setCalendarMonth(m=>Math.min(2,m+1))} className="cal-nav rotate-180 disabled:opacity-30"><ChevronLeft size={18}/></button></div></div><div className="mt-5 grid grid-cols-7 text-center text-xs font-bold text-slate-400">{["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=><span key={d}>{d}</span>)}</div><div className="mt-3 grid grid-cols-7 gap-1">{Array.from({length:rentalMonths[calendarMonth].weekday},(_,i)=><span key={`blank-${i}`}/>)}{Array.from({length:rentalMonths[calendarMonth].days},(_,i)=>i+1).map(d=>{const absoluteDay=rentalMonths[calendarMonth].offset+d;const booked=absoluteDay>=calendar.today&&isBooked(absoluteDay);const unavailable=booked||absoluteDay<calendar.today||(absoluteDay===calendar.today&&pickupSlots.every(p=>pickupTimestamp({start:absoluteDay,pickup:p})<=clock));const selected=!!startDay&&absoluteDay>=startDay&&absoluteDay<=(endDay??startDay);return <button key={d} title={booked?"Already booked":unavailable?"Unavailable":formatRentalDate(absoluteDay)} aria-label={`${formatRentalDate(absoluteDay)}${booked?", booked":unavailable?", unavailable":", available"}`} style={booked?{backgroundColor:"#fef3c7",color:"#92400e",textDecoration:"none"}:undefined} disabled={unavailable} onClick={()=>{setCalendarError("");if(!startDay||endDay){setStartDay(absoluteDay);setEndDay(null)}else if(absoluteDay>=startDay){if(!rentalRangeFree(startDay,absoluteDay,isBooked)){setCalendarError("This range includes booked dates. Choose dates before or after the booked days.");return;}setEndDay(absoluteDay)}else{setStartDay(absoluteDay);setEndDay(null)}}} className={`calendar-day ${unavailable?"unavailable":""} ${selected?"selected":""}`}>{d}{booked&&<span className="block text-[9px] leading-3 font-semibold">Booked</span>}</button>})}</div><div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold"><Legend color="bg-emerald-100" label="Available"/><Legend color="bg-amber-100" label="Booked"/><Legend color="bg-slate-200" label="Unavailable"/><Legend color="bg-blue-600" label="Selected"/></div>{startDay&&endDay&&<div className="mt-8 border-t pt-7"><h3 className="flex items-center gap-2 text-lg font-black"><Clock size={20}/> Select Pickup Time</h3><p className="mt-1 text-sm text-slate-500">Choose a pickup slot after confirming your rental days.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{pickupSlots.map(p=>{const elapsed=pickupTimestamp({start:startDay,pickup:p})<=clock;return <button disabled={elapsed} onClick={()=>{setPickup(p);setCalendarError("")}} key={p} className={`rounded-xl border px-3 py-3 text-sm font-bold ${elapsed?"cursor-not-allowed bg-slate-100 text-slate-400":pickup===p?"border-blue-600 bg-blue-600 text-white":"border-slate-200 hover:border-blue-400"}`}>{p}</button>})}</div></div>}</section><aside className="h-fit rounded-2xl bg-slate-950 p-6 text-white lg:sticky lg:top-24"><p className="text-sm font-bold text-blue-300">BOOKING SUMMARY — ESTIMATE</p><div className="mt-5 flex gap-4"><img src={selectedTool.image} alt="" className="h-20 w-20 rounded-xl bg-white object-contain p-1"/><div><h3 className="font-extrabold">{selectedTool.name}</h3><p className="mt-1 text-sm text-slate-400">{selectedShop.name} · {selectedShop.distance}</p></div></div><div className="mt-6 space-y-3 border-y border-white/15 py-5 text-sm"><Row k="Start date" v={formatRentalDate(startDay)}/><Row k="Return deadline" v={`${formatRentalDate(endDay)}${endDay?", 6:00 PM IST":""}`}/><Row k="Late fee / started 24 hours" v={`₹${service?.lateFeePerDay??50}`}/><Row k="WhatsApp number" v={account?.phone??"Log in to add your number"}/><Row k="Booking duration" v={days?`${days} days`:"—"}/><Row k="Price per day" v={`₹${selectedShop.price}`}/><Row k="Rental cost" v={`₹${(days*selectedShop.price).toLocaleString("en-IN")}`}/><Row k="Refundable deposit" v={`₹${selectedShop.deposit.toLocaleString("en-IN")}`}/><Row k="Pickup time" v={days?pickup:"After dates"}/></div><div className="flex items-center justify-between py-5"><span className="font-bold">Estimated total</span><span className="text-2xl font-black">₹{(days*selectedShop.price+selectedShop.deposit).toLocaleString("en-IN")}</span></div>{availabilityLoading&&<p className="mb-3 text-sm text-blue-200">Checking availability…</p>}{availabilityError&&<p role="alert" className="mb-3 text-sm text-amber-300">{availabilityError}</p>}{calendarError&&<p role="alert" className="mb-3 text-sm text-amber-300">{calendarError}</p>}{days>0&&!bookingReady&&<p className="mb-3 text-sm text-amber-300">Select a future pickup slot and valid dates to continue.</p>}<button disabled={!bookingReady||bookingBusy} onClick={confirmBooking} className="w-full rounded-xl bg-blue-500 py-3.5 font-extrabold disabled:opacity-40">{bookingBusy?"Saving your booking…":loggedIn?"Confirm Booking":"Register / Log in to book"}</button><p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={15}/> Deposit is refundable after return</p><p className="mt-3 text-xs text-slate-400">Estimate excludes GST, transport, fuel, operator and consumables where applicable. Confirm the final quote with the shop.</p></aside></div></PageShell>}
    {view==="confirmed"&&<div className="mx-auto max-w-2xl px-5 py-20 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={42}/></span><p className="mt-7 text-sm font-black tracking-widest text-blue-600">BOOKING {viewedBooking?.id??"DETAILS"}</p><h1 className="mt-3 text-4xl font-black">{viewedBooking?.status==="cancelled"?"Booking Cancelled":viewedBooking?.status==="previous"?"Rental Completed":viewedBooking?.status==="active"?"Rental Active":"Your Tool is Reserved!"}</h1><p className="mx-auto mt-4 max-w-lg text-slate-600">{viewedBooking?.status==="cancelled"?"This booking has been cancelled. No pickup is scheduled.":viewedBooking?.status==="previous"?"This rental has been completed.":viewedBooking?.status==="active"?`Your rental from ${selectedShop.name} is currently active.`:`Your tool is held at ${selectedShop.name}. Bring a valid photo ID when you collect it.`}</p><div className="mt-8 rounded-2xl border border-slate-200 p-6 text-left shadow-sm"><Row k="Tool" v={selectedTool.name}/><Row k="Shop" v={selectedShop.name}/><Row k="Address" v={selectedShop.address}/><Row k="Pickup" v={`${formatRentalDate(startDay)}, ${pickup}`}/><Row k="Return by" v={`${formatRentalDate(endDay)}, 6:00 PM IST`}/><Row k="Late fee / started 24 hours" v={`₹${viewedBooking?.lateFeePerDay??50}`}/><Row k="Rental amount" v={`₹${(days*selectedShop.price).toLocaleString("en-IN")}`}/></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={getDirections} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3.5 font-bold"><Navigation size={18}/> Get Directions</button><button onClick={()=>setView("dashboard")} className="rounded-xl bg-blue-600 py-3.5 font-bold text-white">View My Booking</button></div>{viewedBooking&&<RentalMessages booking={viewedBooking} messages={messages.filter(m=>m.bookingId===viewedBooking.id)} connected={service?.whatsappReady??false} demo={demo} onDemoAction={simulateBooking}/>}</div>}
    {view==="auth"&&<AccountForm service={service} demo={demo} onDemoChange={setDemo} onLogin={acceptLogin}/>}
    {view==="dashboard"&&account&&<PageShell title="My Toolnest" crumb="Customer dashboard" onBack={goHome} intro={`Welcome, ${account?.name??"customer"}. Track your rentals, return dates and WhatsApp updates.`}><div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"><div><p className="font-bold">{account?.phone}</p><p className="mt-1 text-sm text-slate-500">{demo?"Presentation mode • messages are previews":service?.whatsappReady?"WhatsApp sending configured":"WhatsApp connection pending"}</p></div><button onClick={()=>nav("categories")} className="rounded-xl bg-blue-600 px-4 py-3 font-bold text-white">Find a tool</button></div>{bookingNotice&&<p role="status" className="mb-4 rounded-xl bg-blue-50 p-4 text-blue-800">{bookingNotice}</p>}<div className="mb-7 flex gap-2 overflow-auto">{dashboardTabs.map(([label,status])=><button key={status} onClick={()=>setDashboardTab(status)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${dashboardTab===status?"bg-blue-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}<span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{bookings.filter(b=>b.status===status).length}</span></button>)}</div><div className="space-y-4">{bookings.filter(b=>b.status===dashboardTab).map(booking=><div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><img src={booking.tool.image} className="h-28 w-36 rounded-xl bg-white object-contain p-2" alt={booking.tool.name}/><div className="flex-1"><span className="available">{booking.status==="upcoming"?"Reserved":booking.status.charAt(0).toUpperCase()+booking.status.slice(1)}</span><h3 className="mt-2 text-xl font-extrabold">{booking.tool.name}</h3><p className="mt-1 text-slate-500">{booking.shop.name} · {formatRentalDate(booking.start)} to {formatRentalDate(booking.end)}</p><p className="mt-2 text-sm font-semibold text-slate-700">Return by {formatRentalDate(booking.end)}, 6:00 PM IST{calculateFine(booking,booking.simulatedNow??clock).amount>0?` · Fine: ₹${calculateFine(booking,booking.simulatedNow??clock).amount}`:""}</p><p className="mt-1 text-sm text-slate-500">Pickup {booking.pickup} · {booking.days} days · Booking {booking.id}</p></div><div className="flex flex-wrap items-center gap-3">{booking.status==="upcoming"&&<button disabled={!canCancelBooking(booking,clock||Date.now())} title="Cancellation is available only before the pickup slot starts (Mumbai time)." onClick={()=>cancelBooking(booking.id)} className="rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">{canCancelBooking(booking,clock||Date.now())?"Cancel Booking":"Pickup time passed"}</button>}<button onClick={()=>{setViewedBooking(booking);setSelectedTool(booking.tool);setSelectedShop(booking.shop);setStartDay(booking.start);setEndDay(booking.end);setPickup(booking.pickup);setView("confirmed");scrollTo(0,0)}} className="rounded-xl border border-slate-300 px-5 py-3 font-bold hover:border-blue-500 hover:text-blue-700">View Booking</button></div></div></div>)}{bookings.filter(b=>b.status===dashboardTab).length===0&&<div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center"><CalendarDays className="mx-auto text-slate-400"/><h3 className="mt-3 font-extrabold">No {dashboardTabs.find(x=>x[1]===dashboardTab)?.[0].toLowerCase()}</h3><p className="mt-1 text-sm text-slate-500">Bookings in this section will appear here.</p></div>}</div></PageShell>}
    <footer className="border-t border-slate-200 bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 text-sm text-slate-500 sm:flex-row sm:items-center lg:px-8"><div className="space-y-1.5"><p className="font-semibold text-slate-800">Made by Mohan Solanki</p><p>Institute: Shree L.R Tiwari College of Engineering</p><p>Project: IDEA LAB</p></div><div className="space-y-1.5 sm:text-right"><p>© 2026 Toolnest. Professional tools, rented locally.</p><p>Book online · Pick up nearby · Return on time</p></div></div></footer>
  </main>
}
function InteractiveShopMap({shopOptions,selectedShop,onSelect}:{shopOptions:(typeof shops)[number][];selectedShop:(typeof shops)[number];onSelect:(shop:(typeof shops)[number])=>void}){
  const mapEl=useRef<HTMLDivElement|null>(null);
  const mapRef=useRef<any>(null);
  useEffect(()=>{
    let cancelled=false;
    const initialise=()=>{
      if(cancelled||!mapEl.current||mapRef.current)return;
      const L=(window as any).L;
      if(!L)return;
      const map=L.map(mapEl.current,{scrollWheelZoom:true,zoomControl:true});
      mapRef.current=map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
      const bounds:Array<[number,number]>=[];
      shopOptions.forEach((shop,index)=>{
        const point:[number,number]=[shop.lat,shop.lng];
        bounds.push(point);
        const icon=L.divIcon({className:"",html:`<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ef4444;border:3px solid white;box-shadow:0 3px 10px rgba(15,23,42,.35);color:white"><b style="transform:rotate(45deg);font:700 11px system-ui">${index+1}</b></span>`,iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-30]});
        const marker=L.marker(point,{icon,title:shop.name}).addTo(map);
        marker.bindPopup(`<div style="min-width:230px;font-family:system-ui;color:#0f172a"><strong style="font-size:16px">${shop.name}</strong><div style="margin-top:6px;color:#475569">${shop.address}</div><div style="margin-top:8px"><b>${shop.distance}</b> · ⭐ ${shop.rating}</div><div style="margin-top:4px">${shop.hours}</div><div style="margin-top:9px;font-size:17px;font-weight:800;color:#1d4ed8">₹${shop.price.toLocaleString("en-IN")}/day</div><div style="font-size:12px;color:#64748b">₹${shop.deposit.toLocaleString("en-IN")} refundable deposit</div></div>`);
        marker.on("click",()=>onSelect(shop));
      });
      map.fitBounds(bounds,{padding:[28,28]});
    };
    if(!document.querySelector('link[data-toolnest-leaflet]')){
      const css=document.createElement("link");css.rel="stylesheet";css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";css.dataset.toolnestLeaflet="true";document.head.appendChild(css);
    }
    if((window as any).L)initialise();
    else {
      const existing=document.querySelector('script[data-toolnest-leaflet]') as HTMLScriptElement|null;
      if(existing)existing.addEventListener("load",initialise,{once:true});
      else {const script=document.createElement("script");script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";script.dataset.toolnestLeaflet="true";script.onload=initialise;document.head.appendChild(script);}
    }
    return()=>{cancelled=true;if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};
  },[onSelect,shopOptions]);
  return <div className="relative"><div ref={mapEl} className="h-[460px] w-full bg-slate-100" aria-label="Interactive map showing Toolnest shop locations from Bhayandar to Churchgate"/><div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs font-bold shadow">50 clickable shop pins</div><div className="border-t bg-blue-50 px-4 py-3 text-sm text-blue-900"><b>Selected:</b> {selectedShop.name} · {selectedShop.area}</div></div>
}
function PageShell({title,crumb,onBack,intro,children}:{title:string;crumb:string;onBack:()=>void;intro:string;children:React.ReactNode}){return <section className="min-h-[75vh] bg-slate-50 py-12"><div className="mx-auto max-w-7xl px-5 lg:px-8"><button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-bold text-blue-700"><ChevronLeft size={18}/> Back to {crumb}</button><div className="mb-10"><p className="eyebrow">TOOLNEST RENTALS</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-lg text-slate-600">{intro}</p></div>{children}</div></section>}
function Stat({n,label}:{n:string;label:string}){return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-black text-blue-700">{n}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-6"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">{icon}</span><h3 className="mt-5 text-lg font-extrabold">{title}</h3><p className="mt-2 text-slate-600">{text}</p></div>}
function Spec({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 font-extrabold">{value}</p></div>}
function Legend({color,label}:{color:string;label:string}){return <span className="flex items-center gap-2"><i className={`h-3 w-3 rounded-sm ${color}`}/>{label}</span>}
function Row({k,v}:{k:string;v:string}){return <div className="flex items-start justify-between gap-6 py-1.5"><span className="text-slate-500">{k}</span><span className="text-right font-bold">{v}</span></div>}
