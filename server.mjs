import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import worker from './src/backend.js';
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost:4173');
 if(!url.pathname.startsWith('/api/')){
  const f={'/':'index.html','/style.css':'style.css','/app.js':'app.js','/science.js':'science.js','/studio.js':'studio.js'}[url.pathname];
  if(!f){res.writeHead(404);return res.end('Not found');}
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'text/javascript');return res.end(await readFile('src/'+f));
 }
 const chunks=[];for await(const c of req){chunks.push(c);if(chunks.reduce((s,b)=>s+b.length,0)>8e6)throw Error('File too large');}
 const r=await worker.fetch(new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}),process.env);
 res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());
}catch{res.writeHead(500);res.end('Request could not be completed');}});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://localhost:4173'));
