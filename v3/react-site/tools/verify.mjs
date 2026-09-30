import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..'),pages=JSON.parse(await fs.readFile(path.join(root,'src/generated/pages.json'))),report={routes:[],errors:[],motion:[]};
await fs.mkdir(path.join(root,'reports'),{recursive:true});
const browser=await chromium.launch({headless:true});
const inspect=page=>page.evaluate(()=>({text:[...document.querySelectorAll('main .text')].map(el=>{const r=el.getBoundingClientRect();return [el.dataset.sourceNodeId,el.textContent,r.x,r.y,r.width,r.height,getComputedStyle(el).fontSize];}),assets:[...document.querySelectorAll('main img')].map(i=>[new URL(i.src).pathname,i.naturalWidth]),nav:[...document.querySelectorAll('nav .text')].map(el=>[el.textContent,el.getAttribute('href')])}));
try{
 for(const route of Object.keys(pages)){
  const original=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),react=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  react.on('pageerror',e=>report.errors.push(String(e)));react.on('console',msg=>{if(msg.type()==='error')report.errors.push(msg.text());});
  await original.goto('http://127.0.0.1:4190'+route);await original.evaluate(()=>document.fonts.ready);
  await react.goto('http://127.0.0.1:4187'+route);await react.waitForSelector('[data-ready="true"]');
  await Promise.all([original,react].map(p=>p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())))));
  await original.locator('.opening-picker').evaluateAll(els=>els.forEach(el=>el.remove()));
  assert.deepEqual(await inspect(react),await inspect(original),route+' structure');
  const a=await sharp(await original.screenshot()).raw().toBuffer(),b=await sharp(await react.screenshot()).raw().toBuffer();let changed=0,total=0;
  for(let i=0;i<a.length;i+=3){let differs=false;for(let c=0;c<3;c++){const d=Math.abs(a[i+c]-b[i+c]);total+=d;if(d)differs=true;}if(differs)changed++;}
  const mismatch=changed/(1920*1080);assert(mismatch<.005,route+' pixel mismatch '+mismatch);
  report.routes.push({route,structuralMatch:true,changedPixels:changed,mismatch,meanChannelDelta:total/a.length});
  if(route==='/')await react.screenshot({path:path.join(root,'reports/react-home.png')});
  await original.close();await react.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',msg=>{if(msg.type()==='error')report.errors.push(msg.text());});
 await page.goto('http://127.0.0.1:4187/');await page.waitForSelector('[data-ready="true"]');
 await page.locator('nav a').filter({hasText:'AI 운동 서포트'}).click();await page.waitForURL('**/ai/');await page.waitForSelector('[data-ready="true"]');
 await page.goBack();await page.waitForSelector('[data-react-page="/"][data-ready="true"]');report.navigation=true;
 for(let i=0;i<2;i++){
  await page.goto('http://127.0.0.1:4187/?experience=scroll&intro=skip');await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
  assert.equal(await page.locator('#scroll-cue').count(),1);assert.equal(await page.locator('#standing-remi').count(),1);
  await page.locator('#scroll-cue').click();await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),.25);
  await page.click('#skip-charge');await page.waitForFunction(()=>SCROLL_STUDY.state==='released');
  await page.screenshot({path:path.join(root,'reports/react-motion-next.png')});
  await page.locator('#study-tools a').click();await page.waitForURL('**/lab/');
  assert.equal(await page.evaluate(()=>document.body.classList.contains('pinned')),false);assert.equal(await page.locator('#scroll-cue').count(),0);
  await page.getByRole('link',{name:'React 사이트',exact:true}).click();await page.waitForSelector('[data-ready="true"]');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).overflowY),'visible');report.motion.push({cycle:i+1,charge:true,transition:true,cleanup:true});
 }
 for(const variant of ['a','b']){
  await page.goto('http://127.0.0.1:4187/?experience=scroll&variant='+variant);await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
  assert.equal(await page.locator('#black').evaluate(el=>Number(getComputedStyle(el).opacity)),0);report.motion.push({variant,openingFinished:true});
  await page.locator('#study-tools a').click();await page.waitForURL('**/lab/');
 }
 await page.goto('http://127.0.0.1:4188/ai/');await page.waitForSelector('[data-ready="true"]');report.productionDeepLink=true;
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));report.mobileOverflow=false;
 assert.deepEqual(report.errors,[]);report.passed=true;await fs.writeFile(path.join(root,'reports/verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
