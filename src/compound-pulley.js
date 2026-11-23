// The upper rope goes from a ground anchor, over A, to the axle of B.
// The lower rope goes over B and connects the two resting masses.
export function compoundPulleyScene(){
 const still={type:'none',axis:[0,0,0],amplitude:0,period:4,phase:0};
 const rise=(x,y,height)=>[[x,y,0],[x,y-height,0]];
 const path={...still,type:'path'};
 const object=(id,label,primitive,position,size,color,motion=still,points=[])=>({
  id,label,primitive,position,size,color,motion,points,rotation:[0,0,0]
 });
 const a=[.40,.27,0],b=[.52,.61,0],rx=.12,ry=.15,step=.023;
 const ground=.88,lighterX=b[0]-rx,heavierX=b[0]+rx,massMiddle=.827,massTop=.775;
 const arc=([x,y,z])=>Array.from({length:13},(_,i)=>{
  const angle=i*Math.PI/12;
  return [x-rx*Math.cos(angle),y-ry*Math.sin(angle),z];
 });
 const upperArc=arc(a),lowerArc=arc(b),ropeSize=[.009,.009,.009],origin=[0,0,0];
 const line=(id,label,points,attachments)=>({
  ...object(id,label,'line',origin,ropeSize,'white',still,points),attachments
 });
 const attachedArc=(id,points)=>points.map((_,index)=>({id,index:index+1}));
 return {
  title:'Compound pulley with two masses',
  description:'An upward pull on A raises B through the upper rope. The lower rope links the two masses. Watch the lighter mass lift as the other stays on its support.',
  assumptions:['Ideal ropes of fixed length and frictionless pulleys.','Motion illustrates one lift with the heavier mass still supported by the floor.'],
  equations:['With the ground end fixed, B rises twice as far as A.'],
  objects:[
   object('ground','Ground and rope anchor','box',[.49,ground+.016,0],[.56,.032,.13],'slate'),
   {...object('pulley-a','Pulley A','torus',a,[2*rx,2*ry,.065],'cyan',path,rise(a[0],a[1],step)),rollOnRope:1},
   {...object('pulley-b','Pulley B','torus',b,[2*rx,2*ry,.065],'amber',path,rise(b[0],b[1],2*step)),rollOnRope:-1},
   line('upper-rope','Upper rope',[[a[0]-rx,ground,0],...upperArc,b],[...attachedArc('pulley-a',upperArc),{id:'pulley-b',index:upperArc.length+1}]),
   line('lower-rope','Lower rope',[[lighterX,massTop,0],...lowerArc,[heavierX,massTop,0]],[{id:'mass-m',index:0},...attachedArc('pulley-b',lowerArc)]),
   object('mass-m','Mass m','box',[lighterX,massMiddle,0],[.085,.106,.09],'blue',path,rise(lighterX,massMiddle,4*step)),
   object('mass-M','Mass M','box',[heavierX,massMiddle,0],[.10,.106,.09],'violet'),
   {...object('force-f','Upward force F','arrow',origin,[.02,.02,.02],'amber',still,[a,[a[0],.052,0]]),follow:'pulley-a'}
  ]
 };
}
