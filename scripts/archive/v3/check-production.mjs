import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const base='https://spotme-site.vercel.app',pages=JSON.parse(await fs.readFile('designs/pages.json'));
const hash=b=>createHash('sha256').update(b).digest('hex'),failures=[],routes=[];
for(const p of pages){
 const response=await fetch(base+p.url),bytes=Buffer.from(await response.arrayBuffer()),local=await fs.readFile('public'+p.url+'index.html');
 const same=hash(bytes)===hash(local);routes.push({route:p.url,status:response.status,exactLocalHtml:same});
 if(!response.ok||!same)failures.push('HTML mismatch '+p.url);
}
const browser=await chromium.launch(),screens=[];
for(const route of ['/','/ai/','/game/','/characters/','/video/']){
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+route,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 const state=await page.evaluate(()=>({frame:document.body.dataset.frame,images:document.images.length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),menu:[...document.querySelectorAll('nav .text')].map(a=>a.textContent)}));
 screens.push({route,...state,errors});if(state.broken.length||errors.length||state.menu.length!==5)failures.push('Browser check '+route);
 if(route==='/')await page.screenshot({path:'reports/production-home.png'});await page.close();
}
await browser.close();await fs.writeFile('reports/production.json',JSON.stringify({checkedAt:new Date().toISOString(),base,routes,screens,failures},null,2));
console.log(JSON.stringify({base,routes,screens,failures},null,2));process.exitCode=failures.length?1:0;
