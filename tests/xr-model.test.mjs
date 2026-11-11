import test from 'node:test';import assert from 'node:assert/strict';
import {changeXRModel} from '../src/xr-model.js';import {sampleIR,solveIR} from '../src/compiler.js';
test('XR commands halve speed correctly and preserve the baseline',()=>{const original=sampleIR('projectile'),next=changeXRModel(original,'halve speed');assert.equal(next.parameters.speed.value,10);assert.equal(original.parameters.speed.value,20);assert.equal(solveIR(next).metrics.range,solveIR(original).metrics.range/4);});
test('XR commands reject ambiguous instructions, units and unsafe ranges',()=>{const s=sampleIR('projectile');for(const t of ['do not double speed','speed please','set speed to 40 kg','set angle to 100','double speed by 2','set speed to 2 km/h'])assert.throws(()=>changeXRModel(s,t));assert.equal(changeXRModel(s,'set angle to 60 degrees').parameters.angle.value,60);});
test('mass changes force without changing ideal incline acceleration',()=>{const a=sampleIR('incline'),b=changeXRModel(a,'double mass');assert.equal(solveIR(a).metrics.acceleration,solveIR(b).metrics.acceleration);assert.equal(solveIR(b).metrics.normal,solveIR(a).metrics.normal*2);});
test('spatial circuit switch actually stops current',()=>{assert.equal(solveIR(changeXRModel(sampleIR('circuit'),'open switch')).metrics.current,0);});

import {pinchState,boundExperimentScale} from '../src/xr-input.js';
test('hand pinch hysteresis rejects jitter and missing joints; scale remains bounded',()=>{assert.equal(pinchState(false,.025),false);assert.equal(pinchState(false,.02),true);assert.equal(pinchState(true,.03),true);assert.equal(pinchState(true,.04),false);assert.equal(pinchState(true,NaN),false);assert.equal(boundExperimentScale(100),2);assert.equal(boundExperimentScale(.0001),.025);});
