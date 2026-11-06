// A bounded scene description, never executable model-generated code.
import {validateAnnotations} from './science-paths.js';
const vec={type:'array',items:{type:'number'}};
const motionSchema={type:'object',additionalProperties:false,properties:{type:{type:'string',enum:['none','oscillate','rotate','pulse','path','flow']},axis:vec,amplitude:{type:'number'},period:{type:'number'},phase:{type:'number'}},required:['type','axis','amplitude','period','phase']};
const objectSchema={type:'object',additionalProperties:false,properties:{id:{type:'string'},label:{type:'string'},primitive:{type:'string',enum:['box','sphere','cylinder','torus','cone','line','arrow','text']},position:vec,size:vec,rotation:vec,color:{type:'string',enum:['cyan','amber','white','blue','violet','slate']},points:{type:'array',items:vec},motion:motionSchema},required:['id','label','primitive','position','size','rotation','color','points','motion']};
export const sceneSchema={type:'object',additionalProperties:false,properties:{title:{type:'string'},description:{type:'string'},assumptions:{type:'array',items:{type:'string'}},equations:{type:'array',items:{type:'string'}},objects:{type:'array',items:objectSchema}},required:['title','description','assumptions','equations','objects']};
const primitives=sceneSchema.properties.objects.items.properties.primitive.enum,colors=sceneSchema.properties.objects.items.properties.color.enum;
function vector(v,lo,hi){return Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&n>=lo&&n<=hi);}
export function validateSceneGraph(input){
 input=structuredClone(input);if(Array.isArray(input?.objects))for(const n of input.objects){if(Array.isArray(n.size)&&n.size.length===3&&n.size.every(v=>Number.isFinite(v)&&v>=0&&v<=1.5)&&n.size.some(v=>v>0))n.size=n.size.map(v=>Math.max(.003,v));if(n.motion?.type==='none'&&n.motion.period===0)n.motion.period=4;}
 if(!input||typeof input.title!=='string'||input.title.length>160||typeof input.description!=='string'||input.description.length>1800||!Array.isArray(input.assumptions)||input.assumptions.length>12||input.assumptions.some(s=>typeof s!=='string'||s.length>500)||!Array.isArray(input.equations)||input.equations.length>8||input.equations.some(s=>typeof s!=='string'||s.length>300)||!Array.isArray(input.objects)||input.objects.length<1||input.objects.length>40)throw Error('Invalid generated scene.');
 const ids=new Set();let moving=0;
 for(const n of input.objects){if(typeof n.id!=='string'||!/^[a-zA-Z0-9_-]{1,40}$/.test(n.id)||ids.has(n.id)||typeof n.label!=='string'||n.label.length>100||!primitives.includes(n.primitive)||!colors.includes(n.color)||!vector(n.position,-.5,1.5)||!vector(n.size,.001,1.5)||!vector(n.rotation,-6.3,6.3)||!Array.isArray(n.points)||n.points.length>64||n.points.some(p=>!vector(p,-.5,1.5)))throw Error('Invalid generated object.');ids.add(n.id);
  const m=n.motion;if(!m||!['none','oscillate','rotate','pulse','path','flow'].includes(m.type)||!vector(m.axis,-1,1)||!Number.isFinite(m.amplitude)||m.amplitude<0||m.amplitude>.5||!Number.isFinite(m.period)||m.period<.5||m.period>30||!Number.isFinite(m.phase)||Math.abs(m.phase)>6.3)throw Error('Invalid generated motion.');
  if(['line','arrow'].includes(n.primitive)&&n.points.length<2)throw Error('A line or arrow needs endpoints.');if((m.type==='path'||m.type==='flow')&&n.points.length<2)throw Error('Path motion needs a visible path.');if(n.primitive!=='text'&&((m.type==='rotate'&&m.axis.some(v=>v!==0))||m.type==='path'||(m.type==='flow'&&n.primitive==='line')||(m.type==='oscillate'&&m.amplitude>0&&m.axis.some(v=>v!==0))||(m.type==='pulse'&&m.amplitude>0)))moving++;
 }
 if(input.annotations!==undefined)input.annotations=validateAnnotations(input.annotations);
 if(!moving||!input.objects.some(n=>!['text','line','arrow'].includes(n.primitive)))throw Error('The generated scene needs actual animated 3D objects.');return structuredClone(input);
}
export function sceneObjectState(node,time){
 const m=node.motion,angle=time*Math.PI*2/m.period+m.phase,position=[...node.position],rotation=[...node.rotation];let scale=1;
 if(m.type==='oscillate')for(let i=0;i<3;i++)position[i]+=m.axis[i]*m.amplitude*Math.sin(angle);
 if(m.type==='rotate')for(let i=0;i<3;i++)rotation[i]+=m.axis[i]*angle;
 if(m.type==='pulse')scale=1+Math.min(.45,m.amplitude)*Math.sin(angle);
 if(m.type==='path'){const f=(1-Math.cos(angle))/2*(node.points.length-1),i=Math.min(node.points.length-2,Math.floor(f)),u=f-i;for(let j=0;j<3;j++)position[j]=node.points[i][j]*(1-u)+node.points[i+1][j]*u;}
 return {position,rotation,scale};
}
export function samplePulleyScene(){
 const still={type:'none',axis:[0,0,0],amplitude:0,period:4,phase:0};
 const object=(id,primitive,position,size,color,motion=still,points=[])=>({id,label:id,primitive,position,size,color,rotation:[0,0,0],points,motion});
 return {title:'Two masses over a pulley',description:'Illustrative connected motion: one mass rises while the other falls, and the pulley rotates.',assumptions:['Ideal inextensible rope and frictionless pulley.','The repeating motion illustrates the constraint; it is not a measured acceleration.'],equations:['The two masses have equal and opposite displacements.'],objects:[object('support','box',[.5,.15,0],[.42,.025,.1],'slate'),object('pulley','torus',[.5,.3,0],[.18,.18,.08],'amber',{type:'rotate',axis:[0,0,1],amplitude:.15,period:4,phase:0}),object('rope','line',[0,0,0],[.008,.008,.008],'white',still,[[.41,.3,0],[.41,.7,0],[.59,.7,0],[.59,.3,0]]),object('mass1','box',[.41,.68,0],[.12,.14,.12],'cyan',{type:'oscillate',axis:[0,1,0],amplitude:.12,period:4,phase:0}),object('mass2','box',[.59,.68,0],[.12,.14,.12],'violet',{type:'oscillate',axis:[0,1,0],amplitude:.12,period:4,phase:Math.PI})]};
}
