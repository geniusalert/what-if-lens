import {captureXRFrame} from './xr-raw-camera.js';
import * as THREE from 'three';
import {createXRCamera} from './xr-camera.js';

function resizeFrame(image){
 const canvas=document.createElement('canvas');
 const scale=Math.min(1,1000/Math.max(image.width,image.height));
 canvas.width=Math.max(1,Math.round(image.width*scale));
 canvas.height=Math.max(1,Math.round(image.height*scale));
 canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
 return canvas;
}

export function mountXRSource({root,renderer,scene,lens,hasModel,onReset,onCapture,status}){
 const box=root.querySelector('#xr-capture-bar');
 box.innerHTML='<button data-start aria-label="Prepare a device camera">Photo</button><button data-upload-button>Upload</button><button data-capture class="xr-primary" disabled hidden>Capture</button><input data-upload type="file" accept="image/png,image/jpeg,image/webp" hidden>';
 const options=root.querySelector('#xr-source-options');
 options.innerHTML='<div class="xr-tools"><button data-flip>Flip camera</button><button data-stop>Stop camera</button></div><label><input data-environment type="checkbox" checked> Show camera surroundings</label>';
 const startButton=box.querySelector('[data-start]'),captureButton=box.querySelector('[data-capture]'),fileInput=box.querySelector('[data-upload]');
 const reticle=root.querySelector('#xr-capture-target');
 const video=document.createElement('video');video.muted=true;video.playsInline=true;video.hidden=true;root.append(video);
 const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;
 let ready=false,closed=false,pendingCapture=null,revision=0,busy=false,hasSource=false;
 const room=new THREE.Group();scene.add(room);
 for(const x of [-2,2]){const wall=new THREE.Mesh(new THREE.BoxGeometry(.08,2.7,4),new THREE.MeshStandardMaterial({color:0x183744,roughness:.9}));wall.position.set(x,1.35,-1.5);room.add(wall);}
 const back=new THREE.Mesh(new THREE.BoxGeometry(4,2.7,.08),new THREE.MeshStandardMaterial({color:0x102c3b}));back.position.set(0,1.35,-3.5);room.add(back);
 function environment(){
  const session=renderer.xr.getSession(),mr=!!session&&session.environmentBlendMode!=='opaque',live=!session&&ready&&options.querySelector('[data-environment]').checked;
  scene.background=mr?null:live?texture:new THREE.Color('#08151e');scene.fog=null;
  renderer.setClearColor(0x08151e,mr?0:1);room.visible=!!session&&!mr;lens.floor.visible=!!session&&!mr;lens.grid.visible=false;
 }
 function updateControls(){
  const camera=ready||renderer.xr.isPresenting;
  startButton.textContent=camera||hasSource||hasModel()||busy?'New photo':'Photo';
  startButton.setAttribute('aria-label',startButton.textContent);
  captureButton.hidden=!camera&&!busy;
  captureButton.disabled=busy||!camera;
  captureButton.textContent=busy?'Processing…':'Capture';
  reticle.hidden=!ready||renderer.xr.isPresenting||busy||hasSource||hasModel()||!options.querySelector('[data-environment]').checked;
  root.querySelector('#xr-empty').hidden=camera||hasSource||hasModel()||busy;
 }
 const source=createXRCamera(video,{onState:value=>{ready=value;environment();updateControls();}});
 const newSource=()=>{
  pendingCapture=null;
  hasSource=false;
  onReset();
  updateControls();
  return ++revision;
 };
 const cameraHint=()=>status('Center one diagram or object, then tap Capture.');
 async function start(flip=false){
  const current=newSource();
  status('Opening the camera…');
  try{await source.start(flip);if(!closed&&current===revision&&ready)cameraHint();}
  catch(e){if(!closed&&current===revision)status('Camera unavailable. '+e.message+' Upload a photo instead.');}
 }
 function accept(canvas,current,fromCamera){
  if(closed||current!==revision)return;
  hasSource=true;
  updateControls();
  return onCapture(canvas,fromCamera);
 }
 function capture(){
  const current=newSource();
  try{
   if(renderer.xr.isPresenting){pendingCapture=current;status('Reading the camera frame…');return;}
   return accept(source.capture(),current,true);
  }catch(e){status(e.message);}
 }
 startButton.onclick=()=>{
  if(ready||renderer.xr.isPresenting){newSource();cameraHint();}
  else start();
 };
 captureButton.onclick=capture;
 options.querySelector('[data-flip]').onclick=()=>start(true);
 options.querySelector('[data-stop]').onclick=()=>source.stop();
 options.querySelector('[data-environment]').onchange=()=>{environment();updateControls();};
 fileInput.onchange=async()=>{
  const file=fileInput.files[0];
  fileInput.value='';
  if(!file)return;
  const current=newSource();
  try{
   if(file.size>12e6)throw Error('Choose a photo under 12 MB.');
   const bitmap=await createImageBitmap(file);
   let canvas;
   try{canvas=resizeFrame(bitmap);}finally{bitmap.close();}
   await accept(canvas,current,false);
  }catch(e){if(!closed&&current===revision)status(e.message);}
 };
 box.querySelector('[data-upload-button]').onclick=()=>fileInput.click();
 const enter=()=>{source.stop();environment();updateControls();};
 const exit=()=>{pendingCapture=null;environment();updateControls();};
 renderer.xr.addEventListener('sessionstart',enter);
 renderer.xr.addEventListener('sessionend',exit);
 environment();
 updateControls();
 return {
  get video(){return video;},
  async startHandsCamera(){
   options.querySelector('[data-environment]').checked=true;
   if(!ready)await source.start();
   environment();updateControls();
  },
  previewUV(uv){return {x:(uv.x-texture.offset.x)/texture.repeat.x,y:(uv.y-texture.offset.y)/texture.repeat.y};},
  get cameraReady(){return ready;},
  stopCamera(){source.stop();},
  capture,
  update(){
   if(ready&&!renderer.xr.isPresenting&&video.videoWidth){
    const viewport=renderer.domElement;
    const aspect=viewport.clientWidth/(viewport.clientHeight||1);
    const ratio=aspect/(video.videoWidth/video.videoHeight);
    if(ratio>0){texture.repeat.set(Math.min(1,ratio),Math.min(1,1/ratio));texture.offset.set((1-texture.repeat.x)/2,(1-texture.repeat.y)/2);}
   }
   if(pendingCapture===null)return;
   const current=pendingCapture;
   pendingCapture=null;
   try{accept(resizeFrame(captureXRFrame(renderer)),current,true);}catch(e){status(e.message);}
  },
  setBusy(value){busy=value;updateControls();},
  dispose(){
   closed=true;source.dispose();texture.dispose();
   renderer.xr.removeEventListener('sessionstart',enter);
   renderer.xr.removeEventListener('sessionend',exit);
   room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});scene.remove(room);video.remove();
  }
 };
}
