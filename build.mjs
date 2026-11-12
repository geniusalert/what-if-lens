import {readFile,mkdir,copyFile,writeFile,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
const bundled=await build({entryPoints:{'lab3d.bundle':'src/lab3d.js','xr-runtime.bundle':'src/xr-runtime.js','xr-emulator.bundle':'src/xr-emulator.js'},bundle:true,splitting:true,format:'esm',minify:true,outdir:'src',chunkNames:'lens-shared-[hash]',target:'es2022',metafile:true,loader:{'.wasm':'binary'},legalComments:'eof'});
const generatedFiles=Object.keys(bundled.metafile.outputs).map(path=>path.split(/[\\/]/).at(-1));
const files=[...generatedFiles,'index.html','style.css','lens.css','app.js','science.js','studio.js'];
await mkdir('src/handtracking',{recursive:true});
for(const file of await readdir('node_modules/@mediapipe/tasks-vision/wasm'))await copyFile('node_modules/@mediapipe/tasks-vision/wasm/'+file,'src/handtracking/'+file);
const handFiles=(await readdir('src/handtracking')).map(f=>'handtracking/'+f);
const assets={};for(const f of [...files,...handFiles]){const binary=f.endsWith('.wasm')||f.endsWith('.task');const data=await readFile('src/'+f);assets['/'+(f==='index.html'?'':f)]=binary?{base64:data.toString('base64'),mime:f.endsWith('.wasm')?'application/wasm':'application/octet-stream'}:data.toString('utf8');}
await mkdir('dist/public/handtracking',{recursive:true});
await Promise.all([...files,...handFiles].map(f=>copyFile('src/'+f,'dist/public/'+f)));
if(!process.argv.includes('--vercel')){
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await writeFile('src/assets.generated.js','export default '+JSON.stringify(assets)+';');
await build({entryPoints:['src/worker-entry.js'],bundle:true,format:'esm',outfile:'dist/server/index.js',target:'es2022',platform:'browser',minify:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');console.log('Built scientific compiler, Three.js lab and Worker API.');
}else console.log('Built Vercel frontend; API is served by api/index.mjs.');
