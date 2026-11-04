import test from 'node:test';import assert from 'node:assert/strict';
import {visionRoute} from '../src/vision.js';
const image='data:image/png;base64,aGVsbG8=',classification={family:'circuit',title:'Circuit',description:'Series circuit',confidence:.9,uncertainty:''};
const plan={explanation:'Illustrative current',equation:'I=V/R',assumptions:[],tracks:[{kind:'flow',label:'Wire',points:[{x:0,y:0},{x:1,y:1}],speed:1}],markers:[]};
const request=()=>new Request('https://test/api/animate',{method:'POST',body:JSON.stringify({image,classification})});
const success=()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(plan)}}]});
test('animation retries a timeout once and returns a validated plan with evidence',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{if(++calls===1)throw new DOMException('Timed out','TimeoutError');return success();});
 const r=await visionRoute(request(),{MODEL_API_KEY:'private-key'},'/api/animate'),d=await r.json();
 assert.equal(r.status,200);assert.equal(calls,2);assert.equal(d.trace.attempts[0].status,'timeout');assert.equal(d.trace.attempts[1].status,200);assert.ok(!JSON.stringify(d).includes('private-key'));
});
test('authentication failures do not retry and identify the actual problem',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('private upstream details',{status:401});});
 const r=await visionRoute(request(),{MODEL_API_KEY:'secret'},'/api/animate'),d=await r.json();
 assert.equal(calls,1);assert.match(d.error,/401/);assert.ok(!JSON.stringify(d).includes('private upstream'));
});
test('truncated or invalid JSON is repaired with a compact second request',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async(url,opt)=>{calls++;if(calls===1)return Response.json({choices:[{finish_reason:'length',message:{content:'{"tracks":['}}]});assert.match(JSON.parse(opt.body).messages[0].content,/at most 4 tracks/);return success();});
 const r=await visionRoute(request(),{MODEL_API_KEY:'secret'},'/api/animate');assert.equal(r.status,200);assert.equal(calls,2);
});
test('repeated timeouts stop after two attempts with actionable message',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;throw new DOMException('Timed out','TimeoutError');});
 const d=await (await visionRoute(request(),{MODEL_API_KEY:'secret'},'/api/animate')).json();
 assert.equal(calls,2);assert.match(d.error,/took too long/);assert.match(d.error,/key is connected/);assert.equal(d.trace.attempts.length,2);
});
test('temporary server errors retry, rate limits do not retry',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>++calls===1?new Response('',{status:503}):success());
 assert.equal((await visionRoute(request(),{MODEL_API_KEY:'secret'},'/api/animate')).status,200);assert.equal(calls,2);
 t.mock.restoreAll();calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('',{status:429});});
 const d=await (await visionRoute(request(),{MODEL_API_KEY:'secret'},'/api/animate')).json();assert.equal(calls,1);assert.match(d.error,/429/);
});
