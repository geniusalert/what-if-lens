import worker from '../src/backend.js';

// Keep the same application API on Vercel's Node.js runtime.
export default {
 async fetch(request) {
  const url=new URL(request.url),path=url.searchParams.get('__lens_path');
  if(path!==null){
   if(!/^[a-zA-Z0-9_/-]*$/.test(path))return Response.json({error:'Invalid API path.'},{status:400});
   url.pathname='/api/'+path;url.searchParams.delete('__lens_path');
  }
  const headers=new Headers(request.headers);
  // Only trust Vercel's forwarded identity; incoming Sites/Cloudflare headers
  // are caller-controlled on this host and must not bypass request budgets.
  headers.delete('oai-authenticated-user-id');headers.delete('CF-Connecting-IP');
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if(ip)headers.set('CF-Connecting-IP',ip);
  const init={method:request.method,headers};
  if(request.method!=='GET'&&request.method!=='HEAD'){init.body=request.body;init.duplex='half';}
  try{return await worker.fetch(new Request(url,init),process.env);}
  catch{console.error('Lens API request failed',{path:url.pathname});return Response.json({error:'The server could not complete this request. Please retry.'},{status:500,headers:{'Cache-Control':'no-store'}});}
 }
};
