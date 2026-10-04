import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch(),errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4189/?intro=skip');
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
 await page.keyboard.press('End');
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='released');
 await page.emulateMedia({reducedMotion:'no-preference'});
 const settle=async()=>{
  await page.waitForFunction(()=>document.querySelector('.home-story')?.dataset.homeScrolling==='true');
  await page.waitForFunction(()=>!document.querySelector('.home-story')?.dataset.homeScrolling);
 };
 const visible=async selector=>{
  const box=await page.locator(selector).boundingBox();
  const header=await page.locator('.site-navigation').boundingBox();
  assert(box.y>=header.height-2,`${selector} clears fixed header`);
  assert(box.y+box.height<=1000,`${selector} fits the reading frame`);
 };
 // A stream of momentum events must not jump from the graph to the solution.
 await page.mouse.move(700,400);
 for(let i=0;i<8;i++)await page.mouse.wheel(0,90);
 await settle();
 await visible('.hs-plateau-layout');
 assert((await page.locator('.hs-solution').boundingBox()).y>500);
 results.push('One desktop wheel gesture stops at the full plateau graph, including trackpad momentum.');
 await page.keyboard.press('PageDown');await settle();
 await visible('.hs-solution-layout');
 await page.keyboard.press('PageDown');await settle();
 await visible('.hpo-device');
 await page.keyboard.press('PageUp');await settle();
 await visible('.hs-solution-layout');
 results.push('PageDown / PageUp move between Remi and the full phone overview.');
 await page.mouse.wheel(0,-120);await settle();await visible('.hs-plateau-layout');
 await page.mouse.wheel(0,-120);await settle();
 assert(Math.abs(await page.evaluate(()=>scrollY-document.querySelector('#next-content').offsetTop))<3);
 results.push('Reverse scrolling returns through each section to the survey.');
 await page.mouse.wheel(0,120);
 await page.waitForFunction(()=>document.querySelector('.home-story').dataset.homeScrolling==='true');
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('.home-story').getAttribute('data-home-scrolling'),null);
 results.push('Escape cancels automatic travel.');

 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:1024,height:740});
 await page.locator('#next-content').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.mouse.wheel(0,100);await settle();
 assert((await page.locator('.hs-plateau-layout').boundingBox()).y<140);
 results.push('Reduced motion uses immediate alignment after the compact survey.');

 await page.setViewportSize({width:390,height:844});
 await page.locator('#next-content').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
 const mobileY=await page.evaluate(()=>scrollY);
 await page.mouse.wheel(0,120);
 await page.waitForFunction(y=>scrollY>y,mobileY);
 assert.equal(await page.locator('.home-story').getAttribute('data-home-scrolling'),null);
 assert(Math.abs(await page.evaluate(()=>scrollY)-mobileY-120)<3);
 results.push('Mobile keeps native scrolling for long content.');
 await page.locator('.hs-support-description a').click();
 await page.waitForURL('**/remi-ai/');
 assert.equal(await page.locator('.home-story').count(),0);
 await page.mouse.wheel(0,120);
 results.push('Detail navigation unmounts the home scroll controller.');
}finally{await browser.close();}
assert.deepEqual(errors,[]);
await writeFile(new URL('../reports/figma-legacy/home-phone/scroll-stops-checks.json',import.meta.url),JSON.stringify({results,errors},null,2));
console.log(results.map(result=>'PASS: '+result).join('\n'));
