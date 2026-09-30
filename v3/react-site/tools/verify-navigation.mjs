import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const ready=()=>page.waitForSelector('[data-ready="true"]');
const geometry=()=>page.locator('nav[aria-label="주요 메뉴"] a.text').evaluateAll(links=>links.map(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {text:el.textContent,href:el.getAttribute('href'),x:r.x,y:r.y,width:r.width,height:r.height,font:s.fontFamily,size:s.fontSize,color:s.color};}));
try{
 await page.goto('http://127.0.0.1:4187/?ui=original');await ready();const original=await geometry();
 await page.goto('http://127.0.0.1:4187/');await ready();assert.deepEqual(await geometry(),original);
 const nav=page.locator('nav[data-smoothui]');assert.equal(await nav.locator('a.smooth-nav-link').count(),5);assert.equal(await nav.locator('[data-nav-indicator]').count(),1);
 await nav.locator('a[href="/ai/"]').hover();await page.waitForTimeout(400);assert.equal(await nav.locator('.smooth-nav-hover').count(),1);
 await nav.screenshot({path:'reports/navigation-hover.png'});
 await nav.locator('a[href="/ai/"]').click();await page.waitForURL('**/ai/');await ready();await page.mouse.move(50,300);await page.waitForTimeout(500);
 assert.equal(await page.locator('nav a[aria-current="page"]').getAttribute('href'),'/ai/');
 const indicator=await page.locator('[data-nav-indicator]').boundingBox(),active=await page.locator('nav a[aria-current="page"]').boundingBox();assert(Math.abs(indicator.x-active.x)<1);assert(Math.abs(indicator.width-active.width)<1);
 await page.locator('nav a[aria-current="page"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'/game/');assert.equal(new URL(page.url()).pathname,'/ai/');
 await page.keyboard.press('Enter');await page.waitForURL('**/game/');await ready();await page.goBack();await ready();assert.equal(await page.locator('nav a[aria-current="page"]').getAttribute('href'),'/ai/');
 await page.goto('http://127.0.0.1:4187/characters-c/');await ready();assert.equal(await page.locator('nav a[aria-current="page"]').getAttribute('href'),'/characters/');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4187/');await ready();const before=await geometry();await page.locator('nav a[href="/video/"]').hover();await page.waitForTimeout(200);assert.deepEqual(await geometry(),before);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto('http://127.0.0.1:4187/?experience=scroll&intro=skip');await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');assert.equal(await page.locator('nav[data-smoothui]').count(),0);
 assert.deepEqual(errors,[]);await fs.writeFile('reports/navigation-verification.json',JSON.stringify({passed:true,original,checks:['unchanged labels geometry fonts colors','five real page links','hover','active indicator alignment','keyboard focus without navigation','Enter navigation','back','variant route selection','reduced motion','mobile overflow','motion study unchanged'],errors},null,2));console.log('SmoothUI navigation checks passed.');
}finally{await browser.close();}
