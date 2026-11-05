import test from 'node:test';import assert from 'node:assert/strict';
import {sampleIR,solveIR,frameState,applyScientificPatch} from '../src/compiler.js';
import {planForExperiment} from '../src/live-experiment.js';
import {lensRoute} from '../src/lens-api.js';
const plan={explanation:'A curve',equation:'y=x²',assumptions:[],tracks:[{kind:'trace',label:'Parabola',speed:1,points:[{x:.2,y:.2},{x:.5,y:.8},{x:.8,y:.2}]}],markers:[]};
test('quadratic model solves roots, vertex, discriminant and exact animated values',()=>{
 const ir=sampleIR('quadratic'),run=solveIR(ir);assert.deepEqual(run.metrics.roots,[1,3]);assert.deepEqual(run.metrics.vertex,{x:2,y:-1});assert.equal(run.metrics.discriminant,4);
 for(const t of [0,1,2.5,6]){const f=frameState(run,t);assert.equal(f.y,f.x*f.x-4*f.x+3);assert.equal(f.slope,2*f.x-4);}
 const next=applyScientificPatch(ir,{intent:'set_parameter',property:'a',value:2,unit:'1'});assert.deepEqual(solveIR(next).metrics.roots,[]);assert.equal(next.parameters.a.origin,'confirmed');
 ir.parameters.a.value=0;assert.deepEqual(solveIR(ir).metrics.roots,[.75]);
});
test('live scientific patch changes a drawn trajectory within source image bounds',()=>{
 const base=sampleIR('projectile'),next=applyScientificPatch(base,{intent:'set_parameter',property:'angle',value:60,unit:'deg'}),a=planForExperiment(base,base,plan),b=planForExperiment(next,base,plan);
 assert.notDeepEqual(a.tracks[0].points,b.tracks[0].points);assert.ok(b.tracks[0].points.every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1));
 const circuit=sampleIR('circuit');circuit.closed=false;assert.equal(planForExperiment(circuit,sampleIR('circuit'),plan).tracks.length,0);
});
test('mass changes forces without inventing a change in incline acceleration',()=>{
 const before=sampleIR('incline'),next=applyScientificPatch(before,{intent:'set_parameter',property:'mass',value:4,unit:'kg'}),a=solveIR(before),b=solveIR(next);assert.equal(a.metrics.acceleration,b.metrics.acceleration);assert.equal(b.metrics.normal,2*a.metrics.normal);
});
test('unified prompt endpoint validates typed patches and reports unsupported edits honestly',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({choices:[{message:{content:JSON.stringify(calls===1?{intent:'set_parameter',target:'',property:'a',value:2,unit:'1',expression:'',reason:'Double the quadratic coefficient.'}:{intent:'unsupported',target:'',property:'',value:0,unit:'',expression:'',reason:'Mass does not change a mathematical curve.'})}}]});});
 const request=instruction=>new Request('https://test/api/lens/edit',{method:'POST',body:JSON.stringify({ir:sampleIR('quadratic'),instruction})});
 const a=await (await lensRoute(request('double a'),{MODEL_API_KEY:'test'})).json();assert.equal(a.value.ir.parameters.a.value,2);assert.equal(a.trace.provider,'Meta');
 const b=await (await lensRoute(request('increase ball weight'),{MODEL_API_KEY:'test'})).json();assert.equal(b.value.unsupported,true);assert.match(b.value.reason,/Mass/);
});
