import * as THREE from 'three';
export function handSourceMode({session,inputSources=[],cameraReady=false}){if(session)return Array.from(inputSources).some(s=>s.hand)?'xr-joints':'xr-camera';return cameraReady?'video':'none';}
// Raw camera images and XRView share the same frustum, per the WebXR camera spec.
// Use the pose captured with the image, not the later renderer camera pose.
export function cameraSampleRays(samples,{projection,transform},origin=new THREE.Matrix4()){
 const inverse=new THREE.Matrix4().fromArray(projection).invert(),world=new THREE.Matrix4().fromArray(transform).premultiply(origin),position=new THREE.Vector3().setFromMatrixPosition(world);
 return samples.map(s=>{const direction=new THREE.Vector3(s.uv.x*2-1,1-s.uv.y*2,-1).applyMatrix4(inverse).transformDirection(world);return {...s,ray:new THREE.Ray(position.clone(),direction)};});
}
export function samplesOnModelPlane(samples,center,viewDirection){const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(viewDirection,center);return samples.flatMap(s=>{const point=s.ray?.intersectPlane(plane,new THREE.Vector3());return point?[{...s,point}]:[];});}

export function createMRHandTracker({capture,detect}){let last=-Infinity,samples=[],sampleAt=-Infinity,error=null,viewDirection=new THREE.Vector3(0,0,-1);return {update(renderer,origin,now){if(now-last>=(error?1000:150)){last=now;try{const image=capture(renderer,{maxSize:640,withView:true}),result=detect(image.canvas,now);if(result){samples=cameraSampleRays(result,image,origin);sampleAt=now;viewDirection=new THREE.Vector3(0,0,-1).transformDirection(new THREE.Matrix4().fromArray(image.transform).premultiply(origin));}error=null;}catch(e){samples=[];sampleAt=-Infinity;error=e.message;}}return {samples:now-sampleAt<350?samples:[],viewDirection,error};},reset(){last=-Infinity;samples=[];sampleAt=-Infinity;error=null;}};}
