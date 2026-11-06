import * as THREE from 'three';
import {Line2} from 'three/addons/lines/Line2.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {sciencePaths,labSciencePaths,forceStory,placePathLabels,insidePolygon} from './science-paths.js';

const palette={load:0xffc56e,transfer:0x72ece4,reaction:0x94bfff,flow:0xa2e4ff,motion:0xe1b5ff,contour:0xbee5e8};
export class ForcePathLayer{
 constructor(parent,graph,{overlay,point,host,hud}){
  this.group=new THREE.Group();parent.add(this.group);this.overlay=overlay;this.host=host;this.hud=hud;this.paths=overlay?sciencePaths(graph):labSciencePaths(graph);this.kind=graph.science?.kind;this.items=[];
  this.labelHost=hud?.querySelector('.animation-labels');
  this.occluders=overlay?graph.annotations?.occluders||[]:[];this.depthTest=this.occluders.length>0;
  for(const polygon of this.occluders){const shape=new THREE.Shape();polygon.forEach((p,i)=>{const v=point([p[0],p[1],.3]);if(i===0)shape.moveTo(v.x,v.y);else shape.lineTo(v.x,v.y);});shape.closePath();const mask=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,side:THREE.DoubleSide}));mask.position.z=point([0,0,.3]).z;mask.renderOrder=-10;this.group.add(mask);}
  for(const path of this.paths){
   const vectors=path.points.map(p=>point([p[0],p[1],.045]));
   // Two-point forces stay straight. Multi-point paths follow the observed contour.
   const curve=new THREE.CatmullRomCurve3(vectors,false,'centripetal'),points=curve.getPoints(96).flatMap(p=>p.toArray()),group=new THREE.Group();this.group.add(group);
   const line=(color,width,opacity,dashed=false)=>{const material=new LineMaterial({color,linewidth:width,transparent:true,opacity,depthTest:this.depthTest,depthWrite:false,dashed,dashSize:overlay?35:.35,gapSize:overlay?115:1.15});const mesh=new Line2(new LineGeometry().setPositions(points),material);mesh.computeLineDistances();mesh.renderOrder=50;group.add(mesh);return mesh;};
   const color=palette[path.role],halo=line(0x031017,8,.4),base=line(color,4,.72),sweep=line(0xf0ffff,2.2,.95,true),tip=curve.getPointAt(1),tangent=curve.getTangentAt(1),unit=overlay?1:.01;
   const head=new THREE.Mesh(new THREE.ConeGeometry(6.5*unit,18*unit,16),new THREE.MeshBasicMaterial({color,transparent:true,depthTest:this.depthTest,depthWrite:false}));head.position.copy(tip).addScaledVector(tangent,-7*unit);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);head.renderOrder=52;head.visible=path.role!=='contour';group.add(head);
   const anchor=new THREE.Mesh(new THREE.RingGeometry(7*unit,9*unit,40),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,side:THREE.DoubleSide,depthTest:this.depthTest,depthWrite:false}));anchor.position.copy(vectors[0]);group.add(anchor);
   const item={path,curve,group,halo,base,sweep,head,anchor,unit,zero:false,period:3.2};
   if(this.labelHost){item.label=document.createElement('span');item.label.className='force-label';item.label.textContent=path.label;item.label.style.setProperty('--force-color','#'+color.toString(16).padStart(6,'0'));this.labelHost.append(item.label);}
   this.items.push(item);
  }
  if(hud){hud.classList.add('has-force-story');this.leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');this.leaders.classList.add('force-leaders');hud.prepend(this.leaders);for(const item of this.items){item.leader=document.createElementNS('http://www.w3.org/2000/svg','path');this.leaders.append(item.leader);}}
 }
 update(time,guided=true){
  this.story=forceStory(this.kind,this.paths,time,guided);const w=this.host?.clientWidth||800,h=this.host?.clientHeight||600;
  for(const i of this.items){const active=this.story.emphasis(i.path.role);i.group.visible=!i.zero;i.base.material.opacity=.32+.6*active;i.halo.material.opacity=.18+.23*active;i.sweep.material.opacity=.2+.75*active;i.sweep.material.dashOffset=-time*(this.overlay?160:1.6)/i.period*3.2;i.head.material.opacity=.35+.65*active;i.anchor.material.opacity=(.2+.55*active)*(1-.35*Math.sin(time*3.2));i.anchor.scale.setScalar(1+.18*(1+Math.sin(time*3.2)));for(const mesh of [i.halo,i.base,i.sweep])mesh.material.resolution.set(w,h);if(i.label)i.label.dataset.active=String(active===1);}
  return this.story;
 }
 projectLabels(camera,enabled){
  if(!this.labelHost||!this.host)return;const w=this.host.clientWidth,h=this.host.clientHeight;
  const candidates=this.items.filter(i=>!i.zero&&i.path.role!=='contour').map(i=>{const p=i.curve.getPointAt(i.path.role==='transfer'?.55:.4);if(this.overlay&&this.occluders.some(poly=>insidePolygon([p.x/1000,1-p.y/1000],poly)))return null;this.group.localToWorld(p);p.project(camera);return {item:i,x:(p.x*.5+.5)*w,y:(.5-p.y*.5)*h,width:Math.min(190,Math.max(85,i.label.offsetWidth||i.path.label.length*6.3+24)),priority:this.story?.role===i.path.role?0:1};}).filter(Boolean).sort((a,b)=>a.priority-b.priority);
  const placed=enabled?placePathLabels(candidates,w,h):[];
  for(const i of this.items){if(i.label)i.label.hidden=true;if(i.leader)i.leader.style.display='none';}
  for(const p of placed){const i=p.item;i.label.hidden=false;i.label.style.transform=`translate(${p.x}px,${p.y}px)`;i.leader.setAttribute('d',`M ${p.x+p.w/2} ${p.y+p.h/2} L ${p.x+p.w/2} ${p.anchorY??p.y+p.h/2} L ${candidates.find(a=>a.item===i).x} ${candidates.find(a=>a.item===i).y}`);i.leader.style.display='';}
 }
 setResult(science,result){
  for(const i of this.items){i.zero=false;i.period=3.2;if(i.label)i.label.textContent=i.path.label;}
  if(!result.ready)return;const p=Object.fromEntries(science.inputs.map(p=>[p.name,p.value]));for(const i of this.items){let value;if(science.calculator==='drag'){if(i.path.role==='flow'){i.zero=p.speed===0;i.period=Math.max(.5,Math.min(12,320/Math.max(1,p.speed)));}if(/drag/i.test(i.path.label))value=result.metrics.drag;}if(science.calculator==='incline'){if(/normal/i.test(i.path.label))value=result.metrics.normal;if(/weight|gravity/i.test(i.path.label)&&p.mass!=null)value=p.mass*9.81;}if(value!==undefined){i.zero=value===0;if(i.label)i.label.textContent=i.path.label+' · '+new Intl.NumberFormat('en',{maximumSignificantDigits:4}).format(value)+' N';}}
 }
 clear(){this.hud?.classList.remove('has-force-story');this.leaders?.remove();for(const i of this.items)i.label?.remove();this.items=[];}
}
