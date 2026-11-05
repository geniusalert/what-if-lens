import {solveIR,frameState} from './compiler.js';
// Keep the camera registration fixed; change the model within its original image bounds.
export function planForExperiment(ir,baseline,original){
 const next=structuredClone(original),run=solveIR(ir),base=solveIR(baseline),tracks=original.tracks.filter(t=>t.points.length>1);
 if(!tracks.length)return next;
 const points=tracks.flatMap(t=>t.points),xmin=Math.min(...points.map(p=>p.x)),xmax=Math.max(...points.map(p=>p.x)),ymin=Math.min(...points.map(p=>p.y)),ymax=Math.max(...points.map(p=>p.y)),w=Math.max(.05,xmax-xmin),h=Math.max(.05,ymax-ymin);
 if(ir.template==='projectile'){
  const scaleX=w/Math.max(1,base.metrics.range),scaleY=h/Math.max(1,base.metrics.height);next.tracks=[{kind:'trace',label:'Recalculated projectile',speed:1,points:Array.from({length:49},(_,i)=>{const f=frameState(run,run.metrics.flight*i/48);return {x:Math.max(0,Math.min(1,xmin+f.x*scaleX)),y:Math.max(0,Math.min(1,ymax-f.y*scaleY))};})}];next.markers=[];
 }
 if(ir.template==='quadratic'){
  const center=base.metrics.vertex?.x||0,ys=Array.from({length:49},(_,i)=>{const x=center-4+i/6,p=baseline.parameters;return p.a.value*x*x+p.b.value*x+p.c.value;}),lo=Math.min(...ys),hi=Math.max(...ys),p=ir.parameters;
  next.tracks=[{kind:'trace',label:'Recalculated parabola',speed:1,points:ys.map((_,i)=>{const x=center-4+i/6,y=p.a.value*x*x+p.b.value*x+p.c.value;return{x:xmin+w*i/48,y:Math.max(0,Math.min(1,ymax-(y-lo)*h/Math.max(1,hi-lo)))}})}];next.markers=[];
 }
 if(ir.template==='circuit'){const factor=run.metrics.current/Math.max(.001,base.metrics.current);for(const t of next.tracks)t.speed=Math.max(.1,Math.min(3,t.speed*factor));if(!ir.closed){next.tracks=[];next.markers=next.markers.filter(m=>m.effect!=='glow');}}
 if(ir.template==='incline'){const angle=ir.parameters.angle.value*Math.PI/180;next.tracks=[{kind:'trace',label:'Block motion · approximate page scale',speed:Math.max(.1,Math.min(3,Math.sqrt(Math.max(.01,run.metrics.acceleration)))),points:[{x:xmin,y:ymin},{x:Math.min(1,xmin+w*Math.cos(angle)),y:Math.min(1,ymin+w*Math.sin(angle))}]}];if(run.metrics.atRest)next.tracks=[];}
 next.equation=run.equations.join('; ');next.explanation='Recalculated from the reviewed scientific model. Image alignment and page scale remain approximate.';return next;
}
