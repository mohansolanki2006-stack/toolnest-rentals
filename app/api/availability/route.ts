import { shops, allTools } from "@/lib/catalog";
import { requireAccount } from "@/lib/server/auth";
import { failure, json } from "@/lib/server/http";
import { AppError, availabilityKey, redis } from "@/lib/server/store";
export async function GET(request:Request){try{
  await requireAccount();const q=new URL(request.url).searchParams;
  const tool=allTools.find(t=>t.name===q.get("tool"));const shop=shops.find(s=>s.name===q.get("shop"));
  if(!tool||!shop)throw new AppError("Unknown tool or shop.");
  return json({days:(await redis<string[]>("HKEYS",availabilityKey({tool,shop}))).map(Number)});
}catch(e){return failure(e);}}
