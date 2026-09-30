import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import metrics from '../src/generated/font-metrics.js';
const root=path.resolve(import.meta.dirname,'..'),base=path.resolve(root,'..');
const raw=JSON.parse(await fs.readFile(path.join(base,'designs/figma-data.json'))),pages=JSON.parse(await fs.readFile(path.join(base,'designs/pages.json')));
const browser=await chromium.launch(),report=[];
try{for(const spec of pages){
 const p=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4187'+spec.url);await p.waitForSelector('[data-ready="true"]');
 const actual=await p.evaluate(metrics=>[...document.querySelectorAll('.text')].map(el=>{
  const ink=el.querySelector('.ink'),marker=document.createElement('i');marker.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';ink.prepend(marker);const baseline=marker.getBoundingClientRect().top;marker.remove();
  const walker=document.createTreeWalker(ink,NodeFilter.SHOW_TEXT),rects=[];let firstY;
  while(walker.nextNode()){const n=walker.currentNode,s=getComputedStyle(n.parentElement),size=parseFloat(s.fontSize),family=s.fontFamily.split(',')[0].replaceAll('"','').replaceAll("'",''),glyphs=metrics[family+':'+s.fontWeight];if(!glyphs)continue;
   for(let i=0;i<n.length;i++){const g=glyphs[n.data[i]];if(!g)continue;const range=document.createRange();range.setStart(n,i);range.setEnd(n,i+1);const r=range.getBoundingClientRect();firstY??=r.y;const y=baseline+r.y-firstY;rects.push({x:r.x+g[0]*size,y:y-g[3]*size,right:r.x+g[2]*size,bottom:y-g[1]*size});}
  }
  const stroke=parseFloat(getComputedStyle(el).webkitTextStrokeWidth)||0,left=Math.min(...rects.map(r=>r.x))-stroke/2,top=Math.min(...rects.map(r=>r.y))-stroke/2;
  return{id:el.dataset.sourceNodeId,x:left,y:top,width:Math.max(...rects.map(r=>r.right))+stroke/2-left,height:Math.max(...rects.map(r=>r.bottom))+stroke/2-top};
 }),metrics);
 const frame=raw.nodes[spec.frameId].document,origin=frame.absoluteBoundingBox,nodes={};function walk(n){nodes[n.id]=n;n.children?.forEach(walk)}walk(frame);
 const deltas=actual.map(a=>{const n=nodes[a.id],b=n.absoluteRenderBounds;return{id:a.id,text:n.characters.slice(0,30),stroke:(n.strokes||[]).length?{weight:n.strokeWeight,align:n.strokeAlign}:null,expected:{x:b.x-origin.x,y:b.y-origin.y,width:b.width,height:b.height},actual:a,delta:{x:a.x-(b.x-origin.x),y:a.y-(b.y-origin.y),width:a.width-b.width,height:a.height-b.height}};});
 report.push({page:spec.slug,deltas});console.log(spec.slug,JSON.stringify(deltas.filter(r=>Object.values(r.delta).some(v=>Math.abs(v)>1))));await p.close();
}}finally{await browser.close();}
await fs.writeFile(path.join(root,'reports/mimikyu/ink-'+(process.argv[2]||'before')+'.json'),JSON.stringify(report,null,2));
