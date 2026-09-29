// Explicit test process only. Graph requests never leave the local machine.
if(process.env.UPSTASH_REDIS_REST_URL==='http://127.0.0.1:8877' && process.env.WHATSAPP_ACCESS_TOKEN==='local-test-only') {
  const realFetch=globalThis.fetch;
  globalThis.fetch=(input,init)=> {
    const url=String(input instanceof Request?input.url:input);
    if(url.startsWith('https://graph.facebook.com/'))return realFetch('http://127.0.0.1:8877/meta',init);
    return realFetch(input,init);
  };
}
