import {validateClassification,validateMotionPlan} from './vision.js';
// Provider retries live on the server. Do not silently repeat chargeable POSTs here.
export async function cameraRequest(path,body,{signal,fetcher=fetch,timeoutMs=125000}={}){
 const controller=new AbortController(),abort=()=>controller.abort();
 if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetcher(path,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  let data;try{data=await response.json();}catch{throw Error('The server returned an unreadable response. Your captured diagram is safe; retry when the connection is stable.');}
  if(!response.ok){const error=Error((data.error||'The server could not complete this request.')+(data.trace?.requestId?' Reference: '+data.trace.requestId:''));error.status=response.status;throw error;}
  if(path==='/api/classify')validateClassification(data.classification);
  if(path==='/api/animate')validateMotionPlan(data.plan);
  return data;
 }catch(e){
  if(controller.signal.aborted)throw Error(signal?.aborted?'Analysis cancelled.':'The server took too long. Your captured diagram is safe; retry animation.');
  if(e instanceof TypeError)throw Error('Could not reach the server. Check your connection, then retry the held frame.');
  throw e;
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
