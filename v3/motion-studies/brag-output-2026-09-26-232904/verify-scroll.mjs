import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true}),report={checks:[],errors:[]};
const page=await browser.newPage({viewport:{width:1920,height:1080}});
page.on('pageerror',e=>report.errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
const phase=value=>page.waitForFunction(value=>window.SCROLL_STUDY?.state===value,value);
const wait=()=>page.waitForTimeout(260);
try{
 await page.goto('http://127.0.0.1:4186/brag-output-2026-09-26-232904/web/?intro=skip');await phase('charging');
 assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),0);assert.equal(await page.locator('#scroll-cue .cue-card').count(),3);
 await page.screenshot({path:'reports/scroll-idle.png'});report.checks.push('home ready and three triangle cards');
 await page.mouse.move(1000,500);await page.mouse.wheel(0,500);await wait();
 assert.equal(await page.evaluate(()=>scrollY),0);assert((await page.evaluate(()=>SCROLL_STUDY.progress))>0);report.checks.push('wheel charges while home stays pinned');
 const before=await page.evaluate(()=>SCROLL_STUDY.progress);await page.mouse.wheel(0,-120);await wait();assert((await page.evaluate(()=>SCROLL_STUDY.progress))<before);report.checks.push('upward scroll discharges');
 await page.evaluate(()=>SCROLL_STUDY.reset());await page.locator('#scroll-cue').click();await wait();await page.locator('#scroll-cue').click();await wait();
 assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),.5);
 assert.equal(await page.locator('#charge-level').getAttribute('height'),'198');await page.screenshot({path:'reports/scroll-half.png'});report.checks.push('triangle click alternative and half fill');
 await page.keyboard.press('Tab');await page.locator('#skip-charge').click();await phase('holding');
 assert.equal(await page.evaluate(()=>scrollY),0);await page.screenshot({path:'reports/scroll-standing.png'});
 assert.equal(await page.locator('#standing-remi').evaluate(el=>Number(getComputedStyle(el).opacity)),1);
 await phase('released');const events=await page.evaluate(()=>SCROLL_STUDY.events);const held=events.findLast(e=>e.state==='holding'),moving=events.findLast(e=>e.state==='moving');report.holdMilliseconds=moving.time-held.time;assert(report.holdMilliseconds>=475&&report.holdMilliseconds<700);
 assert(Math.abs(await page.evaluate(()=>scrollY-document.querySelector('#next-content').offsetTop))<2);await page.screenshot({path:'reports/scroll-next.png'});report.checks.push('stand then 0.5s hold then next section');
 await page.evaluate(()=>scrollTo(0,0));await phase('charging');assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),0);report.checks.push('return to top resets charge');
 await page.locator('body').click({position:{x:50,y:200}});await page.keyboard.press('ArrowDown');await wait();assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),.18);report.checks.push('keyboard charging');
 await page.setViewportSize({width:1440,height:900});await wait();assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),.18);assert.equal(await page.locator('#home .canvas').evaluate(el=>getComputedStyle(el).transform),'matrix(1, 0, 0, 1, 0, 0)');report.checks.push('resize preserves charge and clears shake');
 await page.click('#restart');await phase('opening');await phase('charging');report.checks.push('intro to interactive home');
 await page.keyboard.press('Escape');await phase('released');report.checks.push('escape bypass');
 await page.emulateMedia({reducedMotion:'reduce'});await page.click('#restart');await phase('charging');await page.locator('#scroll-cue').click();await wait();
 assert.equal(await page.locator('#home .canvas').evaluate(el=>getComputedStyle(el).transform),'matrix(1, 0, 0, 1, 0, 0)');assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),.25);report.checks.push('reduced motion skips intro and strain');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'reports/scroll-mobile.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));report.checks.push('mobile no horizontal overflow');
 // Touch gesture triggers the same charge model without moving the document.
 const prev=await page.evaluate(()=>SCROLL_STUDY.progress);
 await page.locator('#hero-scroll').evaluate(el=>{const fire=(type,y)=>el.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:[new Touch({identifier:1,target:el,clientX:180,clientY:y})]}));fire('touchstart',600);fire('touchmove',460);el.dispatchEvent(new TouchEvent('touchcancel',{bubbles:true}));});
 assert((await page.evaluate(()=>SCROLL_STUDY.progress))>prev);assert.equal(await page.evaluate(()=>scrollY),0);report.checks.push('touch charges and cancel clears gesture');
 assert.deepEqual(report.errors,[]);report.passed=true;await fs.writeFile('reports/scroll-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
