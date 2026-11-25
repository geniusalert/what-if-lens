export function comparisonConfig(env){
 return {
  meta:{provider:'Meta',model:env.META_COMPARISON_MODEL||'muse-wonder-1.0',configured:!!env.MODEL_API_KEY},
  gemini:{provider:'Google',model:env.GEMINI_MODEL||'gemini-4-hydrogen',configured:!!env.GEMINI_API_KEY}
 };
}

function retrySeconds(response,body){
 const header=response.headers.get('Retry-After');
 const raw=body?.error?.details?.find(detail=>detail['@type']==='type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;
 const seconds=header===null?Number.parseFloat(raw):/^\d+$/.test(header)?Number(header):(Date.parse(header)-Date.now())/1000;
 return Number.isFinite(seconds)&&seconds>0?Math.ceil(seconds):undefined;
}

function providerProblem(code,provider,retryAfter){
 if(code===429)return provider==='Google'
  ?'Google reached a project quota. Check the Gemini model’s active limits in AI Studio.'+(retryAfter?' Try again in '+retryAfter+' seconds.':'')
  :'Meta reached a rate or usage limit. Check your Model API project.';
 if([400,401,403,404].includes(code))return provider+' could not use this model. Check the server key, project access, and model setting.';
 return provider+' is temporarily unavailable. Try another comparison later.';
}

export async function generateComparison({config,key,system,prompt,image,schema,signal,validate}){
 const {provider,model}=config;
 const started=performance.now();
 const elapsed=()=>Math.round(performance.now()-started);
 const error=(code,message,retryAfter)=>({provider,model,ms:elapsed(),code,error:message,...(retryAfter?{retryAfter}:{})});
 try{
  const meta=provider==='Meta';
  const timeout=AbortSignal.timeout(90000);
  const combined=signal?AbortSignal.any([signal,timeout]):timeout;
  const [prefix,base64]=image.split(',',2);
  const mimeType=prefix.slice(5,-7);
  const url=meta?'https://api.meta.ai/v1/chat/completions':
   'https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent';
  const credentials=meta?{Authorization:'Bearer '+key}:{'x-goog-api-key':key};
  const metaInput={
   model,reasoning_effort:'high',max_completion_tokens:10000,
   messages:[
    {role:'system',content:system},
    {role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:image}}]}
   ],
   response_format:{type:'json_schema',json_schema:{name:'AnimatedScene',strict:true,schema}}
  };
  const googleInput={
   systemInstruction:{parts:[{text:system}]},
   contents:[{role:'user',parts:[{text:prompt},{inlineData:{mimeType,data:base64}}]}],
   generationConfig:{maxOutputTokens:10000,responseMimeType:'application/json',responseJsonSchema:schema}
  };
  const response=await fetch(url,{
   method:'POST',signal:combined,headers:{'Content-Type':'application/json',...credentials},
   body:JSON.stringify(meta?metaInput:googleInput)
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok){
   const retryAfter=response.status===429?retrySeconds(response,data):undefined;
   return error(response.status,providerProblem(response.status,provider,retryAfter),retryAfter);
  }
  const choice=data?.candidates?.[0];
  const content=meta?data?.choices?.[0]?.message?.content:choice?.content?.parts?.filter(part=>!part.thought&&typeof part.text==='string').map(part=>part.text).join('');
  if(!content)return error(422,provider+' returned no usable scene.');
  const tokens=meta?data.usage?.completion_tokens:data.usage?.candidatesTokenCount;
  try{
   const value=validate(JSON.parse(content));
   if(!value)return error(422,provider+' could not identify a clear subject in the photo.');
   return {provider,model,ms:elapsed(),value,...(Number.isFinite(tokens)?{outputTokens:tokens}:{})};
  }catch{
   return error(422,provider+' returned a scene that could not be rendered.');
  }
 }catch(e){
  if(e.name==='TimeoutError')return error(504,provider+' timed out.');
  if(e.name==='AbortError')return error(499,'Comparison cancelled.');
  return error(502,provider+' could not be reached.');
 }
}
