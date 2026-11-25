import * as THREE from 'three';

// Each ring is attached to a contact point. Reuse its buffers while scrubbing
// or dragging instead of rebuilding a Three.js curve and tube every frame.
const sides=8;
export function planarRope(points,project,radius){
 const geometry=new THREE.BufferGeometry(),rings=points.length;
 const indices=[];
 for(let i=1;i<rings;i++)for(let j=0;j<sides;j++){
  const a=(i-1)*sides+j,b=(i-1)*sides+(j+1)%sides;
  indices.push(a,b,a+sides,b,b+sides,a+sides);
 }
 geometry.setIndex(indices);
 for(const name of ['position','normal']){
  geometry.setAttribute(name,new THREE.BufferAttribute(new Float32Array(rings*sides*3),3).setUsage(THREE.DynamicDrawUsage));
 }
 const positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal');
 const ring=Array.from({length:sides},(_,j)=>[Math.cos(2*Math.PI*j/sides),Math.sin(2*Math.PI*j/sides)]);
 function update(path){
  const centers=path.map(project);
  for(let i=0;i<rings;i++){
   const prev=centers[Math.max(0,i-1)],next=centers[Math.min(rings-1,i+1)],center=centers[i];
   const dx=next.x-prev.x,dy=next.y-prev.y,length=Math.hypot(dx,dy)||1;
   for(let j=0;j<sides;j++){
    const [c,nz]=ring[j],nx=-dy*c/length,ny=dx*c/length,k=i*sides+j;
    normals.setXYZ(k,nx,ny,nz);
    positions.setXYZ(k,center.x+radius*nx,center.y+radius*ny,center.z+radius*nz);
   }
  }
  positions.needsUpdate=true;normals.needsUpdate=true;
  geometry.computeBoundingSphere();
 }
 update(points);
 return {geometry,update};
}
