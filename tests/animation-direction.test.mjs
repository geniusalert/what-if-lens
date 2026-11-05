import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from 'three';import {createDirection,actorKind} from '../src/animation-direction.js';
import {circuitAnimationExample} from '../src/animation-examples.js';import {validateSceneGraph} from '../src/scene-graph.js';import {LensScene} from '../src/lens-scene.js';
test('presentation seeking is deterministic and holds motion during setup and review',()=>{
 const graph=validateSceneGraph(circuitAnimationExample()),d=createDirection(graph);
 assert.equal(d.frame(1).motionTime,0);assert.ok(d.frame(5).motionTime>0);
 assert.deepEqual(d.frame(5),d.frame(5+d.duration));
 assert.equal(d.frame(d.duration-.5).motionTime,d.frame(d.duration-.1).motionTime);
 assert.equal(d.reveal(graph.objects[0],0,0),0);assert.equal(d.reveal(graph.objects[0],0,3),1);
});
test('semantic equipment and flowing particles create real reusable geometry',()=>{
 const graph=validateSceneGraph(circuitAnimationExample());assert.equal(actorKind(graph.objects[1]),'battery');assert.equal(actorKind(graph.objects[2]),'resistor');
 const renderer=Object.create(LensScene.prototype);renderer.group=new THREE.Group();renderer.frame=()=>{};renderer.setScene(graph);
 const wire=renderer.generated.find(i=>i.node.id==='wire');assert.equal(wire.particles.count,24);
 const a=new THREE.Matrix4(),b=new THREE.Matrix4();renderer.updateScene(0);wire.particles.getMatrixAt(0,a);renderer.updateScene(1);wire.particles.getMatrixAt(0,b);assert.notDeepEqual(a.elements,b.elements);
 renderer.updateScene(0);wire.particles.getMatrixAt(0,b);assert.deepEqual(a.elements,b.elements);
 const battery=renderer.generated.find(i=>i.node.id==='battery');assert.ok(battery.object.children.length>=5);renderer.clear();assert.equal(renderer.group.children.length,0);
});
