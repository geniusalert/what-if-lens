import test from 'node:test';import assert from 'node:assert/strict';import {cameraRequest} from '../src/camera-api.js';
const classification={family:'circuit',title:'Circuit',description:'Wire',confidence:.9,uncertainty:''};
test('camera API validates success and does not replay chargeable requests',async()=>{
 let calls=0;const d=await cameraRequest('/api/classify',{}, {fetcher:async()=>{calls++;return Response.json({classification});}});
 assert.equal(d.classification.family,'circuit');assert.equal(calls,1);
 await assert.rejects(cameraRequest('/api/animate',{}, {fetcher:async()=>Response.json({plan:{}})}),/Invalid animation/);
});
test('camera API distinguishes quota, unreadable responses and offline failures',async()=>{
 let calls=0;await assert.rejects(cameraRequest('/api/animate',{}, {fetcher:async()=>{calls++;return Response.json({error:'Quota reached',trace:{requestId:'test-123'}},{status:429});}}),e=>e.status===429&&e.message.includes('test-123'));
 assert.equal(calls,1);
 await assert.rejects(cameraRequest('/api/animate',{}, {fetcher:async()=>new Response('<html>Gateway failure</html>',{status:502})}),/unreadable response/);
 await assert.rejects(cameraRequest('/api/animate',{}, {fetcher:async()=>{throw new TypeError('fetch failed');}}),/Check your connection/);
});
test('camera API cancels pending work and releases its timeout',async()=>{
 const c=new AbortController();c.abort();await assert.rejects(cameraRequest('/api/animate',{}, {signal:c.signal,fetcher:async(url,opt)=>{assert.ok(opt.signal.aborted);throw new DOMException('cancelled','AbortError');}}),/cancelled/);
 const fetcher=(url,opt)=>new Promise((resolve,reject)=>opt.signal.addEventListener('abort',()=>reject(new DOMException('timeout','AbortError'))));
 await assert.rejects(cameraRequest('/api/animate',{}, {timeoutMs:5,fetcher}),/took too long/);
});
