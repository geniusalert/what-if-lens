import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import worker from './src/backend.js';
if(existsSync('.env'))process.loadEnvFile('.env');
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith('/api/')){
  const f={'/':'index.html','/style.css':'style.css','/lens.css':'lens.css','/app.js':'app.js','/science.js':'science.js','/studio.js':'studio.js','/xr-emulator.bundle.js':'xr-emulator.bundle.js','/lab3d.bundle.js':'lab3d.bundle.js'}[url.pathname];
  if(!f){res.writeHead(404);return res.end('Not found');}
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'text/javascript');return res.end(await readFile('src/'+f));
 }
 const chunks=[];for await(const c of req){chunks.push(c);if(chunks.reduce((s,b)=>s+b.length,0)>8e6)throw Error('File too large');}
 const r=await worker.fetch(new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}),process.env);
 res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());
}catch{res.writeHead(500);res.end('Request could not be completed');}});
const port=Number(process.env.PORT)||4173;
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Close the other local server or set PORT to another number.`:'Local server could not start.');process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
