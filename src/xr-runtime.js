import {World,createSystem,SessionMode} from '@iwsdk/core';
import {openXRLab} from './xr-lab.js';
export async function launchXR(options={}){return openXRLab({...options,runtimeFactory:async host=>{
 const world=await World.create(host,{xr:{sessionMode:SessionMode.ImmersiveVR,offer:'none',features:{handTracking:true}},render:{camera:{position:[0,1.6,2.6]}},features:{locomotion:false,grabbing:false,spatialUI:false,physics:false},input:{canvasPointerEvents:false}});
 const runtime={scene:world.scene,camera:world.camera,renderer:world.renderer,tick:null,dispose(){world.destroy();world.renderer.dispose();world.renderer.forceContextLoss();world.renderer.domElement.remove();}};
 class ExperimentSystem extends createSystem({}){update(delta,time){runtime.tick?.(time*1000);}}
 world.registerSystem(ExperimentSystem);
 const button=document.createElement('button');button.textContent='Checking immersive support…';button.disabled=true;button.style.cssText='position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:5;padding:14px 24px;background:#83dfd2;border:0;border-radius:9px;color:#08212c';
 navigator.xr?.isSessionSupported('immersive-vr').then(supported=>{button.disabled=!supported;button.textContent=supported?'Enter immersive VR':'Desktop preview · VR unavailable';}).catch(()=>button.textContent='VR unavailable');if(!navigator.xr)button.textContent='Desktop preview · WebXR unavailable';
 button.onclick=async()=>{try{if(world.renderer.xr.isPresenting)await world.renderer.xr.getSession().end();else await world.launchXR();}catch(e){button.textContent='VR entry failed · retry';button.title=e.message;}};
 world.renderer.xr.addEventListener('sessionstart',()=>button.textContent='Exit immersive VR');world.renderer.xr.addEventListener('sessionend',()=>button.textContent='Enter immersive VR');runtime.entryButton=button;return runtime;
 }});}
