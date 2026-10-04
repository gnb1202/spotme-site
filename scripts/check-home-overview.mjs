import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {overviewFeatures} from '../src/integration/home-overview-data.js';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:4189';
const report=new URL('../v3/reports/home-phone/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('assets.json',report),'utf8'));
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
for(const item of overviewFeatures){
 const asset=manifest.find(asset=>asset.id===item.id);
 assert.equal(hash(await readFile(new URL('../'+asset.source,import.meta.url))),asset.sourceSha256);
 assert.equal(hash(await readFile(new URL('../'+asset.output,import.meta.url))),asset.outputSha256);
}
const browser=await chromium.launch();
const errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/?intro=skip');
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
 await page.keyboard.press('End');
 await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='released');
 await page.locator('.hpo-display img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 assert.equal(await page.locator('.hpo-pin,.hpo-play,.hpo-hotspot,.hpo-next').count(),0,'No pin, autoplay or detailed demo controls');
 for(const [index,item] of overviewFeatures.entries()){
  const button=page.locator('.hpo-features button').nth(index);
  await button.focus();await page.keyboard.press('Enter');
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.hpo-features [aria-pressed=true]').count(),1);
  assert.equal(await page.locator('.hpo-display img:visible').count(),1);
  assert.equal(await page.locator('.hpo-display img:visible').getAttribute('src'),`/home-overview/${item.id}.webp`);
  assert.equal(await page.locator('.hpo-summary p').innerText(),item.description);
  assert.equal(await page.locator('.hpo-summary a').getAttribute('href'),item.href);
 }
 results.push('Opening handoff; four keyboard-accessible feature selectors; one screen, short description and link per selection');
 for(const viewport of [{width:1440,height:1000},{width:1366,height:768},{width:1920,height:1080},{width:1024,height:600},{width:768,height:1024},{width:390,height:844},{width:320,height:740}]){
  await page.setViewportSize(viewport);
  await page.locator('.hpo-features button').first().click();
  await page.mouse.move(0,0);
  await page.locator('#home-overview').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
  const device=await page.locator('.hpo-device').boundingBox();
  const header=await page.locator('.site-navigation').boundingBox();
  assert(device.y>=header.height-1,'Phone starts below header');
  assert(device.y+device.height<=viewport.height-12,`Entire phone visible at ${viewport.width}x${viewport.height}: bottom ${device.y+device.height}`);
  assert(device.x>=0&&device.x+device.width<=viewport.width,'Phone fits horizontally');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
  await page.screenshot({path:fileURLToPath(new URL(`simplified-${viewport.width}.png`,report))});
  results.push(`${viewport.width}x${viewport.height}: full phone visible below header (${Math.round(device.width)}x${Math.round(device.height)}), no overflow`);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.hpo-features button').nth(1).click();
 await page.locator('.hpo-summary a').click();
 await page.waitForURL('**/remi-ai/');
 await page.locator('#remi-studio-title').waitFor();
 results.push('Existing Remi AI detail navigation works');
}finally{await browser.close();}
assert.deepEqual(errors,[],'No browser errors');
await writeFile(new URL('simplified-checks.json',report),JSON.stringify({base,results,errors,verifiedAssets:overviewFeatures.map(item=>item.id)},null,2));
console.log('PASS: '+results.join('\nPASS: '));
