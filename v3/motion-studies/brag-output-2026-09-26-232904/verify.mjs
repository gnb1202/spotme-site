import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const root=import.meta.dirname,url='http://127.0.0.1:4186/'+path.basename(root),report={checks:[],errors:[],samples:[]};
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1920,height:1080}});
page.on('pageerror',e=>report.errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
async function seek(t){await page.evaluate(t=>{__timelines['spotme-brag'].pause().totalTime(t,true);},t);await page.waitForTimeout(40);return page.evaluate(()=>{
 const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
 const opacity=s=>Number(getComputedStyle(document.querySelector(s)).opacity);
 return {black:opacity('#black'),mirror:opacity('#mirror-stage'),title:box('#poster-title'),remi:box('#home [data-source-node-id="254:244"]'),home:box('#home'),draw:parseFloat(getComputedStyle(document.querySelector('#poster-title path')).strokeDashoffset),camera:document.querySelector('#mirror-camera').getAttribute('transform')};
});}
try{
 await page.goto(url+'/composition/');await page.waitForFunction(()=>window.STUDY_READY);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 assert.equal(await page.evaluate(()=>__timelines['spotme-brag'].duration()),5);report.checks.push('duration 5.00 seconds');
 const first=await seek(0),buffer=await page.screenshot({path:path.join(root,'reports/frame-0.png')});
 const stats=await sharp(buffer).removeAlpha().stats();assert(stats.channels.every(c=>c.max===0));report.checks.push('first frame all RGB exactly 0');
 assert.deepEqual(first.title,[17,327,1887,396]);assert.deepEqual(first.remi,[640,285,642,480]);report.checks.push('exact home title / seated Remi geometry');
 for(const t of [.46,.74,1.02,1.3,1.8,2.25,2.7,3.2,3.9,4.15,4.4,5]){const s=await seek(t);report.samples.push({t,...s});assert.deepEqual(s.home,first.home);assert.deepEqual(s.remi,first.remi);if([1.3,1.8,2.7,3.2,3.9,4.4,5].includes(t))await page.screenshot({path:path.join(root,`reports/frame-${t}.png`)});}
 const curves=report.samples.slice(0,3).map(s=>1-s.draw);assert(curves[0]<.01&&curves[1]<.07&&curves[2]>.3);report.checks.push('p4 typography acceleration');
 const reveal=report.samples.filter(s=>s.t>=2.25&&s.t<=4.15);assert(reveal.every((s,i)=>!i||s.black<reveal[i-1].black));assert.equal(reveal.at(-1).black,0);report.checks.push('stationary home / monotonic black transparency during suction');
 const final=report.samples.at(-1);assert.equal(final.mirror,0);assert.equal(final.black,0);report.checks.push('clean final home and 0.60s hold');
 const forward=await seek(3.2);await seek(5);assert.deepEqual(await seek(3.2),forward);assert.deepEqual(await seek(0),first);report.checks.push('reverse seek state determinism');
 await page.goto(url+'/');await page.waitForFunction(()=>window.COMPARISON_READY);await page.click('#play');await page.waitForTimeout(600);await page.click('#pause');
 const times=await page.locator('iframe').evaluateAll(fs=>fs.map(f=>Object.values(f.contentWindow.__timelines)[0].time()));assert(Math.max(...times)-Math.min(...times)<.001);report.checks.push('A/B/new synchronized playback');
 await page.locator('#time').fill('2.7');await page.locator('#time').dispatchEvent('input');await page.screenshot({path:path.join(root,'reports/comparison.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));report.checks.push('comparison mobile no overflow');
 const before=JSON.parse(await fs.readFile(path.join(root,'reports/preserved-before.json')));for(const [file,hash] of Object.entries(before)){const actual=crypto.createHash('sha256').update(await fs.readFile(path.resolve(root,'..',file))).digest('hex');assert.equal(actual,hash,file);}
 report.preservedFiles=Object.keys(before).length;report.checks.push('all protected A/B, scroll and public files unchanged');assert.deepEqual(report.errors,[]);report.passed=true;
 await fs.writeFile(path.join(root,'reports/verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,checks:report.checks,preserved:report.preservedFiles},null,2));
}finally{await browser.close();}
