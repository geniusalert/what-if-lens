import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/backend.js';
import {samplePulleyScene} from '../src/scene-graph.js';

const image='data:image/png;base64,cGhvdG8=';
const env={MODEL_API_KEY:'test-meta-key',GEMINI_API_KEY:'test-google-key'};
const scene={...samplePulleyScene(),subject:'visible',annotations:{target:'Pulley',paths:[],occluders:[]}};
const request=(body={image},headers={})=>new Request('https://lens.test/api/lens/compare',{method:'POST',headers,body:JSON.stringify(body)});

test('each model sees the same image and instructions and creates its own result',async t=>{
 const calls=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  const body=JSON.parse(options.body);
  calls.push({url,body,headers:options.headers});
  if(url.includes('meta.ai'))return Response.json({choices:[{message:{content:JSON.stringify({...scene,title:'Meta scene'})}}]});
  return Response.json({candidates:[{content:{parts:[{thought:true,text:'internal'},{text:JSON.stringify({...scene,title:'Gemini scene'})}]}}]});
 });
 const headers={'X-Camera-Request-Id':'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'};
 const [a,b]=await Promise.all([worker.fetch(request({image},headers),env),worker.fetch(request({image},headers),env)]);
 assert.equal(a.status,200);
 assert.equal(b.status,200);
 assert.equal(calls.length,2);
 const [meta,gemini]=calls;
 assert.equal(meta.body.model,'muse-wonder-1.0');
 assert.match(gemini.url,/\/gemini-3.1-flash-lite:generateContent$/);
 assert.equal(meta.body.messages[1].content[1].image_url.url,image);
 assert.deepEqual(gemini.body.contents[0].parts[1].inlineData,{mimeType:'image/png',data:'cGhvdG8='});
 assert.equal(meta.body.messages[0].content,gemini.body.systemInstruction.parts[0].text);
 assert.equal(meta.body.messages[1].content[0].text,gemini.body.contents[0].parts[0].text);
 const geometry=gemini.body.generationConfig.responseJsonSchema.properties.objects.items.properties;
 assert.equal(geometry.position.minItems,3);
 assert.equal(geometry.position.maxItems,3);
 assert.equal(geometry.motion.properties.amplitude.maximum,.5);
 assert.deepEqual(geometry.primitive,meta.body.response_format.json_schema.schema.properties.objects.items.properties.primitive);
 assert.equal(meta.headers.Authorization,'Bearer '+env.MODEL_API_KEY);
 assert.equal(gemini.headers['x-goog-api-key'],env.GEMINI_API_KEY);
 const result=await a.json();
 assert.equal(result.meta.value.title,'Meta scene');
 assert.equal(result.gemini.value.title,'Gemini scene');
 assert.ok(!JSON.stringify(result).includes('-key'));
});

test('Google quota leaves the valid Meta scene available and does not retry',async t=>{
 let googleCalls=0;
 t.mock.method(globalThis,'fetch',async url=>{
  if(url.includes('meta.ai'))return Response.json({choices:[{message:{content:JSON.stringify(scene)}}]});
  googleCalls++;
  return Response.json({error:{details:[{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'14.5s'}]}},{status:429});
 });
 const response=await worker.fetch(request(),env);
 const {meta,gemini}=await response.json();
 assert.equal(response.status,200);
 assert.equal(googleCalls,1);
 assert.equal(meta.value.title,scene.title);
 assert.equal(gemini.code,429);
 assert.equal(gemini.retryAfter,15);
 assert.match(gemini.error,/active limits in AI Studio/);
});

test('missing credentials and invalid input never spend either provider quota',async t=>{
 const calls=t.mock.method(globalThis,'fetch',()=>{throw Error('Unexpected provider request');});
 assert.equal((await worker.fetch(request(),{MODEL_API_KEY:'test'})).status,503);
 assert.equal((await worker.fetch(request({image:'bad'}),env)).status,400);
 const config=await (await worker.fetch(new Request('https://lens.test/api/lens/compare'),{GEMINI_API_KEY:'secret'})).json();
 assert.equal(config.meta.configured,false);
 assert.equal(config.gemini.configured,true);
 assert.ok(!JSON.stringify(config).includes('secret'));
 assert.equal(calls.mock.callCount(),0);
});

test('Gemini corrects rejected geometry using its own draft and the original image',async t=>{
 const drafts=[];
 const invalid=structuredClone(scene);
 invalid.objects[0].position=[.5,.5];
 let metaCalls=0;
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(url.includes('meta.ai')){
   metaCalls++;
   return Response.json({choices:[{message:{content:JSON.stringify({...scene,title:'Meta only'})}}]});
  }
  drafts.push(JSON.parse(options.body));
  const value=drafts.length===1?invalid:scene;
  return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}],usageMetadata:{candidatesTokenCount:100}});
 });
 const {meta,gemini}=await (await worker.fetch(request(),env)).json();
 assert.equal(metaCalls,1);
 assert.equal(drafts.length,2);
 assert.deepEqual(drafts[0].contents[0],drafts[1].contents[0]);
 assert.deepEqual(JSON.parse(drafts[1].contents[1].parts[0].text),invalid);
 assert.match(drafts[1].contents[2].parts[0].text,/Invalid generated object/);
 assert.equal(gemini.value.title,scene.title);
 assert.equal(gemini.corrected,true);
 assert.equal(gemini.outputTokens,200);
 assert.equal(meta.value.title,'Meta only');
});

test('a truncated Gemini reply gets at most one correction and reports the reason',async t=>{
 let calls=0;
 t.mock.method(globalThis,'fetch',async url=>{
  if(url.includes('meta.ai'))return Response.json({},{status:503});
  calls++;
  return Response.json({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{"objects":'}]}}]});
 });
 const {gemini}=await (await worker.fetch(request(),env)).json();
 assert.equal(calls,2);
 assert.equal(gemini.code,422);
 assert.match(gemini.error,/output limit/);
});
