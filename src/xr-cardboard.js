import * as THREE from 'three';
import {StereoEffect} from 'three/addons/effects/StereoEffect.js';

const css=`
.xr-cardboard{position:absolute;inset:0;z-index:12;background:#08151e;touch-action:none}
.xr-cardboard:fullscreen{width:100%;height:100%;background:#08151e}
.xr-cardboard canvas{display:block;width:100%;height:100%}
.xr-cardboard-controls{position:absolute;top:max(10px,env(safe-area-inset-top));left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));display:flex;gap:6px;align-items:center}
.xr-cardboard-controls button:last-child{margin-left:auto}
.xr-cardboard p{position:absolute;bottom:max(14px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);margin:0;padding:6px 10px;background:#08151ee8;border-radius:8px;text-align:center;width:max-content;max-width:90%;pointer-events:none}
.xr-cardboard-divider{position:absolute;left:50%;top:0;bottom:0;width:2px;background:#000;pointer-events:none}
`;

export function mountCardboard({root,lens,hasModel,status,onEnter,onPlay}){
 const view=document.createElement('section');
 view.className='xr-cardboard';view.hidden=true;view.setAttribute('aria-label','Cardboard stereo viewer');
 view.innerHTML='<style>'+css+'</style><div class="xr-cardboard-divider"></div><div class="xr-cardboard-controls"><button data-center>Recenter</button><button data-play>Play</button><button data-exit>Exit Cardboard</button></div><p role="status"></p>';
 root.append(view);
 const hint=view.querySelector('p'),exitButton=view.querySelector('[data-exit]');
 const pose=new THREE.PerspectiveCamera(68,1,.04,80);
 const base=new THREE.Quaternion(),neutral=new THREE.Quaternion(),motion=new THREE.Quaternion(),turn=new THREE.Quaternion();
 const screenAxis=new THREE.Vector3(0,0,1),toCamera=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);
 const background=new THREE.Color('#102632');
 let renderer,effect,entryFocus,backgroundControls=[],fullscreenRequested=false,width=0,height=0,drag=null,yaw=0,pitch=0,centered=false,hasMotion=false,sensorDenied=false,screenAngle;

 function info(){
  if(view.clientWidth<view.clientHeight)hint.textContent='Turn your phone sideways for Cardboard.';
  else if(sensorDenied)hint.textContent='Motion access is off. Drag to look around.';
  else if(!hasMotion)hint.textContent='Move your phone to look around, or drag to inspect.';
  else hint.textContent='';
  hint.hidden=!hint.textContent;
 }
 function recenter(){
  centered=false;yaw=0;pitch=0;pose.quaternion.copy(base);
 }
 function orient(event){
  if(!renderer||![event.alpha,event.beta,event.gamma].every(Number.isFinite))return;
  const angle=screen.orientation?.angle??Number(window.orientation??0);
  if(screenAngle!==angle){screenAngle=angle;recenter();}
  const radians=THREE.MathUtils.degToRad;
  motion.setFromEuler(new THREE.Euler(radians(event.beta),radians(event.alpha),-radians(event.gamma),'YXZ'));
  motion.multiply(toCamera).multiply(turn.setFromAxisAngle(screenAxis,-radians(angle)));
  if(!centered){neutral.copy(motion).invert();centered=true;}
  pose.quaternion.copy(base).multiply(neutral).multiply(motion);
  if(!hasMotion){hasMotion=true;info();}
 }
 function exit(){
  if(!renderer)return;
  window.removeEventListener('deviceorientation',orient);
  document.removeEventListener('fullscreenchange',fullscreenChanged);
  document.removeEventListener('keydown',keyDown);
  if(document.fullscreenElement===view)document.exitFullscreen?.().catch(()=>{});
  renderer.domElement.remove();
  renderer.dispose();
  renderer.forceContextLoss();
  renderer=null;effect=null;drag=null;view.hidden=true;fullscreenRequested=false;
  for(const [element,inert] of backgroundControls)element.inert=inert;
  backgroundControls=[];
  entryFocus?.focus();
 }
 function fullscreenChanged(){
  if(document.fullscreenElement===view)fullscreenRequested=true;
  else if(fullscreenRequested)exit();
 }
 function keyDown(event){if(event.key==='Escape')exit();}
 function enter(){
  if(renderer)return;
  if(!hasModel()){status('Capture or upload a subject before opening Cardboard.');return;}
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});}
  catch{status('Cardboard could not start the phone’s 3D renderer. Try closing other tabs.');return;}
  entryFocus=document.activeElement;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=lens.renderer.toneMapping;
  renderer.toneMappingExposure=lens.renderer.toneMappingExposure;
  effect=new StereoEffect(renderer);
  effect.setEyeSeparation(.064);
  const bounds=new THREE.Box3().setFromObject(lens.group).getBoundingSphere(new THREE.Sphere());
  const distance=Math.max(1.35,bounds.radius*2.8);
  pose.position.copy(bounds.center).add(new THREE.Vector3(0,distance*.07,distance));
  pose.focus=distance;
  pose.lookAt(bounds.center);base.copy(pose.quaternion);
  hasMotion=false;sensorDenied=false;screenAngle=undefined;width=0;height=0;recenter();
  view.prepend(renderer.domElement);view.hidden=false;
  info();onEnter();
  backgroundControls=[...root.children].filter(element=>element!==view).map(element=>[element,element.inert]);
  for(const [element] of backgroundControls)element.inert=true;
  window.addEventListener('deviceorientation',orient);
  document.addEventListener('fullscreenchange',fullscreenChanged);
  document.addEventListener('keydown',keyDown);
  const activeRenderer=renderer;
  const DeviceOrientation=window.DeviceOrientationEvent;
  if(!DeviceOrientation){sensorDenied=true;info();}
  else if(typeof DeviceOrientation.requestPermission==='function'){
   const denied=()=>{if(renderer===activeRenderer){sensorDenied=true;info();}};
   DeviceOrientation.requestPermission().then(result=>{if(result!=='granted')denied();}).catch(denied);
  }else view.requestFullscreen?.({navigationUI:'hide'}).catch(()=>{});
  exitButton.focus();
 }
 view.querySelector('[data-center]').onclick=recenter;
 view.querySelector('[data-play]').onclick=onPlay;
 exitButton.onclick=exit;
 view.addEventListener('pointerdown',event=>{
  if(event.target!==renderer?.domElement||hasMotion)return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY};view.setPointerCapture(event.pointerId);
 });
 view.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId||hasMotion)return;
  yaw+=(drag.x-event.clientX)*.005;
  pitch=THREE.MathUtils.clamp(pitch+(drag.y-event.clientY)*.005,-1,1);
  drag.x=event.clientX;drag.y=event.clientY;
  pose.quaternion.copy(base).multiply(turn.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ')));
 });
 for(const name of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(name,event=>{if(drag?.id===event.pointerId)drag=null;});
 return {
  enter,
  render(){
   if(!renderer)return;
   if(width!==view.clientWidth||height!==view.clientHeight){
    width=view.clientWidth;height=view.clientHeight;
    if(!width||!height)return;
    pose.aspect=width/height;pose.updateProjectionMatrix();effect.setSize(width,height);info();
   }
   const scene=lens.scene,saved=scene.background;
   scene.background=background;
   try{effect.render(scene,pose);}finally{scene.background=saved;}
  },
  dispose(){exit();view.remove();}
 };
}
