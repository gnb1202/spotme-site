import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'reports/mimikyu'),raw=JSON.parse(await fs.readFile(path.resolve(root,'../designs/figma-data.json'))),manifest=JSON.parse(await fs.readFile(path.resolve(root,'../designs/assets.json'))),report={checks:[],outlinePixels:[],errors:[]};
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
page.on('pageerror',e=>report.errors.push(e.message));
try{
 for(const [route,frameId,id] of [['/','20:127','205:3'],['/ai/','112:577','256:579']]){
  await page.goto('http://127.0.0.1:4187'+route);await page.waitForSelector('[data-outline-ready]');await page.waitForTimeout(80);
  const frame=raw.nodes[frameId].document;let node;function find(n){if(n.id===id)node=n;n.children?.forEach(find)}find(frame);
  const origin=frame.absoluteBoundingBox,r=node.absoluteRenderBounds,expected={x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height};
  await page.screenshot({path:path.join(out,route==='/'?'home-after.png':'ai-after.png')});
  // Isolate actual painted SVG alpha for proof. This is test-only; no app markup changes.
  await page.evaluate(id=>{const n=document.querySelector(`[data-source-node-id="${id}"]`),b=n.getBoundingClientRect(),svg=n.querySelector('svg').cloneNode(true);document.body.innerHTML='';document.documentElement.style.background='transparent';document.body.style.background='transparent';const mount=document.createElement('div');mount.style.cssText=`position:absolute;left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px`;mount.append(svg);document.body.append(mount);},id);
  const png=await page.screenshot({omitBackground:true,path:path.join(out,id.replace(':','-')+'-outline.png')}),{data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=info.width,y0=info.height,x1=0,y1=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=128){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const actual={x:x0,y:y0,width:x1-x0+1,height:y1-y0+1};for(const key of Object.keys(expected))assert(Math.abs(actual[key]-expected[key])<=1.1,`${id} ${key}: ${actual[key]} vs ${expected[key]}`);report.outlinePixels.push({id,expected,actual});
 }
 report.checks.push('actual outside-stroke raster bounds within 1.1px of Figma, home and AI');
 for(const width of [1920,1440,1024,390]){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4187/');await page.waitForSelector('[data-outline-ready]');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('[data-figma-outside-stroke]').count(),1);}
 report.checks.push('outline geometry survives four viewport sizes');
 await page.setViewportSize({width:1440,height:900});
 for(const [route,label,next] of [['/','AI 운동 서포트','/ai/'],['/ai/','게임처럼 즐기는 운동','/game/'],['/game/','운동으로 공격','/game-02/'],['/characters/','다음 몬스터','/characters-b/'],['/characters-b/','이전 몬스터','/characters/']]){await page.goto('http://127.0.0.1:4187'+route);await page.waitForSelector('[data-ready]');const link=page.getByRole('link',{name:label,exact:true});await link.focus();await page.keyboard.press('Enter');await page.waitForURL('**'+next);await page.waitForSelector('[data-ready]');}
 report.checks.push('keyboard navigation, game state and character arrows');
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const variant of ['a','b']){await page.goto('http://127.0.0.1:4187/?experience=scroll&variant='+variant);await page.waitForFunction(()=>window.SCROLL_STUDY?.state==='charging');assert.equal(await page.locator('[data-figma-outside-stroke]').count(),0);await page.locator('#scroll-cue').click();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>SCROLL_STUDY.progress),.25);await page.click('#skip-charge');await page.waitForFunction(()=>SCROLL_STUDY.state==='released');await page.locator('#study-tools a').click();await page.waitForURL('**/lab/');assert.equal(await page.locator('#scroll-cue').count(),0);}
 report.checks.push('existing React A/B, charge, next section and unmount preserved');
 let assetFiles=0;for(const a of [...manifest.assets,...manifest.fills,...manifest.masks,...manifest.delivery]){const bytes=await fs.readFile(path.join(root,'public',a.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256,a.path);assetFiles++;}report.assetFiles=assetFiles;report.checks.push('manifest asset bytes unchanged');
 assert.deepEqual(report.errors,[]);report.passed=true;
}finally{await browser.close();await fs.writeFile(path.join(out,'calibration-verification.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
