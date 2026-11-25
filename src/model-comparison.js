import {LensScene} from './lens-scene.js';

const providers={meta:'Meta',gemini:'Google Gemini'};
const duration=12;
const css=`
.model-compare{position:fixed;inset:0;z-index:2050;overflow:auto;background:#0a151e;color:#e9f2f5;font:15px/1.5 Arial,sans-serif}
.model-compare [hidden]{display:none!important}
.model-compare .mc-wrap{max-width:1320px;margin:auto;padding:clamp(18px,4vw,48px)}
.mc-nav{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #2b4252;padding-bottom:13px;color:#9bb1bf}
.model-compare h1{font:clamp(36px,5vw,64px)/1.04 Georgia,serif;margin:25px 0 8px;color:#eff7f8}
.model-compare p{margin:0;color:#b1c5d0}
.mc-source{display:flex;gap:14px;flex-wrap:wrap;align-items:center;padding:14px;margin:20px 0 12px;border:1px solid #2b4352;border-radius:14px;background:#10232f}
.mc-source img{width:78px;height:68px;object-fit:contain;border-radius:7px;background:#08151e}
.mc-source-text{flex:1 1 190px;min-width:0}.mc-source-text strong{display:block;overflow-wrap:anywhere}.mc-source-text small{color:#adc4ce}
.mc-buttons,.mc-transport{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.model-compare button{min-height:40px;padding:8px 13px;border:1px solid #3a5669;border-radius:9px;background:#182f3d;color:#ebf6f8;font:inherit;font-size:13px;cursor:pointer}
.model-compare button:hover{background:#234354}.model-compare button:disabled{opacity:.5;cursor:default}
.model-compare button:focus-visible,.model-compare input:focus-visible{outline:2px solid #9af2df;outline-offset:3px}
.model-compare .mc-go{color:#102830;background:#9ae2d3;border-color:#9ae2d3;font-weight:bold}
.model-compare .mc-go:hover{background:#c0f1e6}
.mc-status{min-height:1.5em;margin-bottom:14px!important}
.mc-transport{margin:14px 0}.mc-transport input{width:min(240px,48vw);accent-color:#9ae2d3}.mc-transport output{min-width:46px;color:#bad0da;font-variant-numeric:tabular-nums}
.mc-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.mc-card{overflow:hidden;border:1px solid #2c4757;border-radius:15px;background:#10232f;min-width:0}
.mc-card-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:12px 14px;border-bottom:1px solid #2c4757}
.mc-card h2{font:22px Georgia,serif;color:#e6f2f4;margin:0}.mc-card code{font:11px/1.3 monospace;color:#b9ced9;overflow-wrap:anywhere;text-align:right}
.mc-stage{position:relative;display:grid;place-items:center;background:#08151e;aspect-ratio:16/10;min-height:130px}
.mc-stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none}
.mc-stage .animation-hud{display:none!important}
.mc-empty{padding:12px;max-width:370px;text-align:center;font-size:13px}.mc-empty[data-error]{color:#fecb93}
.mc-details{padding:12px 14px;font-size:13px}.mc-details strong{display:block;margin-bottom:3px;color:#eff7f8}
.mc-details small{display:block;margin-top:8px;color:#a8dde5;font-variant-numeric:tabular-nums}
@media(max-width:530px){.mc-results{gap:7px}.mc-card-top{display:block;padding:8px}.mc-card h2{font-size:17px}.mc-card code,.mc-details{font-size:11px}.mc-details{padding:8px}.mc-source{padding:10px}.mc-buttons{gap:5px}}
`;

async function preparePhoto(file){
 if(file.size>12000000)throw Error('Choose a photo under 12 MB.');
 const bitmap=await createImageBitmap(file);
 try{
  const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext('2d');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.87);
 }finally{bitmap.close();}
}

let active;
export function openModelComparison({image='',photoName='Captured photo'}={}){
 if(active)return active;
 if(location.hash!=='#compare')history.pushState(null,'','/#compare');
 const previousFocus=document.activeElement,overflow=document.body.style.overflow;
 const background=[...document.body.children].map(node=>[node,node.inert]);
 for(const [node] of background)node.inert=true;
 document.body.style.overflow='hidden';
 const root=document.createElement('main');
 root.className='model-compare';
 root.innerHTML=`<style>${css}</style><div class="mc-wrap">
  <div class="mc-nav"><button data-close>← Home</button><span>What-If Lens</span></div>
  <h1>Model comparison</h1><p>One photo. Two independently generated 3D scenes.</p>
  <div class="mc-source">
   <img alt="Source sent to both models" hidden>
   <div class="mc-source-text"><strong data-photo-name>Choose a diagram or photo</strong><small>Compare sends the photo to Meta and Google. Google may use free-tier inputs and outputs to improve its products.</small></div>
   <div class="mc-buttons"><button data-upload>Upload photo</button><button data-camera>Take photo</button><button class="mc-go" data-compare disabled>Compare models</button><button data-cancel hidden>Cancel</button></div>
   <input type="file" accept="image/*" data-file hidden><input type="file" accept="image/*" capture="environment" data-capture hidden>
  </div>
  <p class="mc-status" data-status role="status">Checking model access…</p>
  <div class="mc-transport" hidden><button data-play>Pause</button><button data-restart>Restart</button><input type="range" min="0" max="${duration}" step="0.01" value="0" aria-label="Shared animation time"><output>0.00 s</output></div>
  <div class="mc-results">${Object.entries(providers).map(([id,name])=>`<section class="mc-card" data-provider="${id}">
   <div class="mc-card-top"><h2>${name}</h2><code></code></div>
   <div class="mc-stage"><p class="mc-empty">Awaiting comparison</p></div>
   <div class="mc-details" hidden><strong></strong><p></p><small></small></div>
  </section>`).join('')}</div></div>`;
 document.body.append(root);
 const q=selector=>root.querySelector(selector),status=message=>{q('[data-status]').textContent=message;};
 const statusRequest=new AbortController();
 const stage={};
 const runButton=q('[data-compare]'),cancelButton=q('[data-cancel]'),timeline=q('.mc-transport'),scrubber=q('input[type=range]'),playButton=q('[data-play]');
 let config=null,request=null,revision=0,closed=false,raf=0,time=0,last=0,playing=false;
 function updateButtons(){runButton.disabled=!image||!config?.meta.configured||!config?.gemini.configured||!!request;cancelButton.hidden=!request;}
 function clearScenes(message){
  cancelAnimationFrame(raf);raf=0;time=0;last=0;playing=false;
  timeline.hidden=true;scrubber.value='0';q('output').textContent='0.00 s';
  for(const id of Object.keys(providers)){
   stage[id]?.dispose();delete stage[id];
   const card=q('[data-provider='+id+']'),placeholder=card.querySelector('.mc-empty');
   placeholder.textContent=message;placeholder.hidden=false;delete placeholder.dataset.error;
   card.querySelector('.mc-details').hidden=true;
  }
 }
 function abort(){request?.abort();request=null;updateButtons();}
 function setImage(value,label){
  image=value;const preview=q('.mc-source img');preview.hidden=!value;
  if(value)preview.src=value;else preview.removeAttribute('src');
  q('[data-photo-name]').textContent=value?label:'Choose a diagram or photo';
  updateButtons();
 }
 function readyMessage(){
  if(!config)return 'Checking model access…';
  if(!config.meta.configured||!config.gemini.configured)return 'Waiting for server configuration. Add '+[!config.meta.configured&&'MODEL_API_KEY',!config.gemini.configured&&'GEMINI_API_KEY'].filter(Boolean).join(' and ')+'.';
  return image?'Ready to compare this photo.':'Choose a photo to begin.';
 }
 async function pick(event){
  const file=event.target.files[0];event.target.value='';
  if(!file)return;
  const current=++revision;
  abort();clearScenes('Awaiting comparison');setImage('','');status('Preparing photo…');
  try{
   const prepared=await preparePhoto(file);
   if(closed||current!==revision)return;
   setImage(prepared,file.name);status(readyMessage());
  }catch(e){if(!closed&&current===revision)status(e.message||'The photo could not be read.');}
 }
 function frame(now){
  if(closed||!Object.keys(stage).length)return;
  if(last&&playing&&!document.hidden)time=(time+Math.min(.05,(now-last)/1000))%duration;
  last=now;
  scrubber.value=String(time);q('output').textContent=time.toFixed(2)+' s';
  for(const renderer of Object.values(stage))renderer.render(time);
  raf=requestAnimationFrame(frame);
 }
 function showResult(id,result){
  const card=q('[data-provider='+id+']'),viewport=card.querySelector('.mc-stage'),placeholder=card.querySelector('.mc-empty');
  if(result.model)card.querySelector('code').textContent=result.model;
  if(!result.value){placeholder.textContent=result.error||'No result.';placeholder.dataset.error='';return;}
  const details=card.querySelector('.mc-details');
  details.hidden=false;
  details.querySelector('strong').textContent=result.value.title;
  details.querySelector('p').textContent=result.value.description;
  details.querySelector('small').textContent=(result.ms/1000).toFixed(1)+' s · '+result.value.objects.length+' scene objects';
  let renderer;
  try{
   renderer=new LensScene(viewport);
   renderer.renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));
   renderer.resize();renderer.directed=false;renderer.labelsEnabled=false;
   renderer.setScene(result.value);renderer.introCamera=false;
   renderer.renderer.domElement.setAttribute('aria-label',providers[id]+' interactive 3D result');
   stage[id]=renderer;placeholder.hidden=true;
  }catch{renderer?.dispose();placeholder.textContent='Scene generated, but this browser could not draw it.';placeholder.dataset.error='';}
 }
 async function compare(){
  if(runButton.disabled)return;
  const controller=new AbortController(),current=++revision;
  request=controller;updateButtons();clearScenes('Generating 3D scene…');status('Both models are processing the same photo…');
  const timer=setTimeout(()=>controller.abort('timeout'),100000);
  try{
   const response=await fetch('/api/lens/compare',{method:'POST',headers:{
    'Content-Type':'application/json','X-Camera-Request-Id':crypto.randomUUID()
   },body:JSON.stringify({image}),signal:controller.signal});
   const result=await response.json();
   if(closed||current!==revision)return;
   if(!response.ok)throw Error(result.error||'Comparison failed.');
   for(const id of Object.keys(providers))showResult(id,result[id]||{});
   const count=Object.values(result).filter(value=>value.value).length;
   status(count===2?'Both scenes are ready. Drag a scene to inspect it.':count===1?'One scene is ready. The other provider’s result is shown below.':'Neither provider returned a scene. See the results below.');
   if(Object.keys(stage).length){
    timeline.hidden=false;playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;playButton.textContent=playing?'Pause':'Play';
    raf=requestAnimationFrame(frame);
   }
  }catch(e){
   if(!closed&&current===revision){clearScenes('Awaiting comparison');status(controller.signal.reason==='timeout'?'Comparison timed out. Try again.':e.message||'Comparison failed.');}
  }finally{
   clearTimeout(timer);
   if(!closed&&current===revision){request=null;updateButtons();}
  }
 }
 function close(changeLocation=true){
  if(closed)return;
  closed=true;abort();statusRequest.abort();clearScenes('');
  window.removeEventListener('hashchange',onHashChange);root.remove();
  for(const [node,inert] of background)node.inert=inert;
  document.body.style.overflow=overflow;active=null;
  if(changeLocation&&location.hash==='#compare')history.replaceState(null,'','/#home');
  previousFocus?.focus();
 }
 const onHashChange=()=>{if(location.hash!=='#compare')close(false);};
 window.addEventListener('hashchange',onHashChange);
 q('[data-close]').onclick=()=>close();
 q('[data-upload]').onclick=()=>q('[data-file]').click();
 q('[data-camera]').onclick=()=>q('[data-capture]').click();
 q('[data-file]').onchange=q('[data-capture]').onchange=pick;
 runButton.onclick=compare;
 cancelButton.onclick=()=>{revision++;abort();clearScenes('Awaiting comparison');status('Comparison cancelled.');};
 playButton.onclick=()=>{playing=!playing;playButton.textContent=playing?'Pause':'Play';};
 q('[data-restart]').onclick=()=>{time=0;last=0;};
 scrubber.oninput=()=>{time=Number(scrubber.value);playing=false;playButton.textContent='Play';};
 setImage(image,photoName);
 fetch('/api/lens/compare',{signal:statusRequest.signal}).then(response=>{
  if(!response.ok)throw Error('Model status unavailable.');
  return response.json();
 }).then(result=>{
  if(closed)return;
  if(!result.meta||!result.gemini)throw Error('Model status unavailable.');
  config=result;
  for(const id of Object.keys(providers))q('[data-provider='+id+'] code').textContent=config[id].model;
  status(readyMessage());updateButtons();
 }).catch(()=>{if(!closed)status('Model access could not be checked. Reload and try again.');});
 q('[data-close]').focus();
 active={close};
 return active;
}
