import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {validateAnnotations,sciencePaths,forceStory,placePathLabels} from '../src/science-paths.js';
import {ForcePathLayer} from '../src/force-path-layer.js';
import {worldExample} from '../src/world-examples.js';
import {validateSceneGraph} from '../src/scene-graph.js';

const annotations={target:'visible arch',paths:[{id:'left-arch',label:'Compression',role:'transfer',points:[[.5,.1],[.4,.14],[.3,.25],[.23,.4],[.2,.65]]},{id:'gravity',label:'Load',role:'load',points:[[.5,.03],[.5,.18]]},{id:'reaction',label:'Support',role:'reaction',points:[[.2,.7],[.2,.55]]}]};
test('source registration rejects unbounded, malformed and zero-length model geometry',()=>{
 assert.deepEqual(validateAnnotations(annotations),annotations);
 for(const points of [[[0,0,0],[1,1,0]],[[0,0],[1.1,1]],[[0,0],[Infinity,.5]],[[.5,.5],[.5,.5]]])assert.throws(()=>validateAnnotations({...annotations,paths:[{...annotations.paths[0],points}]}));
 assert.throws(()=>validateAnnotations({...annotations,paths:[annotations.paths[0],annotations.paths[0]]}));
 const scene=worldExample('bridge');scene.annotations=annotations;assert.deepEqual(sciencePaths(validateSceneGraph(scene)),annotations.paths);
});
test('force explanation has reproducible load, transfer and response stages across replay',()=>{
 const paths=annotations.paths;
 assert.equal(forceStory('bridge',paths,1).role,'load');assert.equal(forceStory('bridge',paths,4).role,'transfer');assert.equal(forceStory('bridge',paths,7).role,'reaction');
 assert.equal(forceStory('bridge',paths,4).role,forceStory('bridge',paths,13.6).role);assert.ok(Math.abs(forceStory('bridge',paths,4).progress-forceStory('bridge',paths,13.6).progress)<1e-12);
 assert.equal(forceStory('bridge',paths,4,false).emphasis('load'),1);
});
test('curved source paths use the observed vertices and animate without rebuilding GPU buffers',()=>{
 const group=new THREE.Group(),scene=worldExample('bridge');scene.annotations=annotations;
 const layer=new ForcePathLayer(group,scene,{overlay:true,point:p=>new THREE.Vector3(p[0]*1000,(1-p[1])*1000,p[2]*600)});
 const curve=layer.items[0].curve,near=curve.getPointAt(.5);assert.ok(near.x<400&&near.y>500,'follows the arch rather than a straight diagonal');
 const geometry=layer.items[0].sweep.geometry;layer.update(1);const offset=layer.items[0].sweep.material.dashOffset;layer.update(4);assert.notEqual(layer.items[0].sweep.material.dashOffset,offset);layer.update(1);assert.equal(layer.items[0].sweep.material.dashOffset,offset);assert.equal(layer.items[0].sweep.geometry,geometry);
 assert.equal(layer.items[0].base.material.linewidth,4,'screen-space width stays readable');
});
test('mobile labels remain inside the image and do not overlap each other',()=>{
 const labels=placePathLabels(Array.from({length:6},(_,i)=>({id:i,x:165+i*3,y:130,width:110})),340,255);
 assert.ok(labels.length>=3);for(const l of labels){assert.ok(l.x>=0&&l.y>=0&&l.x+l.w<=340&&l.y+l.h<=255);for(const b of labels)if(l!==b)assert.ok(l.x+l.w<=b.x||b.x+b.w<=l.x||l.y+l.h<=b.y||b.y+b.h<=l.y);}
});
