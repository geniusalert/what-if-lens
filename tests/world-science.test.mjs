import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {parseWorldQuestion,prepareWorldScience,solveWorldScience,validateWorldScience} from '../src/world-science.js';
import {worldExample} from '../src/world-examples.js';import {worldPanelMarkup} from '../src/world-panel.js';
import {validateSceneGraph} from '../src/scene-graph.js';import {LensScene} from '../src/lens-scene.js';import {sceneRoute} from '../src/scene-api.js';
const solve=text=>solveWorldScience(parseWorldQuestion(text).science);
test('500 km/h drag is computed in SI, scales quadratically and separates rolling resistance',()=>{
 const a=solve('Car at 500 km/h, Cd 0.3, frontal area 2.2 m2, air density 1.225, mass 1000 kg, Crr 0.015');
 assert.equal(a.ready,true);assert.ok(Math.abs(a.metrics.drag-7798.032407407408)<1e-7);
 assert.ok(Math.abs(a.metrics.rollingResistance-147.15)<1e-8);assert.ok(Math.abs(a.metrics.totalResistance-a.metrics.drag-147.15)<1e-7);
 const b=solve('Car at 250 km/h, Cd 0.3, area 2.2 m2, density 1.225');assert.ok(Math.abs(a.metrics.drag/b.metrics.drag-4)<1e-10);
});
test('a car photo or speed alone cannot fabricate Cd, area, density or friction',()=>{
 const {science}=parseWorldQuestion('What is the drag at 500 km/h?');const result=solveWorldScience(science);
 assert.equal(result.ready,false);assert.deepEqual(result.missing,['dragCoefficient','frontalArea','airDensity']);assert.deepEqual(result.metrics,{});
 assert.equal(science.inputs.find(p=>p.name==='mass').value,null);
 assert.throws(()=>validateWorldScience({...science,inputs:[{name:'frontalArea',value:2,unit:'m2',origin:'unknown'}]}));
 const friction=parseWorldQuestion('friction coefficient 0.4',science);assert.equal(friction.science.calculator,'drag');assert.ok(!friction.science.inputs.some(p=>p.name==='muStatic'));
});
test('the onset angle is mass-independent and kinetic acceleration requires its own coefficient',()=>{
 const a=solve('Sliding friction 0.4, mass 1 kg');const b=solve('Sliding friction 0.4, mass 1000 kg');
 assert.ok(Math.abs(a.metrics.criticalAngle-21.80140948635181)<1e-10);assert.equal(a.metrics.criticalAngle,b.metrics.criticalAngle);
 const c=solve('Slide with static friction 0.4, angle 30 deg, mass 2 kg');assert.equal(c.metrics.slides,true);assert.equal(c.metrics.acceleration,undefined);
 const d=solve('Slide with static friction 0.4, kinetic friction 0.2, angle 30 deg');assert.ok(Math.abs(d.metrics.acceleration-3.20585815777493)<1e-9);
});
test('beam reactions balance forces and moments without claiming to solve a curved arch',()=>{
 const s=parseWorldQuestion('bridge load 1 kN, span 10 m, position 3 m').science;const r=solveWorldScience(s);
 assert.equal(r.metrics.leftReaction,700);assert.equal(r.metrics.rightReaction,300);assert.equal(r.metrics.rightReaction*10,1000*3);assert.match(r.assumptions[0],/does not solve arch thrust/);
 s.inputs.find(p=>p.name==='position').value=11;assert.throws(()=>solveWorldScience(s));
});
test('input changes preserve known values, convert units and reject non-finite or incompatible inputs',()=>{
 const a=parseWorldQuestion('drag 100 m/s, Cd 0.3, area 2 m2, density 1.2').science;assert.equal(a.inputs.find(p=>p.name==='speed').value,360);
 const b=parseWorldQuestion('200 km/h',a).science;assert.equal(b.inputs.find(p=>p.name==='dragCoefficient').value,.3);
 b.inputs.find(p=>p.name==='frontalArea').value=NaN;assert.throws(()=>solveWorldScience(b));
 assert.throws(()=>solve('Slide with static friction 0.1, kinetic friction 0.3'));
});
test('real-object examples render compound actors and input explanations are escaped',()=>{
 for(const kind of ['bridge','vehicle','surface']){const scene=validateSceneGraph(worldExample(kind));const renderer=Object.create(LensScene.prototype);renderer.group=new THREE.Group();renderer.frame=()=>{};renderer.setScene(scene);assert.ok(renderer.group.children.length>=4);renderer.updateScene(2);renderer.clear();assert.equal(renderer.group.children.length,0);}
 const s=prepareWorldScience({...worldExample('vehicle').science,explanation:'<script>bad()</script>'});const html=worldPanelMarkup(s,solveWorldScience(s));assert.ok(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);
});
test('one observation produces both real-object geometry and science context through Meta',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.match(body.messages[1].content[0].text,/Explain this bridge/);assert.ok(body.response_format.json_schema.schema.properties.science);return Response.json({choices:[{message:{content:JSON.stringify(worldExample('bridge'))}}]});});
 const r=await sceneRoute(new Request('https://test/api/lens/scene',{method:'POST',body:JSON.stringify({image:'data:image/jpeg;base64,aGVsbG8=',question:'Explain this bridge'})}),{MODEL_API_KEY:'test'});const data=await r.json();assert.equal(r.status,200);assert.equal(calls,1);assert.equal(data.value.science.kind,'bridge');assert.equal(data.trace.provider,'Meta');
});
test('live real-world overlays keep the object translucent and force annotations legible',()=>{
 const renderer=Object.create(LensScene.prototype);renderer.group=new THREE.Group();renderer.overlay=true;renderer.setScene(worldExample('vehicle'));renderer.present(renderer.direction.frame(5));
 const car=renderer.generated.find(i=>i.node.id==='car');let opacity;car.object.traverse(o=>{if(o.isMesh)opacity=o.material.opacity;});assert.ok(opacity>0&&opacity<.3);
 const science=parseWorldQuestion('car at 0 km/h Cd 0.3 area 2.2 m2 density 1.225').science;renderer.setScienceResult(science,solveWorldScience(science));renderer.present(renderer.direction.frame(5));
 assert.equal(renderer.generated.find(i=>i.node.id==='drag').holder.visible,false);assert.equal(renderer.generated.find(i=>i.node.id==='air1').particles.visible,false);
 renderer.setScienceResult(prepareWorldScience(worldExample('vehicle').science),{ready:false});assert.equal(renderer.generated.find(i=>i.node.id==='drag').forceZero,false);assert.equal(renderer.generated.find(i=>i.node.id==='air1').particles.visible,true);
 renderer.clear();assert.equal(renderer.group.children.length,0);
});
