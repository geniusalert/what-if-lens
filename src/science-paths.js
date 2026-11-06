// Image registration and explanatory timing are separate from the reconstructed model.
// All paths are data, never model-generated shaders or executable code.
export const annotationSchema={type:'object',additionalProperties:false,properties:{target:{type:'string'},occluders:{type:'array',items:{type:'array',items:{type:'array',items:{type:'number'}}}},paths:{type:'array',items:{type:'object',additionalProperties:false,properties:{id:{type:'string'},label:{type:'string'},role:{type:'string',enum:['load','transfer','reaction','flow','motion','contour']},points:{type:'array',items:{type:'array',items:{type:'number'}}}},required:['id','label','role','points']}}},required:['target','paths','occluders']};
const roles=annotationSchema.properties.paths.items.properties.role.enum;
export function validateAnnotations(value){
 if(!value||typeof value.target!=='string'||value.target.length>100||!Array.isArray(value.paths)||value.paths.length>10)throw Error('Invalid source annotations.');
 if(value.occluders!==undefined){if(!Array.isArray(value.occluders)||value.occluders.length>3)throw Error('Invalid foreground masks.');for(const poly of value.occluders){if(!Array.isArray(poly)||poly.length<3||poly.length>16||poly.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1)))throw Error('Invalid foreground polygon.');const area=Math.abs(poly.reduce((a,p,i)=>{const q=poly[(i+1)%poly.length];return a+p[0]*q[1]-q[0]*p[1];},0))/2;if(area<.001||area>.65)throw Error('Foreground mask covers an invalid area.');}}
 const ids=new Set();for(const p of value.paths){if(!p||typeof p.id!=='string'||!/^[-\w]{1,40}$/.test(p.id)||ids.has(p.id)||typeof p.label!=='string'||p.label.length>64||!roles.includes(p.role)||!Array.isArray(p.points)||p.points.length<2||p.points.length>16||p.points.some(v=>!Array.isArray(v)||v.length!==2||v.some(n=>!Number.isFinite(n)||n<0||n>1)))throw Error('Invalid image-anchored path.');ids.add(p.id);if(p.points.every(v=>Math.hypot(v[0]-p.points[0][0],v[1]-p.points[0][1])<.002))throw Error('An annotation needs a visible path.');}
 return structuredClone(value);
}
export function pathRole(label){if(/air|fluid|current|flow/i.test(label))return 'flow';if(/compression|thrust|transfer|tension/i.test(label))return 'transfer';if(/normal|reaction|support|friction|drag/i.test(label))return 'reaction';if(/gravity|weight|load/i.test(label))return 'load';return 'motion';}
export function sciencePaths(graph){
 if(graph.annotations?.paths.length)return validateAnnotations(graph.annotations).paths;
 // Legacy scenes still render; only new observations have a source-traced contract.
 return graph.objects.filter(n=>['line','arrow'].includes(n.primitive)&&! /rope|wire|road/i.test(n.label)).slice(0,10).map(n=>({id:n.id,label:n.label,role:pathRole(n.label),points:n.points.map(p=>p.slice(0,2).map(v=>Math.max(0,Math.min(1,v))))}));
}
// The lab has authored equipment geometry; its force paths attach to that geometry.
// It must never reuse the photo's perspective contour as a 3D equipment connection.
export function labSciencePaths(graph){
 if(graph.science?.kind!=='bridge')return sciencePaths(graph);
 const body=graph.objects.find(n=>/arch bridge|bridge span/i.test(n.label));if(!body)return sciencePaths(graph);
 const p=(x,y)=>[body.position[0]+x*body.size[0],body.position[1]-y*body.size[1]];
 const arch=sign=>Array.from({length:12},(_,i)=>{const x=sign*.47*i/11,t=x+.5;return p(x,-.38+2*1.18*t*(1-t));});
 return [{id:'lab-load',label:'Applied load',role:'load',points:[p(0,.65),p(0,.31)]},{id:'lab-compression-left',label:'Compression',role:'transfer',points:arch(-1)},{id:'lab-compression-right',label:'Compression',role:'transfer',points:arch(1)},{id:'lab-reaction-left',label:'Support reaction',role:'reaction',points:[p(-.47,-.43),p(-.47,-.16)]},{id:'lab-reaction-right',label:'Support reaction',role:'reaction',points:[p(.47,-.43),p(.47,-.16)]}];
}
const stories={
 bridge:[['load','Load enters the structure','Gravity acts downward on the bridge.'],['transfer','Follow the compression','The curved structure transfers load toward its supports.'],['reaction','The supports respond','Reactions at the foundations balance the applied loads.']],
 vehicle:[['flow','Follow the air','Air paths curve around the vehicle’s visible body.'],['reaction','Drag opposes motion','Air resistance acts against the car’s motion through the air.']],
 surface:[['load','Gravity pulls down','Weight acts on the object.'],['reaction','Contact forces respond','The surface provides a normal reaction; friction resists relative sliding.']]
};
export function forceStory(kind,paths,time,guided=true){
 const available=new Set(paths.map(p=>p.role)),steps=(stories[kind]||[['motion','Follow the motion','Trace the change through the visible system.']]).filter(s=>available.has(s[0]));
 if(!steps.length)steps.push(['motion','Explore the science','Paths illustrate the selected scientific model.']);
 const duration=steps.length*3.2,t=((time%duration)+duration)%duration,index=Math.floor(t/3.2),step=steps[index];
 return {duration,index,count:steps.length,role:step[0],title:step[1],caption:step[2],progress:t/duration,emphasis:role=>!guided||role===step[0]?1:.24};
}
// Place projected labels using measured widths; no overlapping or clipped labels.
export function placePathLabels(anchors,width,height){
 const placed=[],margin=12;for(const a of anchors){const w=Math.min(width-margin*2,a.width||120),h=27;const candidates=[[-w/2,-42],[18,-h/2],[-w-18,-h/2],[-w/2,18],[-w/2,-84],[-w/2,48]];let best;
  for(const [dx,dy] of candidates){const x=Math.max(margin,Math.min(width-w-margin,a.x+dx)),y=Math.max(46,Math.min(height-h-62,a.y+dy));if(placed.every(p=>x+w+7<p.x||p.x+p.w+7<x||y+h+7<p.y||p.y+p.h+7<y)){best={...a,x,y,w,h};break;}}
  if(best&&a.x>=0&&a.x<=width&&a.y>=0&&a.y<=height)placed.push(best);
 }return placed;
}

export function insidePolygon(point,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
