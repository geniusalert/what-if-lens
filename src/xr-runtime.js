import {World,createSystem,SessionMode} from '@iwsdk/core';
import {openXRLab} from './xr-lab.js';
export async function launchXR(options={}){return openXRLab({...options,runtimeFactory:async host=>{
 const world=await World.create(host,{xr:{sessionMode:SessionMode.ImmersiveAR,offer:'none',features:{handTracking:true}},render:{camera:{position:[0,1.6,2.6]}},features:{locomotion:false,grabbing:false,spatialUI:false,physics:false},input:{canvasPointerEvents:false}});
 const runtime={scene:world.scene,camera:world.camera,renderer:world.renderer,tick:null,dispose(){world.destroy();world.renderer.dispose();world.renderer.forceContextLoss();world.renderer.domElement.remove();}};
 class ExperimentSystem extends createSystem({}){update(delta,time){runtime.tick?.(time*1000);}}
 world.registerSystem(ExperimentSystem);
 const entries=document.createElement('div');entries.style.cssText='position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:5;display:flex;gap:8px;max-width:95vw';
 for(const [mode,label] of [[SessionMode.ImmersiveVR,'Enter VR'],[SessionMode.ImmersiveAR,'Mixed reality']]){const button=document.createElement('button');button.textContent='Checking '+label+'…';button.disabled=true;button.style.cssText='padding:12px;background:#83dfd2;border:0;border-radius:9px;color:#08212c';entries.append(button);if(navigator.xr)navigator.xr.isSessionSupported(mode).then(ok=>{button.disabled=!ok;button.textContent=ok?label:label+' unavailable';}).catch(()=>button.textContent=label+' unavailable');else button.textContent=label+' needs WebXR';button.onclick=()=>{try{if(world.renderer.xr.isPresenting)world.renderer.xr.getSession().end();else world.launchXR({sessionMode:mode});}catch(e){button.textContent='Entry failed · retry';button.title=e.message;}};world.renderer.xr.addEventListener('sessionstart',()=>button.textContent='Exit immersive view');world.renderer.xr.addEventListener('sessionend',()=>button.textContent=label);}
 runtime.entryButton=entries;return runtime;
 }});}
