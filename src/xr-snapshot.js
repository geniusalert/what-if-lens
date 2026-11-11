import {validateIR} from './compiler.js';
import {validateSceneGraph} from './scene-graph.js';
export function decodeXRSnapshot(raw){
 if(typeof raw!=='string'||raw.length>250000)throw Error('Choose an experiment JSON file under 250 KB.');
 const value=JSON.parse(raw);if(value?.version!==1||!['scientific','illustrative'].includes(value.kind))throw Error('Not a What-If Lens XR experiment.');
 const p=value.playback;if(!p||!Number.isFinite(p.time)||p.time<0||p.time>3600||![.25,.5,1,2].includes(p.speed))throw Error('Invalid experiment playback settings.');
 const model=value.kind==='scientific'?validateIR(value.model,{review:true}):validateSceneGraph(value.model);
 return {version:1,kind:value.kind,model,playback:{time:p.time,speed:p.speed}};
}
export function createXRSnapshot({ir,graph,time=0,speed=1}){if(!ir&&!graph)throw Error('Create or open an experiment first.');return decodeXRSnapshot(JSON.stringify({version:1,kind:ir?'scientific':'illustrative',model:ir||graph,playback:{time,speed}}));}
export function changeXRPlayback(state,action,value,duration=3600){
 const next={...state};if(!Number.isFinite(duration)||duration<0)throw Error('Invalid timeline duration.');
 if(action==='toggle')next.playing=!next.playing;
 else if(action==='restart')next.time=0;
 else if(action==='step'){next.time=Math.min(duration,next.time+1/60);next.playing=false;}
 else if(action==='seek'){if(!Number.isFinite(value))throw Error('Choose a valid timeline position.');next.time=Math.min(duration,Math.max(0,value));next.playing=false;}
 else if(action==='speed'){if(![.25,.5,1,2].includes(value))throw Error('Choose 0.25×, 0.5×, 1× or 2× speed.');next.speed=value;}
 else throw Error('Unknown playback action.');return next;
}
