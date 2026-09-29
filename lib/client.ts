export async function api<T>(url:string,data?:unknown):Promise<T>{
  const response=await fetch(url,{method:data===undefined?"GET":"POST",credentials:"same-origin",headers:data===undefined?{}:{"Content-Type":"application/json"},body:data===undefined?undefined:JSON.stringify(data),cache:"no-store"});
  const result=await response.json().catch(()=>({error:"The service is unavailable. Please try again."}));
  if(!response.ok)throw new Error((result as {error?:string}).error??"Please try again.");return result as T;
}
