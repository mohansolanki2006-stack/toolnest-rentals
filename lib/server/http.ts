import { ZodError } from "zod";
import { AppError } from "./store";
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store"}});}
export function failure(error:unknown){
  if(error instanceof AppError)return json({error:error.message},error.status);
  if(error instanceof ZodError)return json({error:error.issues[0]?.message??"Check the form and try again."},400);
  if(error instanceof SyntaxError)return json({error:"Invalid request."},400);
  // Never echo provider errors, tokens, passwords, or personal data into responses/logs.
  return json({error:"Something went wrong. Please try again."},500);
}
export async function body(request:Request){
  const origin=request.headers.get("origin");
  // Next may expose an internal request URL behind a reverse proxy. The actual
  // Host header is the browser's destination; do not trust forwarded-host input.
  let allowed=false;
  try{const parsed=new URL(origin??"");allowed=["http:","https:"].includes(parsed.protocol)&&parsed.host===(request.headers.get("host")??new URL(request.url).host);}catch{}
  if(!allowed)throw new AppError("This request is not allowed.",403);
  if(!request.headers.get("content-type")?.startsWith("application/json"))throw new AppError("Expected a JSON request.",415);
  const raw=await request.text();if(raw.length>8192)throw new AppError("Request is too large.",413);
  return JSON.parse(raw);
}
export function clientAddress(request:Request){return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"local";}
