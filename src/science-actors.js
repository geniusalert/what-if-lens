import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
// Shared authored visual vocabulary; model output chooses data, never shader code.
export function scienceActor(kind,color){
 const group=new THREE.Group(),mat=(tint,metalness=.2,roughness=.38)=>new THREE.MeshStandardMaterial({color:tint,metalness,roughness});
 const add=(geo,tint,position=[0,0,0])=>{const m=new THREE.Mesh(geo,mat(tint));m.position.set(...position);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;};
 if(kind==='car'){
  add(new RoundedBoxGeometry(.95,.32,.55,4,.08),color,[0,-.05,0]);add(new RoundedBoxGeometry(.48,.25,.47,4,.07),0x476b83,[-.05,.2,0]);
  add(new THREE.BoxGeometry(.27,.16,.485),0x132a3a,[-.05,.24,0]);
  for(const x of [-.29,.29])for(const z of [-.29,.29]){const tyre=add(new THREE.CylinderGeometry(.145,.145,.08,24),0x14232d,[x,-.2,z]);tyre.rotation.x=Math.PI/2;const hub=add(new THREE.CylinderGeometry(.075,.075,.085,20),0x93aab8,[x,-.2,z]);hub.rotation.x=Math.PI/2;}
  for(const z of [-.18,.18])add(new THREE.BoxGeometry(.03,.08,.11),0xffde93,[.48,.01,z]);
 }else if(kind==='bridge'){
  const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.48,-.3,0),new THREE.Vector3(0,.55,0),new THREE.Vector3(.48,-.3,0));
  for(const z of [-.3,.3]){const arch=add(new THREE.TubeGeometry(curve,40,.035,10,false),0x8babb9,[0,0,z]);arch.receiveShadow=true;}
  add(new RoundedBoxGeometry(1,.08,.8,2,.015),color,[0,.2,0]);
  for(const x of [-.47,.47])add(new RoundedBoxGeometry(.1,.7,.84,2,.015),0x4c6878,[x,-.15,0]);
  for(const x of [-.3,-.15,0,.15,.3])for(const z of [-.3,.3]){const t=x/.96+.5,y=-.3+1.7*t*(1-t),h=.2-y;add(new THREE.CylinderGeometry(.008,.008,h,8),0xb4c8cf,[x,y+h/2,z]);}
 }else if(kind==='lamp'){
  const glass=add(new THREE.SphereGeometry(.37,32,24),0xffe4aa,[0,.14,0]);glass.material.transparent=true;glass.material.opacity=.3;glass.material.depthWrite=false;glass.material.roughness=.12;
  const filament=add(new THREE.TorusGeometry(.09,.014,8,20),0xffcc67,[0,.12,0]);filament.material.emissive.setHex(0xffa622);filament.material.emissiveIntensity=2;
  add(new THREE.CylinderGeometry(.18,.22,.28,28),0xa9b8bd,[0,-.28,0]);
  for(let i=0;i<4;i++)add(new THREE.TorusGeometry(.2,.014,8,24),0x354b58,[0,-.18-i*.055,0]).rotation.x=Math.PI/2;
  add(new THREE.CylinderGeometry(.3,.35,.08,28),0x284654,[0,-.46,0]);group.userData.glow=filament;
 }else if(kind==='battery'){
  add(new RoundedBoxGeometry(.88,.8,.72,3,.05),color,[0,-.03,0]);add(new RoundedBoxGeometry(.9,.15,.74,2,.025),0x253e4c,[0,.35,0]);
  add(new THREE.CylinderGeometry(.085,.085,.12,20),0xd2dce0,[-.23,.47,0]);add(new THREE.CylinderGeometry(.085,.085,.12,20),0xdd9c43,[.23,.47,0]);
  add(new THREE.BoxGeometry(.04,.22,.015),0xe9f2ef,[0,0,.37]);add(new THREE.BoxGeometry(.2,.04,.015),0xe9f2ef,[0,0,.38]);
 }else if(kind==='resistor'){
  add(new THREE.CylinderGeometry(.24,.24,.7,24),0xd6bd8d).rotation.z=Math.PI/2;
  for(const [x,tint]of [[-.2,0xa95d3d],[-.08,0x313e58],[.05,0x335a83],[.21,0xd7aa49]])add(new THREE.CylinderGeometry(.245,.245,.035,24),tint,[x,0,0]).rotation.z=Math.PI/2;
  add(new THREE.CylinderGeometry(.025,.025,1,12),0xc0d1d6).rotation.z=Math.PI/2;
 }else return null;
 return group;
}
