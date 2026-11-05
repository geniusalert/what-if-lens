// Explicit authored example for learning the presentation controls, never an AI fallback.
export function circuitAnimationExample(){
 const still={type:'none',axis:[0,0,0],amplitude:0,period:4,phase:0};
 const node=(id,label,primitive,position,size,color,motion=still,points=[])=>({id,label,primitive,position,size,color,motion,points,rotation:[0,0,0]});
 return {title:'Charge in motion',description:'Authored illustrative circuit. Follow the cyan charge markers from the battery, through the resistor and lamp, and back to the source.',assumptions:['Authored teaching example, not extracted from an image.','Particle spacing and brightness are illustrative, not measured charge or power.'],equations:['A closed path carries current.','V = I × R'],objects:[
 node('board','Experiment platform','box',[.5,.79,-.04],[.9,.055,.4],'slate'),
 node('battery','Battery','box',[.19,.44,0],[.16,.22,.15],'cyan'),
 node('resistor','Resistor','cylinder',[.5,.3,0],[.22,.09,.09],'amber'),
 node('lamp','Lamp','sphere',[.82,.44,0],[.19,.25,.17],'amber',{...still,type:'pulse',amplitude:.015}),
 node('wire','Current path','line',[0,0,0],[.004,.004,.004],'cyan',{...still,type:'flow',period:4},[[.19,.33,0],[.19,.3,0],[.39,.3,0],[.61,.3,0],[.82,.3,0],[.82,.57,0],[.82,.7,0],[.19,.7,0],[.19,.55,0]])
 ]};
}
