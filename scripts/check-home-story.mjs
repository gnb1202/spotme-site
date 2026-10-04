import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {exerciseMotives,remiSupportModes} from '../src/integration/home-story-data.js';

const report=new URL('../reports/figma-legacy/home-phone/',import.meta.url);
const assets=JSON.parse(await readFile(new URL('story-assets.json',report),'utf8'));
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
for(const asset of assets){
 assert.equal(hash(await readFile(new URL('../'+asset.source,import.meta.url))),asset.sourceSha256);
 assert.equal(hash(await readFile(new URL('../'+asset.output,import.meta.url))),asset.outputSha256);
}
const browser=await chromium.launch(),errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4189/?intro=skip');
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
 await page.keyboard.press('End');
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='released');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'next-content');
 assert.deepEqual(await page.locator('#next-content > section').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-labelledby'))),['home-pain-title','home-solution-title','home-overview-title']);
 assert((await page.locator('#home-pain-title').boundingBox()).y>100,'Opening lands at visible pain heading');
 results.push('Opening lands at pain section; pain, solution and overview follow in order.');
 assert.deepEqual(exerciseMotives.map(item=>item.value),[70,57.5,32.5,32.5,20,15,2.5],'Values transcribed from panel');
 assert.equal(await page.locator('.hs-bar-row').count(),4);
 assert.equal(await page.locator('.hs-survey button,.hs-survey-bottom,.hs-survey figcaption').count(),0);
 for(const [index,item] of exerciseMotives.slice(0,4).entries()){
  const row=page.locator('.hs-bar-row').nth(index);
  assert.equal(await row.locator('strong').textContent(),`${item.value}%`);
  const fraction=await row.locator('.hs-bar-space').evaluate(el=>el.firstElementChild.getBoundingClientRect().width/el.getBoundingClientRect().width*100);
  assert(Math.abs(fraction-item.value)<0.1,'Bar length follows the reported percentage');
 }
 for(const [index,item] of remiSupportModes.entries()){
  const button=page.locator('.hs-support-menu button').nth(index);
  await button.focus();await page.keyboard.press('Enter');
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.hs-remi-art img:visible').count(),1);
  assert.equal(await page.locator('.hs-remi-art img:visible').getAttribute('src'),`/home-story/${item.image}.webp`);
  assert.deepEqual(await page.locator('.hs-support-flow li').allTextContents(),item.steps);
  assert.equal(await page.locator('.hs-support-description a').getAttribute('href'),item.href);
 }
 await page.locator('.hs-support-menu button').first().click();
 results.push('Four survey percentages and bar lengths verified; survey footer removed; both Remi modes switch artwork, flow and detail links.');
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:width>760?1000:844});
  for(const cls of ['hs-pain','hs-solution']){
   const section=page.locator('.'+cls);
   await section.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
   await section.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
   const overflow=await section.evaluate(el=>[...el.querySelectorAll('h2,h3,p,img,figure')].filter(node=>{const r=node.getBoundingClientRect();return r.left<0||r.right>innerWidth+1;}).map(node=>node.tagName));
   assert.deepEqual(overflow,[],`Section content fits at ${width}`);
   await section.screenshot({path:fileURLToPath(new URL(`story-${cls}-${width}.png`,report))});
  }
  results.push(`${width}px: both sections fit, delivered images decode, no horizontal overflow.`);
 }
 const line=page.locator('.hs-graph-draw');
 assert.equal(await line.evaluate(el=>getComputedStyle(el).animationName),'none');
 results.push('Reduced motion leaves the complete curve visible.');
 await page.setViewportSize({width:1440,height:1000});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.hs-graph').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.75,behavior:'instant'}));
 // Allow the browser to commit its scroll timeline, then verify native scrolling advances it.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const before=await line.evaluate(el=>getComputedStyle(el).clipPath);
 await page.mouse.wheel(0,380);
 await page.waitForFunction(previous=>getComputedStyle(document.querySelector('.hs-graph-draw')).clipPath!==previous,before);
 const after=await line.evaluate(el=>getComputedStyle(el).clipPath);
 assert.notEqual(before,after);
 results.push(`Native scroll advances curve reveal: ${before} → ${after}.`);
 await page.locator('.hs-solution').scrollIntoViewIfNeeded();
 await page.locator('#restart').click();
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
 await page.locator('#restart').evaluate(el=>el.blur());
 await page.keyboard.press('End');
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='released');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'next-content');
 results.push('Opening replay returns to the new first section.');
}finally{await browser.close();}
assert.deepEqual(errors,[]);
await writeFile(new URL('story-checks.json',report),JSON.stringify({results,errors,verifiedAssets:assets.map(a=>a.id)},null,2));
console.log(results.map(result=>'PASS: '+result).join('\n'));
