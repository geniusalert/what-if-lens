import * as THREE from 'three';
import {createPinchCalibration} from './hand-tracking.js';
export function createHandInteraction({lens,manipulation,buttons=()=>[],activate=()=>{}}){
 const calibration=createPinchCalibration(),states=new Map();let signature='';
 function update(samples,{drive=true}={}){lens.scene?.updateMatrixWorld(true);const points=[],targets=[];let pinches=0;if(samples[0])calibration.sample(samples[0].ratio);else calibration.clearSamples();
  for(const s of samples){let state=states.get(s.id);if(!state){state={pressed:false,latched:null};states.set(s.id,state);}const pressed=!!s.nativePressed||calibration.pressed(state.pressed,s.ratio),r=s.ray?new THREE.Raycaster(s.ray.origin,s.ray.direction,0,5):null;
   if(pressed&&!state.pressed){state.latched=null;const nearButton=buttons().find(b=>{const p=b.worldToLocal(s.point.clone()),g=b.geometry.parameters;return Math.abs(p.z)<.065&&Math.abs(p.x)<g.width/2+.015&&Math.abs(p.y)<g.height/2+.015;});const farButton=r?.intersectObjects(buttons(),false)[0];if(nearButton||farButton){activate((nearButton||farButton.object).userData.action);state.latched={ui:true};}else if(new THREE.Box3().setFromObject(lens.group).expandByScalar(.12).containsPoint(s.point)){state.latched={near:true};}else{const hit=r?.intersectObject(lens.group,true)[0];if(hit)state.latched={distance:hit.distance};}}
   state.pressed=pressed;if(pressed){pinches++;if(state.latched&&!state.latched.ui){const point=state.latched.near?s.point:s.ray?.at(state.latched.distance,new THREE.Vector3());if(point){points.push({id:s.id,point});targets.push(point);}}}else{state.latched=null;const hit=r?.intersectObject(lens.group,true)[0];targets.push(hit?.point||s.point);}}
  const ids=new Set(samples.map(s=>s.id));for(const key of states.keys())if(!ids.has(key))states.delete(key);
  const next=points.map(p=>p.id).join('|');if(drive){if(next!==signature){manipulation.reset();signature=next;}manipulation.update(points.slice(0,2).map(p=>p.point),{force:points.length>0});}
  return {hands:samples.length,pinches,active:points.length,targets};
 }
 return {update,release(){states.clear();signature='';manipulation.reset();},calibrate:()=>calibration.calibrate(),reset(){states.clear();signature='';calibration.reset();manipulation.reset();}};
}
