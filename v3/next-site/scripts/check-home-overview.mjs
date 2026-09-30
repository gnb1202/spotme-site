import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {overviewScreens,overviewFeatures} from '../src/integration/home-overview-data.js';

const site=new URL('../',import.meta.url);
const report=new URL('../../reports/home-phone/',import.meta.url);
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4189';
await mkdir(report,{recursive:true});
const manifest=JSON.parse(await readFile(new URL('assets.json',report),'utf8'));
for(const asset of manifest){
  const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
  // The repository is two levels above next-site.
  assert.equal(hash(await readFile(new URL('../../'+asset.source,site))),asset.sourceSha256);
  assert.equal(hash(await readFile(new URL(asset.output,site))),asset.outputSha256);
}

const browser=await chromium.launch({headless:true});
const errors=[],results=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().includes('/home-overview/')&&![200,304].includes(r.status()))errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base+'/?intro=skip');
  await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
  await page.keyboard.press('End');
  await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='released');
  assert.equal(await page.locator('#next-content').evaluate(el=>document.activeElement===el),true,'Opening focuses the new section');
  assert.equal(await page.locator('#next-content .viewport').count(),0,'Frozen lower canvas replaced');
  const screen=async id=>{
    await page.waitForFunction(id=>document.querySelector('.hpo-device')?.dataset.screen===id,id);
    await page.locator('.hpo-screen img').evaluate(image=>image.decode());
  };
  await screen('home');
  await page.locator('.home-phone-overview').screenshot({path:new URL('desktop-full.png',report).pathname.replace(/^\/([A-Z]:)/,'$1')});
  await page.getByRole('button',{name:'Day 1 AI 추천 운동 보기',exact:true}).click();await screen('routine');
  assert.equal(await page.locator('.hpo-device').evaluate(el=>document.activeElement===el),true,'Focus retained when a hotspot unmounts');
  await page.getByRole('button',{name:'추천 루틴으로 운동 시작하기',exact:true}).click();await screen('workout');
  await page.getByRole('button',{name:'레미의 도움 받기',exact:true}).click();await screen('adjust');
  await page.getByRole('button',{name:'중량 조정 완료 예시 보기',exact:true}).click();await screen('workout');
  await page.getByRole('button',{name:'운동을 마치고 결과 보기',exact:true}).first().click();await screen('result');
  await page.getByRole('button',{name:'운동 리포트로 이동',exact:true}).click();await screen('report');
  await page.getByRole('button',{name:'프로필 화면 보기',exact:true}).click();await screen('profile');
  await page.getByRole('button',{name:'운동 홈으로 이동',exact:true}).click();await screen('home');
  for(const item of overviewFeatures){
    await page.locator('.hpo-features button').filter({hasText:item.name}).click();await screen(item.id);
    assert.equal(await page.locator('.hpo-features [aria-pressed=true]').count(),1);
  }
  await page.locator('.hpo-features button').first().focus();
  await page.keyboard.press('Enter');await screen('home');
  await page.locator('.hpo-play').click();
  // Bring enough of the device into view to enable the opt-in tour.
  await page.locator('.hpo-device').evaluate(el=>el.scrollIntoView({block:'center'}));
  await page.waitForFunction(()=>document.querySelector('.hpo-device').dataset.screen==='routine',{},{timeout:6500});
  await page.evaluate(()=>window.scrollTo({top:100,behavior:'instant'}));
  await page.waitForTimeout(4800);
  assert.equal(await page.locator('.hpo-device').getAttribute('data-screen'),'routine','Tour pauses while phone is offscreen');
  await page.locator('.hpo-features button').filter({hasText:'퀘스트'}).click();await screen('quest');
  assert.equal(await page.locator('.hpo-play').getAttribute('aria-pressed'),'false','Manual selection stops automatic tour');
  await page.locator('.hpo-play').click();await page.keyboard.press('Escape');
  assert.equal(await page.locator('.hpo-play').getAttribute('aria-pressed'),'false','Escape stops automatic tour');
  results.push('Desktop: opening handoff, all feature selectors, in-phone workout flow, keyboard focus, tour advance/offscreen pause/manual stop/Escape');

  for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1920,height:1080}]){
    await page.setViewportSize(viewport);
    await page.locator('.hpo-features button').first().click();await screen('home');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false,`No horizontal overflow at ${viewport.width}`);
    await page.mouse.move(0,0);
    await page.locator('#next-content').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
    await page.locator('.home-phone-overview').screenshot({path:new URL(`layout-${viewport.width}.png`,report).pathname.replace(/^\/([A-Z]:)/,'$1')});
    if(viewport.width===390){
      await page.locator('.hpo-features button').filter({hasText:'운동 리포트'}).click();await screen('report');
      const top=await page.locator('.hpo-phone-column').evaluate(el=>el.getBoundingClientRect().top);
      assert(top>=100&&top<200,'Mobile selection brings phone below fixed header');
      assert.equal(await page.locator('.hpo-screen').evaluate(el=>getComputedStyle(el).animationName),'none','Reduced motion has no screen animation');
      await page.getByRole('button',{name:'프로필 화면 보기',exact:true}).click();await screen('profile');
    }
    results.push(`Responsive ${viewport.width}×${viewport.height}: no horizontal overflow, screenshot captured`);
  }
  // Normal motion also preserves the opening handoff and screen transitions.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.reload();
  await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
  await page.keyboard.press('End');
  await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='released');
  await page.locator('.hpo-features button').filter({hasText:'레미 AI'}).click();await screen('ai');
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.hpo-screen').evaluate(el=>Number(getComputedStyle(el).opacity)),1,'Normal motion settles fully opaque');
  await page.locator('#restart').click();
  await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='opening');
  await page.locator('#skip-opening').click();
  await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');
  await page.keyboard.press('End');
  await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='released');
  results.push('Normal motion: hero charge, handoff, replay and skip preserved; phone transition settles');
}catch(error){
  // Re-throw after closing the browser; no hidden passes.
  throw error;
}finally{
  await browser.close();
}
assert.deepEqual(errors,[],'No page or artwork response errors');
await writeFile(new URL('checks.json',report),JSON.stringify({base,results,errors,screens:Object.keys(overviewScreens),assetHashesVerified:manifest.length},null,2));
console.log('PASS: '+results.join('\nPASS: '));
