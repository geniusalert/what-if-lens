// Only explicit captures are sent to extraction, never the continuous video.
export function createXRCamera(video,{media=navigator.mediaDevices,onState=()=>{}}={}){
 let stream=null,revision=0,facing='environment',disposed=false;
 const stop=()=>{revision++;stream?.getTracks().forEach(t=>t.stop());stream=null;video.pause();video.srcObject=null;onState(false);};
 async function start(flip=false){stop();if(disposed)return;if(flip)facing=facing==='environment'?'user':'environment';const id=revision;if(!media?.getUserMedia)throw Error('Camera unavailable. Open HTTPS in Chrome/Safari or upload a photo.');const next=await media.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}}});if(disposed||id!==revision){next.getTracks().forEach(t=>t.stop());return;}stream=next;video.srcObject=next;try{await video.play();if(id===revision)onState(true);}catch(e){if(id===revision)stop();throw e;}}
 function capture(){if(!stream||video.readyState<2||!video.videoWidth)throw Error('Wait for the camera preview, then capture.');const c=document.createElement('canvas'),scale=Math.min(1,1000/Math.max(video.videoWidth,video.videoHeight));c.width=Math.round(video.videoWidth*scale);c.height=Math.round(video.videoHeight*scale);c.getContext('2d').drawImage(video,0,0,c.width,c.height);return c;}
 return {start,stop,capture,dispose(){disposed=true;stop();}};
}
