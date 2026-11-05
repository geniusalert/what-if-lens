import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.mjs';
import {sampleIR} from '../src/compiler.js';

test('Vercel rewrite reaches the API and reports configuration without credentials',async()=>{
 const response=await handler.fetch(new Request('https://lens.test/api?__lens_path=status'));
 assert.equal(response.status,200);
 const value=await response.json();assert.equal(typeof value.meta,'boolean');
 assert.deepEqual(Object.keys(value).sort(),['meta','model','openrouter','vision']);
 assert.equal(response.headers.get('Cache-Control'),'no-store');
});
test('Vercel forwards JSON POST bodies to scientific validation',async()=>{
 const ir=sampleIR('quadratic');
 const response=await handler.fetch(new Request('https://lens.test/api?__lens_path=validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ir})}));
 assert.equal(response.status,200);const result=await response.json();
 assert.equal(result.valid,true);assert.equal(result.ir.template,'quadratic');
 const invalid=await handler.fetch(new Request('https://lens.test/api?__lens_path=..%2F.env'));
 assert.equal(invalid.status,400);
});
