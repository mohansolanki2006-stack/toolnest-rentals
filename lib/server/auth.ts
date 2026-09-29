import { cookies } from "next/headers";
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { z } from "zod";
import { normalizePhone, type Account } from "../rental";
import { AppError, key, rateLimit, readHash, redis } from "./store";

type StoredAccount = Account & {salt:string;passwordHash:string;createdAt:number;consentAt:number|null};
type Session = {userId:string;role:"customer"|"staff"};
const COOKIE="toolnest_session";
const hashToken=(s:string)=>createHash("sha256").update(s).digest("hex");
const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024},(e,key)=>e?reject(e):resolve(key)));
export const credentialsSchema=z.object({phone:z.string().max(24),password:z.string().min(8,"Use at least 8 characters for your password.").max(128)});
export const registrationSchema=credentialsSchema.extend({name:z.string().trim().min(2).max(80),confirmPassword:z.string(),whatsappConsent:z.boolean()}).refine(v=>v.password===v.confirmPassword,{message:"Passwords do not match."});
export function publicAccount(user:StoredAccount):Account{return {id:user.id,name:user.name,phone:user.phone,whatsappConsent:user.whatsappConsent};}
export async function register(input:unknown){
  const data=registrationSchema.parse(input);const phone=normalizePhone(data.phone);
  await rateLimit(`register:${phone}`,5);
  const salt=randomBytes(16).toString("hex");const passwordHash=(await derive(data.password,salt)).toString("hex");
  const user:StoredAccount={id:randomUUID(),name:data.name,phone,whatsappConsent:data.whatsappConsent,salt,passwordHash,createdAt:Date.now(),consentAt:data.whatsappConsent?Date.now():null};
  const created=await redis<number>("EVAL","if redis.call('HEXISTS',KEYS[1],ARGV[1])==1 then return 0 end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[2]); redis.call('HSET',KEYS[2],ARGV[3],ARGV[2]); return 1",2,key("phones"),key("accounts"),phone,JSON.stringify(user),user.id);
  if(!created)throw new AppError("This number is already registered. Please log in.",409);
  // Registration intentionally does not sign in: the customer logs in afterward.
  return publicAccount(user);
}
export async function signIn(input:unknown){
  const data=credentialsSchema.parse(input);const phone=normalizePhone(data.phone);
  await rateLimit(`login:${phone}`,8);
  const user=await readHash<StoredAccount>("phones",phone);
  const actual=await derive(data.password,user?.salt??"00000000000000000000000000000000");
  const expected=Buffer.from(user?.passwordHash??"00".repeat(64),"hex");
  if(!user||!timingSafeEqual(actual,expected))throw new AppError("Mobile number or password is incorrect. New here? Register first.",401);
  await startSession({userId:user.id,role:"customer"});return publicAccount(user);
}
export function safeEqual(a:string,b:string){const aa=createHash("sha256").update(a).digest();const bb=createHash("sha256").update(b).digest();return timingSafeEqual(aa,bb);}
export async function staffSignIn(secret:string){
  const expected=process.env.TOOLNEST_STAFF_PASSWORD;
  if(!expected||expected.length<16)throw new AppError("The staff account has not been configured.",503);
  if(!safeEqual(secret,expected))throw new AppError("Staff password is incorrect.",401);
  await startSession({userId:"staff",role:"staff"});
}
async function startSession(session:Session){
  const token=randomBytes(32).toString("base64url");
  await redis("SET",key(`session:${hashToken(token)}`),JSON.stringify(session),"EX",7*86400);
  (await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:7*86400});
}
export async function getSession():Promise<Session|null>{const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const raw=await redis<string|null>("GET",key(`session:${hashToken(token)}`));return raw?JSON.parse(raw):null;}
export async function currentAccount(){const session=await getSession();if(!session||session.role!=="customer")return null;const user=await readHash<StoredAccount>("accounts",session.userId);return user?publicAccount(user):null;}
export async function requireAccount(){const account=await currentAccount();if(!account)throw new AppError("Please log in to continue.",401);return account;}
export async function requireStaff(){if((await getSession())?.role!=="staff")throw new AppError("Staff login is required.",403);}
export async function signOut(){const jar=await cookies();const token=jar.get(COOKIE)?.value;if(token)await redis("DEL",key(`session:${hashToken(token)}`));jar.delete(COOKIE);}
