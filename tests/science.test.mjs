import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,solve,parseQuadratic,command,validate} from '../src/science.js';
import worker from '../src/backend.js';
const near=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<eps,`${a} ≈ ${b}`);
test('camera request id replays a completed response without another model call',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({choices:[{message:{content:JSON.stringify({family:'circuit',title:'Circuit',description:'Diagram',confidence:.9,uncertainty:''})}}]});});
 const headers={'Content-Type':'application/json','X-Camera-Request-Id':'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},body=JSON.stringify({image:'data:image/png;base64,aGVsbG8='});
 const a=await worker.fetch(new Request('https://test/api/classify',{method:'POST',headers,body}),{MODEL_API_KEY:'private'}),b=await worker.fetch(new Request('https://test/api/classify',{method:'POST',headers,body}),{MODEL_API_KEY:'private'});
 assert.equal(a.status,200);assert.equal(b.headers.get('X-Camera-Replay'),'1');assert.equal(calls,1);
});
test('concurrent camera retries share work and reject changed payloads',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;await new Promise(r=>setTimeout(r,15));return Response.json({choices:[{message:{content:JSON.stringify({family:'circuit',title:'Circuit',description:'Diagram',confidence:.9,uncertainty:''})}}]});});
 const headers={'Content-Type':'application/json','X-Camera-Request-Id':'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'},body=JSON.stringify({image:'data:image/png;base64,aGVsbG8='}),make=body=>new Request('https://test/api/classify',{method:'POST',headers,body});
 const [a,b]=await Promise.all([worker.fetch(make(body),{MODEL_API_KEY:'test'}),worker.fetch(make(body),{MODEL_API_KEY:'test'})]);assert.equal(a.status,200);assert.equal(b.status,200);assert.equal(calls,1);
 assert.equal((await worker.fetch(make(JSON.stringify({image:'data:image/png;base64,bmV3'})),{MODEL_API_KEY:'test'})).status,409);
});
test('MATH-01: exact roots, vertex and derivative',()=>{const r=solve('math',parseQuadratic('y = x² − 4x + 3'));assert.deepEqual(r.roots,[1,3]);assert.deepEqual(r.vertex,{x:2,y:-1});assert.deepEqual(r.derivative,[2,-4]);});
test('MATH-02: changing a recomputes roots and derivative',()=>{const p=command('math',defaults.math,'double a').params,r=solve('math',p);assert.deepEqual(r.derivative,[4,-4]);assert.deepEqual(r.vertex,{x:1,y:1});assert.deepEqual(r.roots,[]);});
test('MATH-03: signed integral differs from geometric area',()=>{const r=solve('math',defaults.math);near(r.signed,-4/3);near(r.area,4/3);const p={...defaults.math,lo:0,hi:4};const result=solve('math',p);near(result.signed,4/3);near(result.area,4);});
test('Linear and constant functions have no invented vertex',()=>{const r=solve('math',parseQuadratic('2x-4'));assert.equal(r.vertex,null);assert.deepEqual(r.roots,[2]);assert.deepEqual(solve('math',parseQuadratic('3')).roots,[]);});
test('PHY-01/02/03: circuit causal changes',()=>{let p=defaults.circuit;assert.deepEqual(solve('circuit',p),{current:1.5,power:13.5,resistance:6,voltage:9});p=command('circuit',p,'double resistance').params;assert.equal(solve('circuit',p).current,.75);assert.equal(solve('circuit',p).power,6.75);p=command('circuit',p,'open switch').params;assert.equal(solve('circuit',p).current,0);assert.equal(solve('circuit',p).power,0);});
test('PHY-04: independent projectile analytic references',()=>{const r=solve('projectile',defaults.projectile);near(r.time,2.03873598369,1e-8);near(r.range,35.3119430696,1e-8);near(r.height,5.09683995923,1e-8);near(solve('projectile',{...defaults.projectile,angle:45}).range,400/9.81);});
test('SEC-01: expression grammar rejects scripts and unsupported operators',()=>{for(const s of ['alert(1)','x^1000000','sin(x)','x/x','x^2;fetch("/")','constructor.constructor("return 1")()','2xx','2..3x','x^2 + Infinity'])assert.throws(()=>parseQuadratic(s));});
test('Typed commands reject ambiguity and invalid state',()=>{for(const s of ['double this','remove everything','<script>alert(1)</script>'])assert.throws(()=>command('circuit',defaults.circuit,s));assert.throws(()=>solve('circuit',{v:9,r:0,closed:true}));assert.throws(()=>validate('math',{...defaults.math,a:Infinity}));assert.throws(()=>command('math',defaults.math,'integrate from 3 to 1'));});
test('API: absent key returns honest fallback, solve rejects invalid inputs',async()=>{const status=await worker.fetch(new Request('https://test/api/status'),{});assert.equal((await status.json()).vision,false);const r=await worker.fetch(new Request('https://test/api/analyze',{method:'POST',body:'{}'}),{});assert.equal(r.status,503);const invalid=await worker.fetch(new Request('https://test/api/solve',{method:'POST',body:JSON.stringify({domain:'circuit',params:{v:9,r:0,closed:true}})}),{});assert.equal(invalid.status,400);});
