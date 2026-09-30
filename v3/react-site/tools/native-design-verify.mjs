import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const root=path.resolve(import.meta.dirname,'..'),exec=promisify(execFile),pages=JSON.parse(await fs.readFile(path.resolve(root,'../designs/pages.json'))),out=path.join(root,'reports/mimikyu/native');let current='/';
await fs.mkdir(out,{recursive:true});
const server=http.createServer((req,res)=>{const proxy=http.request({hostname:'127.0.0.1',port:4187,path:req.url==='/'?current:req.url,method:req.method},r=>{
 if(req.url==='/'){
  // Native verifier always opens /. Unlike static HTML, React selects content by
  // location.pathname; establish the requested route before its module loads.
  const chunks=[];r.on('data',b=>chunks.push(b));r.on('end',()=>{const html=Buffer.concat(chunks).toString().replace('<head>',`<head><script>history.replaceState(null,'',${JSON.stringify(current)});</script>`);res.writeHead(r.statusCode,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
 }else{res.writeHead(r.statusCode,r.headers);r.pipe(res);}
});proxy.on('error',()=>res.writeHead(502).end());req.pipe(proxy);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const summary=[];
try{for(const spec of pages){current=spec.url;let result;try{result=await exec(process.execPath,['C:/Users/PC-CA/.mimikyu/node_modules/tsx/dist/cli.mjs','C:/Users/PC-CA/.mimikyu/scripts/verify.ts',path.resolve(root,'../designs/figma-data.json'),'--port',String(server.address().port),'--node-id',spec.frameId,'--viewport-width','1920','--viewport-height','1080'],{maxBuffer:8e6});result.code=0;}catch(e){result=e;}
const text=result.stdout+result.stderr;await fs.writeFile(path.join(out,spec.slug+'.txt'),text);summary.push({page:spec.slug,exitCode:result.code,summary:text.split('\n').find(l=>l.includes('Structural Verify'))});console.log(summary.at(-1));
}}finally{server.close();}
await fs.writeFile(path.join(out,'summary.json'),JSON.stringify(summary,null,2));
