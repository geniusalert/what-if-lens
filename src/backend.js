let assets={};
export function setStaticAssets(value){assets=value;}
import {checkBudget,scientificRoute} from './scientific-api.js';
import {defaults,validate,solve} from './science.js';
import {visionRoute} from './vision.js';
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const cameraReplies=new Map();
const replyKey=request=>{const id=request.headers.get('X-Camera-Request-Id');return id&&/^[a-f0-9-]{36}$/i.test(id)?id:null;};
const cached=(entry)=>new Response(entry.body,{status:entry.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Camera-Replay':'1'}});
export default {async fetch(request,env={}){
 const path=new URL(request.url).pathname;
 if(path==='/api/status')return json({vision:!!(env.MODEL_API_KEY||env.OPENROUTER_API_KEY),meta:!!env.MODEL_API_KEY,openrouter:!!env.OPENROUTER_API_KEY,model:env.META_MODEL||'muse-spark-1.3'});
 if(path==='/api/classify'||path==='/api/animate'){try{
  const key=replyKey(request),now=Date.now(),prior=key&&cameraReplies.get(key);
  if(prior&&now-prior.created<180000)return cached(prior);
  if(cameraReplies.size>300)cameraReplies.delete(cameraReplies.keys().next().value);
  checkBudget(request,env);const response=await visionRoute(request,env,path);
  if(key){const body=await response.text(),entry={created:now,status:response.status,body};cameraReplies.set(key,entry);return cached(entry);}
  return response;
 }catch(e){return json({error:e.message},429);}}
 if(path==='/api/analyze'||path==='/api/validate'||path==='/api/experiments'||path.startsWith('/api/experiments/'))return scientificRoute(request,env,path);
 if(path==='/api/solve'&&request.method==='POST'){try{const {domain,params}=await request.json();return json({result:solve(domain,params)});}catch(e){return json({error:e.message},400);}}
 if(typeof assets!=='undefined'&&Object.hasOwn(assets,path))return new Response(assets[path],{headers:{'Content-Type':path.endsWith('.css')?'text/css; charset=utf-8':path.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(self), microphone=()','Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'self' https://*.chatgpt.com https://chatgpt.com"}});
 return new Response('Not found',{status:404});
}};
