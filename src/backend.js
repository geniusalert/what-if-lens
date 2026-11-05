let assets={};
export function setStaticAssets(value){assets=value;}
import {checkBudget,scientificRoute} from './scientific-api.js';
import {defaults,validate,solve} from './science.js';
import {visionRoute} from './vision.js';
import {lensRoute} from './lens-api.js';
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const cameraReplies=new Map();
const replyKey=request=>{const id=request.headers.get('X-Camera-Request-Id');return id&&/^[a-f0-9-]{36}$/i.test(id)?id:null;};
const cached=(entry)=>new Response(entry.body,{status:entry.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Camera-Replay':'1'}});
export default {async fetch(request,env={}){
 const path=new URL(request.url).pathname;
 if(path==='/api/lens/edit')return lensRoute(request,env);
 if(path==='/api/status')return json({vision:!!(env.MODEL_API_KEY||env.OPENROUTER_API_KEY),meta:!!env.MODEL_API_KEY,openrouter:!!env.OPENROUTER_API_KEY,model:env.META_MODEL||'muse-spark-1.3'});
 if(path==='/api/classify'||path==='/api/animate'){try{
  const id=replyKey(request),now=Date.now();
  if(!id){checkBudget(request,env);return visionRoute(request,env,path);}
  const raw=await request.text();if(raw.length>7000000)return json({error:'Image too large.'},413);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)),hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''),who=request.headers.get('oai-authenticated-user-id')||request.headers.get('CF-Connecting-IP')||'local',key=who+':'+path+':'+id,prior=cameraReplies.get(key);
  if(prior&&now-prior.created<180000){if(prior.hash!==hash)return json({error:'Request ID was already used for different image data.'},409);return cached(await prior.promise);}
  for(const[k,v]of cameraReplies)if(now-v.created>180000)cameraReplies.delete(k);
  if(cameraReplies.size>100)cameraReplies.delete(cameraReplies.keys().next().value);
  checkBudget(request,env);
  const promise=visionRoute(new Request(request.url,{method:request.method,headers:request.headers,body:raw}),env,path).then(async response=>({body:await response.text(),status:response.status}));
  cameraReplies.set(key,{created:now,hash,promise});return cached(await promise);
 }catch(e){return json({error:e.message},429);}}
 if(path==='/api/analyze'||path==='/api/validate'||path==='/api/experiments'||path.startsWith('/api/experiments/'))return scientificRoute(request,env,path);
 if(path==='/api/solve'&&request.method==='POST'){try{const {domain,params}=await request.json();return json({result:solve(domain,params)});}catch(e){return json({error:e.message},400);}}
 if(typeof assets!=='undefined'&&Object.hasOwn(assets,path))return new Response(assets[path],{headers:{'Content-Type':path.endsWith('.css')?'text/css; charset=utf-8':path.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(self), microphone=()','Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self' https://*.chatgpt.com https://chatgpt.com"}});
 return new Response('Not found',{status:404});
}};
