import {readFile,mkdir,copyFile,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
await build({entryPoints:['src/lab3d.js'],bundle:true,format:'esm',minify:true,outfile:'src/lab3d.bundle.js',target:'es2022',legalComments:'eof'});
const files=['index.html','style.css','lens.css','app.js','science.js','studio.js','lab3d.bundle.js'];
const assets=Object.fromEntries(await Promise.all(files.map(async f=>['/'+(f==='index.html'?'':f),await readFile('src/'+f,'utf8')])));
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await writeFile('src/assets.generated.js','export default '+JSON.stringify(assets)+';');
await build({entryPoints:['src/worker-entry.js'],bundle:true,format:'esm',outfile:'dist/server/index.js',target:'es2022',platform:'browser',minify:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');console.log('Built scientific compiler, Three.js lab and Worker API.');
