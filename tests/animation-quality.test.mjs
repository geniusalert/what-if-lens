import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {LensScene} from '../src/lens-scene.js';
import {samplePulleyScene} from '../src/scene-graph.js';

test('pulley spokes reverse with the connected masses and rope buffers are reused',()=>{
 const scene=Object.create(LensScene.prototype);scene.group=new THREE.Group();scene.overlay=false;scene.frame=()=>{};
 scene.renderer={domElement:{hidden:true}};scene.setScene(samplePulleyScene());assert.equal(scene.renderer.domElement.hidden,false);
 const wheel=scene.generated.find(i=>i.node.id==='pulley'),rope=scene.generated.find(i=>i.node.id==='rope');
 assert.ok(wheel.object.children.length>=6,'rim, disk, spokes and axle are visible geometry');
 const geometry=rope.object.geometry;
 scene.updateScene(1);const forward=wheel.holder.rotation.z;
 scene.updateScene(3);const reverse=wheel.holder.rotation.z;
 assert.ok(forward*reverse<0,'wheel follows reversing displacement instead of spinning continuously');
 assert.equal(rope.object.geometry,geometry,'rope updates do not reallocate GPU buffers');
 scene.clear();assert.equal(scene.renderer.domElement.hidden,true);assert.equal(scene.group.children.length,0);assert.equal(scene.graph,null);assert.equal(scene.plan,null);
});
