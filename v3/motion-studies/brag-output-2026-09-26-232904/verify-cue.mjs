import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const cards=()=>page.locator('.cue-card').evaluateAll(els=>els.map(el=>({y:gsap.getProperty(el,'y'),opacity:Number(getComputedStyle(el).opacity)})));
try{
 await page.goto('http://127.0.0.1:4186/brag-output-2026-09-26-232904/web/?intro=skip');await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
 const samples=[];
 for(const time of [.1,.3,.5,.7,.9]){
   await page.evaluate(time=>{gsap.globalTimeline.getChildren().find(t=>t.repeat()===-1).pause().totalTime(time);},time);samples.push({time,cards:await cards()});
 }
 assert(samples[0].cards[0].opacity>samples[0].cards[1].opacity);
 for(let i=1;i<samples.length;i++)for(let c=0;c<3;c++)assert(samples[i].cards[c].y>=samples[i-1].cards[c].y);
 await page.evaluate(()=>{gsap.globalTimeline.getChildren().find(t=>t.repeat()===-1).totalTime(6.2).play();});
 const ongoing=await cards();await page.waitForTimeout(180);assert.notDeepEqual(await cards(),ongoing);
 await page.mouse.move(700,400);await page.mouse.wheel(0,120);await page.waitForTimeout(300);const stopped=await cards();await page.waitForTimeout(250);assert.deepEqual(await cards(),stopped);assert(stopped.every(c=>c.y===0));
 await page.evaluate(()=>SCROLL_STUDY.reset());await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);const reduced=await cards();await page.waitForTimeout(250);assert.deepEqual(await cards(),reduced);assert(reduced.every(c=>c.y===0));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);assert.notDeepEqual(await cards(),reduced);
 assert.deepEqual(errors,[]);await fs.writeFile('reports/cue-verification.json',JSON.stringify({passed:true,samples,stopped,reduced,errors},null,2));console.log('Cue passed: downward stagger, repeat, stop on input, reduced-motion and resume.');
}finally{await browser.close();}
