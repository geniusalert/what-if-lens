import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {suspendedPulleyScene,bindPulleyContact} from '../src/suspended-pulley.js';
import {sceneObjectState,validateSceneGraph} from '../src/scene-graph.js';
import {LensScene} from '../src/lens-scene.js';
import {closestMotionTime} from '../src/xr-manipulation.js';
import worker from '../src/backend.js';

const draft={subject:'suspended_pulley',objects:[
 {id:'a',primitive:'torus',position:[.28,.23,0],size:[.15,.18,.06]},
 {id:'b',primitive:'torus',position:[.72,.24,0],size:[.14,.17,.06]},
 {id:'mass',label:'Mass M',primitive:'box',position:[.49,.78,0],size:[.13,.11,.08]}
]};
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} and ${b}`);

test('both ropes stay on their rims and meet the load throughout the stroke',()=>{
 const graph=validateSceneGraph(suspendedPulleyScene(draft));
 const nodes=new Map(graph.objects.map(n=>[n.id,n]));
 for(const rope of graph.objects.filter(n=>n.pulleyContact)){
  const rig=bindPulleyContact(rope,nodes),r=rig.wheel.size[1]/2;
  let initial;
  for(const time of [0,.25,1,2.5,4,5,1,0]){
   const y=sceneObjectState(rig.load,time).position[1],{points,end,rotation}=rig.at(y);
   const center=rig.wheel.position,arc=points.slice(1,-1);
   const radial=p=>[(p[0]-center[0])*1.25,p[1]-center[1]];
   for(const p of arc)near(Math.hypot(...radial(p)),r);
   const tangent=arc.at(-1),junction=points.at(-1);
   near(junction[1],y-rig.load.size[1]/2);
   const span=[(junction[0]-tangent[0])*1.25,junction[1]-tangent[1]];
   const [rx,ry]=radial(tangent);
   near(rx*span[0]+ry*span[1],0);
   let arcLength=0;
   for(let i=1;i<arc.length;i++){
    const [ax,ay]=radial(arc[i-1]),[bx,by]=radial(arc[i]);
    arcLength+=r*Math.abs(Math.atan2(ax*by-ay*bx,ax*bx+ay*by));
   }
   const length=end[1]-center[1]+arcLength+Math.hypot(...span);
   initial??=length;near(length,initial);
   near(Math.abs(rotation)*r,end[1]-rig.end.position[1]);
   if(time===2.5)assert.ok(end[1]>rig.end.position[1]);
  }
 }
});

test('dragging a pull handle selects the raised pose and replay restores the original mesh',()=>{
 const graph=suspendedPulleyScene(draft),lens=Object.create(LensScene.prototype);
 lens.group=new THREE.Group();lens.setScene(graph);
 const byId=id=>lens.generated.find(item=>item.node.id===id);
 const cable=byId('rope-A').object.geometry.getAttribute('position');
 const initial=cable.array.slice(),end=byId('end-P'),start=end.holder.position.clone();
 const t=closestMotionTime(end.node,end.node.points.at(-1),0);
 lens.updateScene(t);
 assert.ok(end.holder.position.y<start.y);
 assert.ok(byId('wheel-A').holder.rotation.z*byId('wheel-B').holder.rotation.z<0);
 assert.notDeepEqual(cable.array,initial);
 lens.updateScene(0);assert.deepEqual(cable.array,initial);lens.clear();
});

test('the ordinary photo route compiles Meta landmarks and makes one request',async t=>{
 const calls=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  calls.push([url,JSON.parse(options.body).model]);
  return Response.json({choices:[{message:{content:JSON.stringify(draft)}}]});
 });
 const request=new Request('https://lens.test/api/lens/scene',{method:'POST',body:JSON.stringify({
  image:'data:image/png;base64,YQ==',verifySource:true
 })});
 const response=await worker.fetch(request,{MODEL_API_KEY:'test',GEMINI_API_KEY:'unused'});
 const {value}=await response.json();
 assert.equal(response.status,200);
 assert.equal(value.objects.filter(n=>n.pulleyContact).length,2);
 assert.deepEqual(calls,[['https://api.meta.ai/v1/chat/completions','muse-wonder-1.0']]);
 const retired=await worker.fetch(new Request('https://lens.test/api/lens/compare'),{});
 assert.equal(retired.status,404);
 assert.equal(calls.length,1);
});
