// Work in the lab's isotropic length units. Image x and y occupy 10 and 8
// world units respectively. Map back to image coordinates for the overlay.
const aspect=10/8;
const segments=24;
const period=5;
const still={type:'none',axis:[0,0,0],period,phase:0,amplitude:0};
const path={...still,type:'path'};

function contact(wheel,anchor,side){
 const dx=side*(anchor[0]-wheel.position[0])*aspect;
 const dy=anchor[1]-wheel.position[1];
 const radius=wheel.size[1]/2;
 const distance=Math.hypot(dx,dy);
 if(dx<=0||dy<=0||distance<=radius)throw Error('The suspended load must be below and between the two pulleys.');
 const tangent=Math.atan2(dy,dx)-Math.acos(radius/distance);
 const wrap=Math.PI+tangent;
 return {radius,wrap,length:radius*wrap+Math.sqrt(distance*distance-radius*radius)};
}

// L = vertical free end + wrapped arc + tangent segment to the load.
// Moving the load determines the free-end displacement and no-slip wheel turn.
export function suspensionSide(wheel,anchor,side,initialLength,restEndY){
 const {radius,wrap,length}=contact(wheel,anchor,side);
 const [cx,cy,z]=wheel.position;
 const travel=initialLength-length;
 const end=[cx-side*radius/aspect,restEndY+travel,z];
 const points=[end];
 for(let i=0;i<=segments;i++){
  const a=Math.PI+wrap*i/segments;
  points.push([cx+side*radius*Math.cos(a)/aspect,cy+radius*Math.sin(a),z]);
 }
 points.push(anchor);
 return {points,end,rotation:-side*travel/radius};
}

export function suspendedPulleyScene(draft){
 const wheels=draft.objects?.filter(o=>o.primitive==='torus').sort((a,b)=>a.position[0]-b.position[0]);
 const mass=draft.objects?.find(o=>o.primitive==='box'&&/mass|load|block/i.test(o.id+' '+o.label));
 if(wheels?.length!==2||!mass)throw Error('Supply two pulley wheels and one suspended mass.');
 for(const n of [...wheels,mass]){
  if(![n.position,n.size].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite))||
    n.position.slice(0,2).some(v=>v<0||v>1)||n.size.slice(0,2).some(v=>v<=0||v>1))throw Error('Use normalized positive landmark sizes and image coordinates.');
 }
 const object=(id,label,primitive,position,size,color,motion=still,points=[])=>({id,label,primitive,position,size,color,motion,points,rotation:[0,0,0]});
 const [mx,my]=mass.position, width=Math.min(.25,mass.size[0]),height=Math.min(.18,mass.size[1]);
 const rest=[mx,my-height/2,0];
 const lift=.25*(rest[1]-Math.max(...wheels.map(w=>w.position[1]+w.size[1]/2)));
 if(lift<.015)throw Error('Locate the suspended mass below the wheels.');
 const load=object('load','Suspended mass M','box',[mx,my,0],[width,height,.10],'blue',path,[[mx,my,0],[mx,my-lift,0]]);
 const top=Math.min(...wheels.map(w=>w.position[1]-w.size[1]/2))-.05;
 const [left,right]=wheels.map(w=>w.position[0]);
 const objects=[load,object('beam','Overhead support','box',[(left+right)/2,top,-.055],[right-left+.14,.024,.10],'slate')];
 for(const [index,w] of wheels.entries()){
  const side=index===0?1:-1, suffix=index===0?'A':'B',pull=index===0?'P':'Q';
  const [x,y]=w.position,diam=Math.min(w.size[0]*aspect,w.size[1],.22);
  const wheel=object('wheel-'+suffix,'Fixed pulley '+suffix,'torus',[x,y,0],[diam/aspect,diam,.07],'amber');
  objects.push(object('hanger-'+suffix,'Axle bracket '+suffix,'box',[x,(top+y)/2,-.045],[.021,y-top,.045],'slate'),wheel);
  const initialLength=contact(wheel,rest,side).length,restEndY=my-height/2;
  const start=suspensionSide(wheel,rest,side,initialLength,restEndY);
  const finish=suspensionSide(wheel,[mx,rest[1]-lift,0],side,initialLength,restEndY);
  const end=object('end-'+pull,'Pull '+pull,'sphere',start.end,[.026,.032,.03],'amber',path,[start.end,finish.end]);
  const rope=object('rope-'+suffix,'Rope over '+suffix,'line',[0,0,0],[.009,.009,.009],'white',still,start.points);
  rope.pulleyContact={wheel:wheel.id,load:load.id,end:end.id,side};
  const arrow=object('pull-'+pull,'Downward pull '+pull,'arrow',[0,0,0],[.012,.012,.012],'cyan',still,[start.end,[start.end[0],restEndY+.065,0]]);
  objects.push(rope,end,{...arrow,follow:end.id});
 }
 return {title:'Suspended mass over two fixed pulleys',description:'Pull both outer ends down to raise the mass. Each rope wraps around its wheel and meets the top of the block.',
  equations:['Each rope: free length + wrapped length + inner span = constant.'],
  assumptions:['Taut, inextensible ropes and ideal fixed pulleys. The load follows a prescribed vertical displacement. Dimensions and timing are illustrative.'],
  objects,science:{kind:'diagram',calculator:'none',explanation:'Each free end takes up the length released by its inner segment as the load rises.',inputs:[]},
  annotations:{target:'Suspended mass and two fixed pulleys',paths:[],occluders:[]}};
}

// Derive constants once from the saved geometry so replay and import use the
// same rest pose. References and tangent geometry are checked at load time.
export function bindPulleyContact(rope,nodes){
 const {side,wheel:wheelId,load:loadId,end:endId}=rope.pulleyContact;
 const wheel=nodes.get(wheelId),load=nodes.get(loadId),end=nodes.get(endId);
 if(![1,-1].includes(side)||rope.primitive!=='line'||rope.points.length!==segments+3||
    wheel?.primitive!=='torus'||wheel.motion.type!=='none'||load?.primitive!=='box'||load.motion.type!=='path'||
    end?.primitive!=='sphere'||load.points.some(p=>p[0]!==load.position[0]||p[2]!==load.position[2]))throw Error('Invalid fixed-pulley constraint.');
 const anchorAt=y=>[load.position[0],y-load.size[1]/2,wheel.position[2]];
 const initialLength=contact(wheel,anchorAt(load.position[1]),side).length;
 for(const p of load.points)contact(wheel,anchorAt(p[1]),side);
 return {wheel,load,end,at:y=>suspensionSide(wheel,anchorAt(y),side,initialLength,end.position[1])};
}
