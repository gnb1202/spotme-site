import fs from 'node:fs/promises';import {chromium} from 'playwright';
const browser=await chromium.launch(),results=[];await fs.mkdir('reports/opening',{recursive:true});
for(const [mode,width,action] of [['type',1440,'finish'],['type',390,'finish'],['remi',1440,'removed'],['outline',1440,'removed'],['type',390,'skip'],['type',1440,'escape'],['type',1440,'resize'],['type',1440,'reduce']]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:action==='reduce'?'reduce':'no-preference'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4184/?opening='+mode);await page.evaluate(()=>document.fonts.ready);
 if(action==='finish'){
  await page.waitForTimeout(1200);await page.screenshot({path:`reports/opening/${mode}-${width}-type.png`});
  const early=await page.locator('.opening-remi').evaluate(el=>Number(getComputedStyle(el).opacity));if(early!==0)errors.push('Remi appeared before typography finished');
  await page.waitForTimeout(1750);await page.screenshot({path:`reports/opening/${mode}-${width}-remi.png`});
  const phase=await page.evaluate(()=>{const r=document.querySelector('.opening-remi'),t=document.querySelector('.opening-type'),b=r.getBoundingClientRect(),home=document.querySelector('[data-source-node-id="254:244"]').getBoundingClientRect();return{type:Number(getComputedStyle(t).opacity),complete:[...t.querySelectorAll('path')].every(p=>parseFloat(getComputedStyle(p).strokeDashoffset)===0),front:Number(getComputedStyle(r).zIndex)>Number(getComputedStyle(t).zIndex),asset:r.querySelector('img').getAttribute('src')==='/opening-remi.svg',aligned:['x','y','width','height'].every(k=>Math.abs(b[k]-home[k])<.1)}});if(phase.type!==1||!phase.complete||!phase.front||!phase.asset||!phase.aligned)errors.push('Invalid character over completed typography: '+JSON.stringify(phase));
  await page.waitForFunction(()=>document.body.dataset.openingState==='done');await page.screenshot({path:`reports/opening/${mode}-end.png`});
 }else if(action==='skip')await page.getByRole('button',{name:'건너뛰기'}).click();
 else if(action==='escape')await page.keyboard.press('Escape');
 else if(action==='resize'){await page.setViewportSize({width:1024,height:700});await page.waitForFunction(()=>document.body.dataset.openingState==='done');}
 const state=await page.evaluate(()=>({overlay:!!document.querySelector('.opening'),inert:document.querySelector('main').inert,overflow:getComputedStyle(document.documentElement).overflow,animations:document.getAnimations().length,hidden:getComputedStyle(document.querySelector('[data-source-node-id="205:3"] .ink')).visibility,scrollWidth:document.documentElement.scrollWidth,width:innerWidth}));
 if(await page.locator('.opening-picker a').count()!==1)errors.push('B/C still exposed');
 const passed=!errors.length&&!state.overlay&&!state.inert&&state.animations===0&&state.hidden==='visible'&&state.scrollWidth===state.width;
 results.push({mode,width,action,state,errors,passed});await page.close();
}
await browser.close();await fs.writeFile('reports/opening/check.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));process.exitCode=results.some(r=>!r.passed)?1:0;
