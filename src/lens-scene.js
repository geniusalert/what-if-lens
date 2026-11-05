import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {solveIR,frameState,surfaceValue} from './compiler.js';

// Both views use actual lit meshes. Live coordinates are normalized to the source image.
export class LensScene{
 constructor(host,{overlay=false}={}){
  this.host=host;this.overlay=overlay;this.scene=new THREE.Scene();this.group=new THREE.Group();this.scene.add(this.group);
  this.renderer=new THREE.WebGLRenderer({alpha:overlay,antialias:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));this.renderer.setClearColor(0x08151e,overlay?0:1);host.append(this.renderer.domElement);
  this.renderer.domElement.setAttribute('aria-label',overlay?'3D animation over live camera':'Interactive 3D scientific experiment');
  this.camera=overlay?new THREE.OrthographicCamera(0,1000,1000,0,.1,4000):new THREE.PerspectiveCamera(43,1,.1,100);
  this.camera.position.set(...(overlay?[0,0,1800]:[8,6,11]));if(!overlay){this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.target.set(0,1,0);this.scene.add(new THREE.GridHelper(18,18,0x335263,0x1b3442));this.scene.add(new THREE.AxesHelper(4));}
  this.scene.add(new THREE.HemisphereLight(0xc7f5ff,0x19304a,2.8));const light=new THREE.DirectionalLight(0xffefc6,4);light.position.set(200,400,1600);this.scene.add(light);
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();this.items=[];
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);if(!this.overlay){this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}}
 clear(){this.group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});this.group.clear();this.group.matrixAutoUpdate=true;this.group.matrix.identity();this.items=[];this.run=null;this.mapping=null;this.ramp=null;this.circuitCurve=null;this.mover=null;}
 mesh(geometry,color,position=[0,0,0]){const material=new THREE.MeshStandardMaterial({color,metalness:.32,roughness:.23});const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);this.group.add(mesh);return mesh;}
 ball(r=.15,color=0xffcf7c){return this.mesh(new THREE.SphereGeometry(r,20,16),color);}
 tube(points,r,color=0x73e4f3,smooth=true){if(points.length<2)return null;const vectors=points.map(p=>new THREE.Vector3(...p));let curve;if(smooth)curve=new THREE.CatmullRomCurve3(vectors,false,'centripetal');else{curve=new THREE.CurvePath();for(let i=1;i<vectors.length;i++)if(vectors[i].distanceTo(vectors[i-1])>.001)curve.add(new THREE.LineCurve3(vectors[i-1],vectors[i]));if(!curve.curves.length)return null;}this.mesh(new THREE.TubeGeometry(curve,Math.min(240,points.length*8),r,8,false),color);return curve;}
 setPlan(plan){this.clear();this.plan=plan;for(const track of plan.tracks){const points=track.points.map(p=>[p.x*1000,(1-p.y)*1000,8]),curve=this.tube(points,2.2,0x4dc8ef,track.kind==='trace');if(!curve)continue;
   const count=track.kind==='flow'?28:1,dots=Array.from({length:count},()=>this.ball(track.kind==='flow'?5:13,track.kind==='flow'?0x8deaff:0xffc568));this.items.push({track,curve,dots,points});
  }
  for(const marker of plan.markers){if(marker.effect==='label')continue;const dot=this.ball(marker.effect==='glow'?13:5,marker.effect==='glow'?0xffcf70:0x9dd9ff);dot.position.set(marker.x*1000,(1-marker.y)*1000,18);dot.material.emissive.setHex(marker.effect==='glow'?0x9a5510:0x183448);this.items.push({marker,dot});}
 }
 setIR(ir){this.clear();this.plan=null;this.run=solveIR(ir);const run=this.run,p=Object.fromEntries(Object.entries(ir.parameters).map(([k,v])=>[k,v.value]));
  if(ir.template==='quadratic'){const key=ir.source.text;if(this.quadFrame?.key!==key){const center=run.metrics.vertex?.x||0,ys=Array.from({length:121},(_,i)=>{const x=center-4+8*i/120;return p.a*x*x+p.b*x+p.c;});this.quadFrame={key,center,min:Math.min(...ys),scale:5/Math.max(1,Math.max(...ys)-Math.min(...ys))};}const {center,min,scale}=this.quadFrame,xmin=center-4,points=Array.from({length:121},(_,i)=>{const x=xmin+8*i/120;return[x,p.a*x*x+p.b*x+p.c];});this.mapping=f=>new THREE.Vector3(f.x-center,(f.y-min)*scale+.2,0);this.tube(points.map(([x,y])=>this.mapping({x,y}).toArray()),.045);this.mover=this.ball(.19);this.tube([this.mapping({x:xmin,y:0}).toArray(),this.mapping({x:xmin+8,y:0}).toArray()],.012,0x526c7c);for(const x of run.metrics.roots){if(x>=xmin&&x<=xmin+8){const root=this.ball(.09,0xe5a672);root.position.copy(this.mapping({x,y:0}));}}}
  if(ir.template==='projectile'){const scale=8/Math.max(1,run.metrics.range);this.mapping=f=>new THREE.Vector3(-4+f.x*scale,f.y*scale+.2,0);this.tube(Array.from({length:121},(_,i)=>this.mapping(frameState(run,run.duration*i/120)).toArray()),.035);this.mover=this.ball(.18);}
  if(ir.template==='incline'){this.ramp=new THREE.Group();this.group.add(this.ramp);const ramp=this.mesh(new THREE.BoxGeometry(8,.18,2),0x36566a);this.ramp.add(ramp);this.ramp.rotation.z=-p.angle*Math.PI/180;this.ramp.position.y=2.3;this.mover=this.mesh(new THREE.BoxGeometry(.65,.65,.65),0x7ce5ef);this.ramp.add(this.mover);}
  if(ir.template==='circuit'){this.circuitCurve=this.tube([[-3,.2,-2],[-3,.2,2],[3,.2,2],[3,.2,-2],[-3,.2,-2]],.05);this.dots=Array.from({length:24},()=>this.ball(.065,0x79e6ff));ir.entities.forEach((e,i)=>this.mesh(new THREE.BoxGeometry(.7,.4,.45),0xb5a27d,[-2+4*i/Math.max(1,ir.entities.length-1),.4,-2]));this.lamp=this.ball(.5,0xffd28a);this.lamp.position.set(3,.8,0);this.lamp.material.emissive.setHex(ir.closed?0x8a4e0b:0);}
  if(ir.template==='surface'){const geometry=new THREE.PlaneGeometry(6,6,48,48);geometry.rotateX(-Math.PI/2);const a=geometry.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,surfaceValue(ir,a.getX(i),a.getZ(i)));geometry.computeVertexNormals();const surface=this.mesh(geometry,0x4ebcca);surface.material.side=THREE.DoubleSide;surface.material.transparent=true;surface.material.opacity=.8;this.mover=this.ball(.14);}
 }
 render(time,{visible=true,pose=null,width=160,height=120,speed=1,amplitude=1}={}){
  this.group.visible=visible;
  if(this.overlay){if(pose){const {a,b,tx,ty}=pose;this.group.matrixAutoUpdate=false;this.group.matrix.set(a,b*height/width,0,1000*(tx-b*height)/width,-b*width/height,a,0,1000*(1-a-ty/height),0,0,1,0,0,0,0,1);}else{this.group.matrixAutoUpdate=true;this.group.position.set(0,0,0);this.group.rotation.set(0,0,0);this.group.scale.set(1,1,1);}}
  for(const item of this.items){if(item.marker){item.dot.scale.setScalar(1+.12*Math.sin(time*2));continue;}const t=time*item.track.speed*speed;item.dots.forEach((dot,i)=>{let point=item.curve.getPointAt((t*.14+i/item.dots.length)%1);if(['oscillate','rotate'].includes(item.track.kind)){const [a,b]=item.points,r=Math.hypot(b[0]-a[0],b[1]-a[1]),base=Math.atan2(b[1]-a[1],b[0]-a[0]),angle=base+(item.track.kind==='rotate'?t:.38*amplitude*Math.sin(t*2));point=new THREE.Vector3(a[0]+r*Math.cos(angle),a[1]+r*Math.sin(angle),20);}if(item.track.kind==='wave')point.y+=8*amplitude*Math.sin(t*3+point.x*.02);dot.position.copy(point);});}
  if(this.run){const f=frameState(this.run,time%this.run.duration),p=this.run.ir.parameters;if(this.mapping)this.mover.position.copy(this.mapping(f));if(this.ramp)this.mover.position.set(-3+Math.min(6,f.distance*.3),.42,0);if(this.circuitCurve)this.dots.forEach((d,i)=>{d.visible=this.run.metrics.current>0;d.position.copy(this.circuitCurve.getPointAt((time*this.run.metrics.current*.08+i/24)%1));});if(this.run.ir.template==='surface')this.mover.position.set(f.sliceX,f.z+.15,0);}
  this.controls?.update();this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.observer.disconnect();this.controls?.dispose();this.clear();this.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();}
}
