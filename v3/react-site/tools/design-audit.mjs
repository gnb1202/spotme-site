import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),base=path.resolve(root,'..');
const raw=JSON.parse(await fs.readFile(path.join(base,'designs/figma-data.json'))),pages=JSON.parse(await fs.readFile(path.join(base,'designs/pages.json'))),manifest=JSON.parse(await fs.readFile(path.join(base,'designs/assets.json')));
const iteration=process.argv[2]||'before',out=path.join(root,'reports/mimikyu',iteration);await fs.mkdir(out,{recursive:true});
const exports=new Map(manifest.assets.filter(a=>!manifest.deliveryNodeOverrides?.includes(a.id)&&!manifest.composedPhones?.includes(a.id)).map(a=>[a.id,a]));
const browser=await chromium.launch();const report={iteration,contractHash:crypto.createHash('sha256').update(await fs.readFile(path.join(base,'designs/figma-data.json'))).digest('hex'),pages:[]};
try{for(const spec of pages){
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4187'+spec.url);await page.waitForSelector('[data-ready="true"]');
 await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));for(let y=0;y<document.body.scrollHeight;y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}scrollTo(0,0);});
 await page.screenshot({path:path.join(out,spec.slug+'.png'),fullPage:true});
 const actual=await page.evaluate(()=>[...document.querySelectorAll('[data-source-node-id]')].map(el=>{const b=el.getBoundingClientRect(),s=getComputedStyle(el);return {id:el.dataset.sourceNodeId,tag:el.tagName,text:el.classList.contains('text')?el.textContent:null,x:b.x,y:b.y,width:b.width,height:b.height,font:s.fontFamily,fontSize:parseFloat(s.fontSize),fontWeight:Number(s.fontWeight),lineHeight:parseFloat(s.lineHeight),letterSpacing:parseFloat(s.letterSpacing)||0,color:s.color,images:[...el.querySelectorAll('img')].filter(i=>i.closest('[data-source-node-id]')===el).map(i=>({ref:i.dataset.imageRef,src:new URL(i.src).pathname,width:i.naturalWidth,height:i.naturalHeight}))};}));
 const frame=raw.nodes[spec.frameId].document,origin=frame.absoluteBoundingBox,nodes=new Map();function visit(n){if(n.visible===false||n.absoluteRenderBounds===null)return;nodes.set(n.id,n);if(!exports.has(n.id))n.children?.forEach(visit);}visit(frame);
 const issues=[],assets=[];
 for(const a of actual){const n=nodes.get(a.id);if(!n){issues.push({id:a.id,kind:'unknown-node'});continue;}const asset=exports.get(a.id),b=asset?asset.render:n.absoluteBoundingBox;if(!b)continue;
 const expected={x:b.x-origin.x,y:b.y-origin.y,width:b.width,height:b.height};
 for(const [prop,value] of Object.entries(expected))if(Math.abs(a[prop]-value)>.6)issues.push({id:n.id,name:n.name,kind:'geometry',prop,expected:value,actual:a[prop],delta:a[prop]-value});
 if(n.type==='TEXT'){
  if(a.text!==n.characters)issues.push({id:n.id,kind:'text',expected:n.characters,actual:a.text});
  for(const [prop,value] of Object.entries({fontSize:n.style.fontSize,fontWeight:n.style.fontWeight,lineHeight:n.style.lineHeightPx,letterSpacing:n.style.letterSpacing??0}))if(Number.isFinite(value)&&Math.abs(a[prop]-value)>.6)issues.push({id:n.id,kind:'typography',prop,expected:value,actual:a[prop]});
 }
 for(const image of a.images){const fill=manifest.fills.find(f=>f.imageRef===image.ref),expectedPath=fill?.deliveryPath??fill?.path;if(expectedPath){const match=image.src==='/'+expectedPath&&image.width>0;assets.push({id:n.id,ref:image.ref,expected:expectedPath,actual:image.src,match});if(!match)issues.push({id:n.id,kind:'asset',expected:expectedPath,actual:image.src});}}
 }
 report.pages.push({slug:spec.slug,route:spec.url,checkedNodes:actual.length,issues,assets,errors});console.log(spec.slug,actual.length,'nodes;',issues.length,'issues');await page.close();
}}finally{await browser.close();}
await fs.writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2));
const failures=report.pages.reduce((count,p)=>count+p.issues.length+p.errors.length,0);
console.log(JSON.stringify({pages:report.pages.length,nodes:report.pages.reduce((n,p)=>n+p.checkedNodes,0),failures}));
process.exitCode=failures?1:0;
