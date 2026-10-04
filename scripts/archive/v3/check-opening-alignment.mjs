import fs from 'node:fs/promises';import {chromium} from 'playwright';
const browser=await chromium.launch(),results=[];
for(const width of [1440,1920,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4184/?opening=type');await page.waitForSelector('.opening-remi',{state:'attached'});
 await page.waitForTimeout(3150);
 const state=await page.evaluate(()=>{
  const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};
  const pairs=[['.opening-type','[data-source-node-id="205:3"]'],['.opening-remi','[data-source-node-id="254:244"]'],['.opening-remi img','[data-source-node-id="254:244"] img']].map(([a,b])=>({a,overlay:rect(a),home:rect(b)}));
  return{pairs,stroke:getComputedStyle(document.querySelector('.opening-type path')).strokeWidth,asset:document.querySelector('.opening-remi img').getAttribute('src'),opacity:getComputedStyle(document.querySelector('.opening-remi')).opacity,animatedTransforms:document.getAnimations().some(a=>a.effect.getKeyframes().some(k=>'transform' in k)),homeRect:rect('[data-source-node-id="254:244"]')};
 });
 await page.screenshot({path:`reports/opening/aligned-${width}.png`});
 await page.waitForFunction(()=>document.body.dataset.openingState==='done');
 const end=await page.evaluate(()=>{const b=document.querySelector('[data-source-node-id="254:244"]').getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height,animations:document.getAnimations().length,inert:document.querySelector('main').inert}});
 const delta=Math.max(...state.pairs.flatMap(p=>Object.keys(p.home).map(k=>Math.abs(p.home[k]-p.overlay[k]))));
 const drift=Math.max(...Object.keys(state.homeRect).map(k=>Math.abs(state.homeRect[k]-end[k])));
 results.push({width,delta,drift,state,end,errors,passed:delta<.1&&drift<.1&&!state.animatedTransforms&&!end.animations&&!end.inert&&!errors.length});await page.close();
}
await browser.close();await fs.writeFile('reports/opening/alignment.json',JSON.stringify(results,null,2));console.log(results.map(({width,delta,drift,passed,errors})=>({width,delta,drift,passed,errors})));process.exitCode=results.some(r=>!r.passed)?1:0;
