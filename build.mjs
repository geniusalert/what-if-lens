import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
const files=['index.html','style.css','app.js','science.js'];
const assets=Object.fromEntries(await Promise.all(files.map(async f=>['/'+(f==='index.html'?'':f),await readFile('src/'+f,'utf8')])));
const backend=(await readFile('src/backend.js','utf8')).replace(/^import .*?;\r?\n/,'');
const science=await readFile('src/science.js','utf8');
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await writeFile('dist/server/index.js',`const assets=${JSON.stringify(assets)};\n${science}\n${backend}`);
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built What-If Lens worker and embedded assets.');
