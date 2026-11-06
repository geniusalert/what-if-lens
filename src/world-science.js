// Educational idealizations. Images identify objects; dimensions and coefficients
// come from supplied inputs, never an uncalibrated photograph.
export const worldQuantities={
 speed:{label:'Air-relative speed',unit:'km/h',min:0,max:1500},
 dragCoefficient:{label:'Drag coefficient Cd',unit:'1',min:.001,max:4},
 frontalArea:{label:'Frontal area',unit:'m2',min:.001,max:1000},
 airDensity:{label:'Air density',unit:'kg/m3',min:.001,max:30},
 mass:{label:'Mass',unit:'kg',min:.001,max:1000000},
 rollingCoefficient:{label:'Rolling resistance coefficient',unit:'1',min:0,max:1},
 muStatic:{label:'Static friction coefficient',unit:'1',min:0,max:5},
 muKinetic:{label:'Kinetic friction coefficient',unit:'1',min:0,max:5},
 angle:{label:'Surface angle',unit:'deg',min:0,max:89},
 span:{label:'Support separation',unit:'m',min:.01,max:10000},
 load:{label:'Vertical point load',unit:'N',min:0,max:1e12},
 position:{label:'Load distance from left support',unit:'m',min:0,max:10000}
};
export const worldScienceSchema={type:'object',additionalProperties:false,properties:{kind:{type:'string',enum:['bridge','vehicle','surface','diagram','general','equation']},calculator:{type:'string',enum:['none','drag','incline','bridge_load']},explanation:{type:'string'},inputs:{type:'array',items:{type:'object',additionalProperties:false,properties:{name:{type:'string',enum:Object.keys(worldQuantities)},value:{type:['number','null']},unit:{type:'string'},origin:{type:'string',enum:['provided','unknown']}},required:['name','value','unit','origin']}}},required:['kind','calculator','explanation','inputs']};
export function validateWorldScience(value){
 if(!value)return {kind:'general',calculator:'none',explanation:'Illustrative reconstruction of the visible object.',inputs:[]};
 if(!worldScienceSchema.properties.kind.enum.includes(value.kind)||!worldScienceSchema.properties.calculator.enum.includes(value.calculator)||typeof value.explanation!=='string'||value.explanation.length>1500||!Array.isArray(value.inputs)||value.inputs.length>12)throw Error('Invalid real-world science context.');
 const ids=new Set();for(const p of value.inputs){const q=worldQuantities[p.name];if(!q||ids.has(p.name)||p.unit!==q.unit||!['provided','unknown'].includes(p.origin)||p.value!==null&&(!Number.isFinite(p.value)||p.value<q.min||p.value>q.max)||p.origin==='unknown'&&p.value!==null||p.origin==='provided'&&p.value===null)throw Error('Invalid scientific input.');ids.add(p.name);}
 return structuredClone(value);
}
const required={drag:['speed','dragCoefficient','frontalArea','airDensity'],incline:['muStatic'],bridge_load:['span','load','position'],none:[]};
export function prepareWorldScience(context){
 const s=validateWorldScience(context),keys=new Set([...required[s.calculator],...s.inputs.map(p=>p.name)]);
 if(s.calculator==='drag'){keys.add('mass');keys.add('rollingCoefficient');}
 if(s.calculator==='incline'){keys.add('angle');keys.add('mass');keys.add('muKinetic');}
 s.inputs=[...keys].map(name=>s.inputs.find(p=>p.name===name)||{name,value:null,unit:worldQuantities[name].unit,origin:'unknown'});return s;
}
export function solveWorldScience(context){
 const s=prepareWorldScience(context),p=Object.fromEntries(s.inputs.filter(p=>p.value!==null).map(p=>[p.name,p.value])),missing=required[s.calculator].filter(k=>p[k]===undefined),metrics={},equations=[],assumptions=[];
 if(missing.length)return {ready:false,missing,metrics,equations,assumptions};
 if(s.calculator==='drag'){
  const speed=p.speed/3.6;metrics.drag=.5*p.airDensity*p.dragCoefficient*p.frontalArea*speed**2;metrics.dragPower=metrics.drag*speed;equations.push('Fd = ½ ρ Cd A v²','Pdrag = Fd × v');
  assumptions.push('Steady flow using the supplied Cd and reference area; coefficients may vary with speed. No aerodynamic measurements are inferred from the image.','Aerodynamic drag and tyre/road friction are separate effects.');
  if(p.mass!==undefined&&p.rollingCoefficient!==undefined){metrics.rollingResistance=p.rollingCoefficient*p.mass*9.81;metrics.totalResistance=metrics.drag+metrics.rollingResistance;equations.push('Frolling = Crr × m × g');assumptions.push('Level road, g = 9.81 m/s²; excludes acceleration, grade and drivetrain losses.');}
 }else if(s.calculator==='incline'){
  metrics.criticalAngle=Math.atan(p.muStatic)*180/Math.PI;equations.push('θcritical = atan(μs)','Sliding begins just above θcritical.');assumptions.push('Rigid block initially at rest on a uniform plane, Coulomb friction, no adhesive or other applied forces. Mass cancels from the onset angle.');
  if(p.muKinetic!==undefined&&p.muKinetic>p.muStatic)throw Error('Kinetic friction must not exceed static friction in this model.');
  if(p.angle!==undefined){const a=p.angle*Math.PI/180,slides=Math.tan(a)>p.muStatic+1e-10;metrics.slides=slides;
   if(p.mass!==undefined){metrics.normal=p.mass*9.81*Math.cos(a);metrics.downSlope=p.mass*9.81*Math.sin(a);}
   if(slides&&p.muKinetic!==undefined)metrics.acceleration=9.81*(Math.sin(a)-p.muKinetic*Math.cos(a));
  }
 }else if(s.calculator==='bridge_load'){
  if(p.position>p.span)throw Error('The load position must lie between the supports.');metrics.leftReaction=p.load*(p.span-p.position)/p.span;metrics.rightReaction=p.load*p.position/p.span;equations.push('RL = W(L − x)/L','RR = Wx/L');assumptions.push('Two vertical simple supports and one static point load. This beam idealization does not solve arch thrust, internal stresses, capacity or dynamic loading.');
 }else return {ready:false,missing:[],metrics,equations,assumptions};
 return {ready:true,missing,metrics,equations,assumptions};
}
export function parseWorldQuestion(text,current){
 let s=validateWorldScience(current),recognized=false;const t=text.toLowerCase();
 if(/drag|aerodynamic|\bcar\b|\bvehicle\b|\bkm\s*\/\s*h/.test(t)){s.kind='vehicle';s.calculator='drag';recognized=true;}
 else if(/slid|friction|\bmu\b|μ/.test(t)&&!(s.kind==='vehicle'&&!/slid|incline|tilt/.test(t))){s.kind='surface';s.calculator='incline';recognized=true;}
 else if(/support reaction|bridge.*load|load.*bridge/.test(t)){s.kind='bridge';s.calculator='bridge_load';recognized=true;}
 const patterns={speed:/(\d+(?:\.\d+)?)\s*(km\s*\/\s*h|kmh|kph|m\s*\/\s*s)/i,dragCoefficient:/(?:\bcd\b|drag coefficient)\s*(?:is|of|=|:)?\s*(\d*\.?\d+)/i,frontalArea:/(?:frontal\s+)?area\s*(?:is|of|=|:)?\s*(\d*\.?\d+)\s*(?:m²|m2|square met)/i,airDensity:/(?:air\s+)?density\s*(?:is|of|=|:)?\s*(\d*\.?\d+)/i,mass:/(?:mass\s*(?:is|of|=|:)?\s*)?(\d*\.?\d+)\s*kg\b/i,rollingCoefficient:/(?:crr|rolling (?:resistance )?coefficient)\s*(?:is|of|=|:)?\s*(\d*\.?\d+)/i,muStatic:/(?:μs?|mu(?:static)?|(?:static )?friction(?: coefficient)?)\s*(?:is|of|=|:)?\s*(\d*\.?\d+)/i,muKinetic:/(?:μk|mukinetic|kinetic friction(?: coefficient)?)\s*(?:is|of|=|:)?\s*(\d*\.?\d+)/i,angle:/(?:angle\s*(?:is|of|=|:)?\s*)?(\d*\.?\d+)\s*(?:deg|degrees|°)/i,span:/(?:span|support separation)\s*(?:is|of|=|:)?\s*(\d*\.?\d+)\s*m\b/i,load:/(?:load)\s*(?:is|of|=|:)?\s*(\d*\.?\d+)\s*(kN|N)\b/i,position:/(?:position|distance from left|from the left)\s*(?:is|of|=|:)?\s*(\d*\.?\d+)\s*m\b/i};
 for(const [name,pattern]of Object.entries(patterns)){if(name==='muStatic'&&s.calculator!=='incline')continue;const m=text.match(pattern);if(!m)continue;let value=Number(m[1]);if(name==='speed'&&/^m/i.test(m[2]))value*=3.6;if(name==='load'&&m[2].toLowerCase()==='kn')value*=1000;s.inputs=s.inputs.filter(p=>p.name!==name);s.inputs.push({name,value,unit:worldQuantities[name].unit,origin:'provided'});recognized=true;}
 if(recognized&&s.explanation==='Illustrative reconstruction of the visible object.')s.explanation=({drag:'Aerodynamic drag depends on air-relative speed, density, Cd and frontal area. Enter the supplied values to calculate.',incline:'An initially resting object begins sliding when the slope exceeds its static-friction threshold.',bridge_load:'Calculate two vertical support reactions under a specified point load using a simple beam idealization.'})[s.calculator]||s.explanation;return {recognized,science:prepareWorldScience(s)};
}
export const worldMetricLabels={drag:['Aerodynamic drag','N'],dragPower:['Power against drag','W'],rollingResistance:['Rolling resistance','N'],totalResistance:['Combined resistance','N'],criticalAngle:['Critical slide angle','°'],slides:['Slides at this angle',''],normal:['Normal force','N'],downSlope:['Down-slope weight','N'],acceleration:['Sliding acceleration','m/s²'],leftReaction:['Left reaction','N'],rightReaction:['Right reaction','N']};
