// Explicit opt-in presentation mode. It never calls messaging APIs or creates live accounts.
import { normalizePhone, type Account, type Booking, type RentalMessage } from "./rental";
type DemoAccount=Account&{salt:string;hash:string};
const ACCOUNTS="toolnest-presentation-accounts-v1";
const SESSION="toolnest-presentation-session-v1";
const records=(id:string)=>`toolnest-presentation-rentals-v1:${id}`;
const hex=(a:Uint8Array)=>Array.from(a,b=>b.toString(16).padStart(2,"0")).join("");
async function digest(password:string,salt:string){
  const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:100000,hash:"SHA-256"},material,256);
  return hex(new Uint8Array(bits));
}
export async function demoRegister(data:{name:string;phone:string;password:string;confirmPassword:string;whatsappConsent:boolean}){
  const phone=normalizePhone(data.phone);
  if(data.name.trim().length<2)throw new Error("Enter your full name.");
  if(data.password.length<8||data.password.length>128)throw new Error("Use a password with 8 to 128 characters.");
  if(data.password!==data.confirmPassword)throw new Error("Passwords do not match.");
  const accounts:DemoAccount[]=JSON.parse(localStorage.getItem(ACCOUNTS)??"[]");
  if(accounts.some(a=>a.phone===phone))throw new Error("This number is already registered in this browser. Please log in.");
  const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
  accounts.push({id:crypto.randomUUID(),name:data.name.trim(),phone,whatsappConsent:data.whatsappConsent,salt,hash:await digest(data.password,salt)});
  localStorage.setItem(ACCOUNTS,JSON.stringify(accounts));
}
export async function demoLogin(phoneInput:string,password:string){
  const phone=normalizePhone(phoneInput);const accounts:DemoAccount[]=JSON.parse(localStorage.getItem(ACCOUNTS)??"[]");
  const a=accounts.find(a=>a.phone===phone);
  if(!a||a.hash!==await digest(password,a.salt))throw new Error("Mobile number or password is incorrect. New here? Register first.");
  const account:Account={id:a.id,name:a.name,phone:a.phone,whatsappConsent:a.whatsappConsent};
  sessionStorage.setItem(SESSION,JSON.stringify(account));return account;
}
export function demoSession():Account|null{return JSON.parse(sessionStorage.getItem(SESSION)??"null");}
export function demoLogout(){sessionStorage.removeItem(SESSION);}
export function demoRentals(id:string):{bookings:Booking[];messages:RentalMessage[]}{return JSON.parse(localStorage.getItem(records(id))??'{"bookings":[],"messages":[]}');}
export function saveDemoRentals(id:string,bookings:Booking[],messages:RentalMessage[]){localStorage.setItem(records(id),JSON.stringify({bookings,messages}));}
