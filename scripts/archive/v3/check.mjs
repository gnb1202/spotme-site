import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const source=JSON.parse(await fs.readFile('designs/source.json')),bytes=await fs.readFile('designs/figma-data.json'),raw=JSON.parse(bytes),manifest=JSON.parse(await fs.readFile('designs/assets.json')),pages=JSON.parse(await fs.readFile('designs/pages.json'));
const failures=[],hash=b=>createHash('sha256').update(b).digest('hex');
if(hash(bytes)!==source.sha256)failures.push('Frozen Figma source changed');
const exported=new Set(manifest.assets.filter(a=>!manifest.composedPhones?.includes(a.id)&&!manifest.deliveryNodeOverrides?.includes(a.id)).map(a=>a.id)),allowed=new Set(['style.css','site.js','font-metrics.js','opening.css','opening.js','opening-glyphs.js',...pages.map(p=>p.url.slice(1)+'index.html')]);
allowed.add('opening-remi.svg');
for(const a of [...manifest.assets,...manifest.fills,...manifest.masks,...(manifest.delivery??[])]){allowed.add(a.path);if(hash(await fs.readFile('public/'+a.path))!==a.sha256)failures.push('Asset hash '+a.path);}
for(const a of manifest.delivery??[]){if(hash(await fs.readFile(a.sourcePath))!==a.sha256)failures.push('Canonical delivery changed '+a.sourcePath);}
const fonts=[];for(const name of await fs.readdir('public/assets/fonts')){const path='assets/fonts/'+name;allowed.add(path);fonts.push({path,sha256:hash(await fs.readFile('public/'+path))});}
async function walkFiles(dir,prefix=''){for(const item of await fs.readdir(dir,{withFileTypes:true})){const rel=prefix+item.name;if(item.isDirectory())await walkFiles(dir+'/'+item.name,rel+'/');else if(!allowed.has(rel))failures.push('Unapproved public file '+rel)}}await walkFiles('public');
const browser=await chromium.launch(),results=[];
for(const p of pages){
 const root=raw.nodes[p.frameId].document,origin=root.absoluteBoundingBox,expected=[],ids=[];
 function visit(n){if(n.visible===false||n.absoluteRenderBounds===null)return;ids.push(n.id);if(exported.has(n.id))return;if(n.type==='TEXT')expected.push({id:n.id,text:n.characters,bounds:n.absoluteBoundingBox,style:n.style,fills:n.fills});n.children?.forEach(visit)}root.children.forEach(visit);
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4184/'))errors.push('External request '+r.url())});
 await page.goto('http://127.0.0.1:4184'+p.url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const actual=await page.evaluate(()=>({texts:[...document.querySelectorAll('.text')].map(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{id:el.dataset.sourceNodeId,text:el.textContent,x:r.x,y:r.y,width:r.width,height:r.height,size:parseFloat(s.fontSize),weight:Number(s.fontWeight),family:s.fontFamily,spacing:parseFloat(s.letterSpacing)||0,color:s.color}}),ids:[...document.querySelectorAll('[data-source-node-id]')].map(el=>el.dataset.sourceNodeId),tabs:[...document.querySelectorAll('nav .text')].map(a=>[a.textContent,a.getAttribute('href')]),broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length,animations:document.getAnimations().length,width:document.documentElement.scrollWidth}));
 const issues=[...errors];for(const e of expected){const a=actual.texts.find(a=>a.id===e.id);if(!a){issues.push('Missing text '+e.id);continue;}if(a.text!==e.text)issues.push('Changed text '+e.id);for(const [key,value] of Object.entries({x:e.bounds.x-origin.x,y:e.bounds.y-origin.y,width:e.bounds.width,height:e.bounds.height,size:e.style.fontSize,weight:e.style.fontWeight,spacing:e.style.letterSpacing??0})){if(Math.abs(a[key]-value)>.51)issues.push(`${e.id} ${key}: ${a[key]} vs ${value}`)}}
 for(const e of expected){const a=actual.texts.find(a=>a.id===e.id);if(!a)continue;const family=a.family.split(',')[0].replaceAll('"','').replaceAll("'",'').trim();if(family!==e.style.fontFamily)issues.push('Font family '+e.id);const fill=e.fills.find(f=>f.visible!==false&&f.type==='SOLID');if(fill){const rgb=['r','g','b'].map(k=>Math.round(fill.color[k]*255)),actualRgb=a.color.match(/[\d.]+/g).slice(0,3).map(Number);if(JSON.stringify(rgb)!==JSON.stringify(actualRgb))issues.push('Text color '+e.id);}}
 for(const a of actual.texts)if(!expected.some(e=>e.id===a.id))issues.push('Invented text '+a.id);
 for(const id of actual.ids)if(!ids.includes(id))issues.push('Invented element '+id);
 const tabs=[['홈','/'],['AI 운동 서포트','/ai/'],['게임처럼 즐기는 운동','/game/'],['파트너 레미','/characters/'],['홍보 영상','/video/']];if(JSON.stringify(actual.tabs)!==JSON.stringify(tabs))issues.push('Navigation mismatch');
 if(actual.broken||actual.animations||actual.width!==1920)issues.push('Images/animation/overflow');
 // A simple scaled initial layout is intentional; responsive rearrangement is not invented.
 const widths=[];for(const width of [1440,1024,390]){await page.setViewportSize({width,height:900});const state=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].some(i=>!i.naturalWidth)}));widths.push(state);if(state.scroll!==width||state.broken)issues.push('Resize '+width)}
 results.push({page:p.slug,textNodes:expected.length,issues,widths});failures.push(...issues.map(i=>p.slug+': '+i));await page.close();
}
const interactionPage=await browser.newPage({viewport:{width:1440,height:900}}),interactions=[];
for(const [path,label,target] of [['/','AI 운동 서포트','/ai/'],['/ai/','게임처럼 즐기는 운동','/game/'],['/game/','운동으로 공격','/game-02/'],['/characters/','다음 몬스터','/characters-b/'],['/characters-b/','이전 몬스터','/characters/']]){
 await interactionPage.goto('http://127.0.0.1:4184'+path,{waitUntil:'networkidle'});const link=interactionPage.getByRole('link',{name:label,exact:true});await link.focus();await interactionPage.keyboard.press('Enter');await interactionPage.waitForURL('**'+target);interactions.push({path,label,target,passed:true});
}
await browser.close();await fs.mkdir('reports',{recursive:true});await fs.writeFile('designs/fonts.json',JSON.stringify(fonts,null,2));
const report={source,checkedAt:new Date().toISOString(),scope:'Source inventory/layout/native typography properties and navigation, NOT high-resolution pixel certification',results,interactions,failures};await fs.writeFile('reports/harness.json',JSON.stringify(report,null,2));console.log(JSON.stringify({pages:results.length,textNodes:results.reduce((s,r)=>s+r.textNodes,0),interactions:interactions.length,failures},null,2));process.exitCode=failures.length?1:0;
