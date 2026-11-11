import {applyScientificPatch,solveIR,inverseExperiment} from './compiler.js';
export function changeXRModel(ir,instruction){
 const text=instruction.trim().toLowerCase();
 if(ir.template==='circuit'&&/^(open|close) (?:the )?(?:switch|circuit)$/.test(text))return applyScientificPatch(ir,{intent:'set_switch',value:text.startsWith('close')});
 const names={angle:'angle',speed:'speed',mass:'mass',voltage:'voltage',gravity:'g',a:'a',b:'b',c:'c'};
 const match=text.match(/^(?:(double|halve|increase|decrease) (?:the )?(angle|speed|mass|voltage|gravity|a|b|c)(?: by (\d+(?:\.\d+)?))?|(set|change) (?:the )?(angle|speed|mass|voltage|gravity|a|b|c) (?:to )?(-?\d+(?:\.\d+)?)(?: (deg|degrees|kg|v|volts|m\/s|m\/s2))?)$/);
 if(!match)throw Error('Try “set angle to 60”, “halve speed”, or “increase mass by 1”. Other instructions will not change the model.');
 const key=names[match[2]||match[5]],p=ir.parameters[key];if(!p)throw Error('This chapter has no '+(match[2]||match[5])+' parameter.');
 const unit=match[7],allowed={deg:['deg','degrees'],kg:['kg'],V:['v','volts'],'m/s':['m/s'],'m/s2':['m/s2'],'1':[]};if(unit&&!allowed[p.unit]?.includes(unit))throw Error('Use '+p.unit+' for this parameter.');
 const op=match[1];if(['double','halve'].includes(op)&&match[3])throw Error('Use double/halve without an amount.');
 const amount=match[3]===undefined?5:Number(match[3]);const value=match[6]!==undefined?Number(match[6]):op==='double'?p.value*2:op==='halve'?p.value/2:p.value+(op==='increase'?amount:-amount);
 return applyScientificPatch(ir,{intent:'set_parameter',property:key,value,unit:p.unit});
}
export function xrMetricText(ir){const r=solveIR(ir),format=n=>Number(n.toFixed(2));return Object.entries(r.metrics).filter(([,v])=>typeof v==='number'&&Number.isFinite(v)).slice(0,3).map(([k,v])=>k+': '+format(v)).join(' · ');}

export function solveXRGoal(ir,text){const normalized=text.trim().toLowerCase();const goal=/^(make it |make the block |)stop sliding$/.test(normalized)?'stop_sliding':/^double (the )?range$/.test(normalized)?'double_range':/^(halve (the )?current|half current)$/.test(normalized)?'half_current':null;return goal?inverseExperiment(ir,goal):null;}
