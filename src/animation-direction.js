// Presentation is deterministic and independent of the physics solver.
export const smoothstep=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function actorKind(node){const name=(node.id+' '+node.label).toLowerCase();if(node.primitive==='torus')return 'pulley';if(['line','arrow','text'].includes(node.primitive))return node.primitive;if(/car body|vehicle|automobile/.test(name))return 'car';if(/arch bridge|bridge span/.test(name))return 'bridge';if(/lamp|bulb/.test(name))return 'lamp';if(/battery|cell|voltage.source/.test(name))return 'battery';if(/resistor|resistance/.test(name))return 'resistor';return node.primitive;}
export function createDirection(graph){
 const moving=graph.objects.filter(n=>n.motion.type!=='none'&&!['arrow','text'].includes(n.primitive));
 const period=Math.max(2,...moving.map(n=>n.motion.period)),duration=2.4+Math.min(20,period*2)+2;
 const continuous=['bridge','vehicle','surface'].includes(graph.science?.kind);
 const hasFlow=moving.some(n=>n.motion.type==='flow');
 const subjects=moving.filter(n=>!['line','torus'].includes(n.primitive)).slice(0,2).map(n=>n.label||n.id);
 return {duration,period,subjects,frame(time){const t=((time%duration)+duration)%duration,setup=(continuous?time:t)<2.4,review=!continuous&&t>duration-2;
  return {time:continuous?Math.max(0,time):t,motionTime:continuous?Math.max(0,time-2.4):Math.max(0,Math.min(t-2.4,duration-4.4)),phase:setup?'Build the scene':review?'Explore a what-if':'Follow the motion',caption:setup?graph.title:review?'Pause, orbit or change a parameter.':hasFlow?'Follow the highlighted flow through the connected path.':subjects.length?'Watch '+subjects.join(' and ')+' move together.':'Follow the highlighted movement.',progress:t/duration};},
  reveal(node,index,time){const rank=['line','arrow','text'].includes(node.primitive)?1.1:0;return smoothstep((time-rank-Math.min(index,8)*.045)/.65);}
 };
}
