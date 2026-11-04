import {performance} from 'node:perf_hooks';import {mkdir,writeFile} from 'node:fs/promises';
import {sampleIR,solveIR,frameState} from '../src/compiler.js';
const report={observedAt:new Date().toISOString(),runtime:process.version,description:'Local CPU measurements; excludes network inference, GPU rendering and cold start.',modules:{}};
for(const name of ['incline','surface','circuit','projectile']){const samples=[],ir=sampleIR(name);for(let i=0;i<50;i++){const start=performance.now();solveIR(ir);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);const run=solveIR(ir),start=performance.now();for(let i=0;i<1000;i++)frameState(run,i/1000*run.duration);report.modules[name]={solveMedianMs:samples[25],solveP95Ms:samples[47],frameMeanMs:(performance.now()-start)/1000};}
await mkdir('evidence',{recursive:true});await writeFile('evidence/benchmark.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
