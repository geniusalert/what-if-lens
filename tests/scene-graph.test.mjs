import test from 'node:test';import assert from 'node:assert/strict';
import {validateSceneGraph,sceneObjectState,samplePulleyScene} from '../src/scene-graph.js';import {sceneRoute} from '../src/scene-api.js';
import {LensScene} from '../src/lens-scene.js';import * as THREE from 'three';import worker from '../src/backend.js';
import {compoundPulleyScene} from '../src/compound-pulley.js';
test('scene renderer creates real meshes and advances their transforms',()=>{const renderer=Object.create(LensScene.prototype);renderer.group=new THREE.Group();renderer.overlay=false;renderer.frame=()=>{};renderer.setScene(samplePulleyScene());const mass=renderer.generated.find(o=>o.node.id==='mass1'),before=mass.holder.position.y;let meshes=0;renderer.group.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>=5);renderer.updateScene(1);assert.notEqual(mass.holder.position.y,before);renderer.clear();assert.equal(renderer.group.children.length,0);});
test('duplicate scene generation requests share the same in-flight model call',async t=>{let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;await new Promise(r=>setTimeout(r,10));return Response.json({choices:[{message:{content:JSON.stringify(samplePulleyScene())}}]});});const make=()=>new Request('https://test/api/lens/scene',{method:'POST',headers:{'Content-Type':'application/json','X-Camera-Request-Id':'cccccccc-cccc-4ccc-8ccc-cccccccccccc'},body:JSON.stringify({image:'data:image/jpeg;base64,aGVsbG8='})});const [a,b]=await Promise.all([worker.fetch(make(),{MODEL_API_KEY:'test'}),worker.fetch(make(),{MODEL_API_KEY:'test'})]);assert.equal(a.status,200);assert.equal(b.status,200);assert.equal(calls,1);});
test('a pulley scene contains animated geometry with opposite constrained displacements',()=>{const scene=validateSceneGraph(samplePulleyScene()),a=scene.objects.find(n=>n.id==='mass1'),b=scene.objects.find(n=>n.id==='mass2');for(const t of [.25,1,1.5,2.5]){const da=sceneObjectState(a,t).position[1]-a.position[1],db=sceneObjectState(b,t).position[1]-b.position[1];assert.ok(Math.abs(da+db)<1e-12);}assert.notEqual(sceneObjectState(scene.objects[1],0).rotation[2],sceneObjectState(scene.objects[1],1).rotation[2]);});
test('scene validation rejects empty/static descriptions, duplicate identities and executable object kinds',()=>{const s=samplePulleyScene();assert.throws(()=>validateSceneGraph({...s,objects:[]}));assert.throws(()=>validateSceneGraph({...s,objects:s.objects.map(n=>({...n,motion:{...n.motion,type:'none'}}))}));assert.throws(()=>validateSceneGraph({...s,objects:[...s.objects,s.objects[0]]}));assert.throws(()=>validateSceneGraph({...s,objects:s.objects.map((n,i)=>i? n:{...n,primitive:'execute_js'})}));assert.throws(()=>validateSceneGraph({...s,objects:s.objects.map((n,i)=>i? n:{...n,position:[Infinity,0,0]})}));});
test('generated scenes are rendered data, not a request for another supported model',async t=>{let called=0;t.mock.method(globalThis,'fetch',async(url,options)=>{called++;const b=JSON.parse(options.body);assert.equal(b.response_format.json_schema.name,'AnimatedScene');assert.match(b.messages[0].content,/Pulley and coupled-body diagrams ARE supported/);return Response.json({choices:[{message:{content:JSON.stringify(samplePulleyScene())}}]});});const response=await sceneRoute(new Request('https://test/api/lens/scene',{method:'POST',body:JSON.stringify({image:'data:image/jpeg;base64,aGVsbG8='})}),{MODEL_API_KEY:'test-key'}),body=await response.json();assert.equal(response.status,200);assert.ok(body.value.objects.length>=5);assert.equal(body.trace.provider,'Meta');assert.equal(called,1);assert.ok(!JSON.stringify(body).includes('test-key'));});
test('scene endpoint can change a generated model without executing user code',async t=>{t.mock.method(globalThis,'fetch',async()=>Response.json({choices:[{message:{content:JSON.stringify(samplePulleyScene())}}]}));const r=await sceneRoute(new Request('https://test/api/lens/scene',{method:'POST',body:JSON.stringify({scene:samplePulleyScene(),instruction:'Make the blocks move more slowly'})}),{MODEL_API_KEY:'test'});assert.equal(r.status,200);assert.equal((await r.json()).value.objects[1].primitive,'torus');});

test('photo reconstruction preserves a grounded two-pulley diagram and rejects a blank view',async t=>{
 let subject='compound_pulley',calls=0;
 t.mock.method(globalThis,'fetch',async(_url,options)=>{
  calls++;
  const {messages,response_format}=JSON.parse(options.body);
  assert.match(messages[0].content,/distinct lower rope connecting two masses/);
  assert.match(messages[1].content[0].text,/0.5, 0.5/);
  assert.ok(response_format.json_schema.schema.required.includes('subject'));
  return Response.json({choices:[{message:{content:JSON.stringify({subject,objects:[]})}}]});
 });
 const request=()=>new Request('https://test/api/lens/scene',{method:'POST',headers:{'oai-authenticated-user-id':'photo-subject-test'},body:JSON.stringify({
  image:'data:image/jpeg;base64,aGVsbG8=',verifySource:true,selection:{x:.5,y:.5}
 })});
 const response=await sceneRoute(request(),{MODEL_API_KEY:'test'});
 assert.equal(response.status,200);
 const {value}=await response.json();
 assert.equal(value.objects.filter(node=>node.primitive==='torus').length,2);
 assert.equal(value.objects.filter(node=>node.primitive==='line').length,2);
 subject='unclear';
 const blank=await sceneRoute(request(),{MODEL_API_KEY:'test'});
 assert.equal(blank.status,422);
 assert.match((await blank.json()).error,/No clear subject/);
 assert.equal(calls,2);
});

test('the compound pulley moves both wheels with the illustrated rope constraints',()=>{
 const graph=validateSceneGraph(compoundPulleyScene());
 const nodes=Object.fromEntries(graph.objects.map(node=>[node.id,node]));
 for(const time of [0,.5,1,2,3,4]){
  const displacement=id=>sceneObjectState(nodes[id],time).position[1]-nodes[id].position[1];
  assert.ok(Math.abs(displacement('pulley-b')-2*displacement('pulley-a'))<1e-10);
  assert.ok(Math.abs(displacement('mass-m')+displacement('mass-M')-2*displacement('pulley-b'))<1e-10);
 }
 const renderer=Object.create(LensScene.prototype);
 renderer.group=new THREE.Group();
 renderer.setScene(graph);
 const upper=renderer.generated.find(item=>item.node.id==='upper-rope');
 const first=upper.object.geometry.attributes.position.array.slice();
 renderer.updateScene(2);
 assert.notDeepEqual(upper.object.geometry.attributes.position.array,first);
 const a=renderer.generated.find(item=>item.node.id==='pulley-a');
 const b=renderer.generated.find(item=>item.node.id==='pulley-b');
 assert.ok(a.holder.rotation.z*b.holder.rotation.z<0);
 renderer.clear();
});

test('a generated wire uses slim geometry even if the model supplies its span as size',()=>{
 const graph=samplePulleyScene();
 graph.objects.find(node=>node.primitive==='line').size[0]=.8;
 const renderer=Object.create(LensScene.prototype);
 renderer.group=new THREE.Group();
 renderer.setScene(graph);
 const wire=renderer.generated.find(item=>item.node.primitive==='line');
 renderer.updateScene(1);
 assert.ok(wire.object.geometry.parameters.radius<.13);
 renderer.clear();
});
