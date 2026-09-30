import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
if(!process.argv.includes('--from-legacy'))throw new Error('React is the primary source. Legacy re-import overwrites React inputs; explicitly pass --from-legacy only for an intentional migration.');
const root=path.resolve(import.meta.dirname,'..'),source=path.resolve(root,'../public'),motion=path.resolve(root,'../motion-studies'),generated=path.join(root,'src/generated');
await fs.mkdir(generated,{recursive:true});await fs.mkdir(path.join(root,'public'),{recursive:true});
await fs.cp(path.join(source,'assets'),path.join(root,'public/assets'),{recursive:true});
await fs.cp(path.join(motion,'scroll/assets'),path.join(root,'public/motion-assets'),{recursive:true});
await fs.copyFile(path.join(source,'style.css'),path.join(generated,'site.css'));
await fs.writeFile(path.join(generated,'font-metrics.js'),(await fs.readFile(path.join(source,'font-metrics.js'),'utf8')).replace('window.FONT_METRICS=','export default '));
// React-only refinements derive from the same immutable Figma contract, not screenshots.
const figma=JSON.parse(await fs.readFile(path.resolve(root,'../designs/figma-data.json'))),refinements={};
function collectRefinements(n){
 if(n.visible===false)return;
 if(n.type==='TEXT'&&n.strokes?.some(s=>s.visible!==false)&&n.strokeAlign==='OUTSIDE'&&!n.fills?.some(f=>f.visible!==false)){
  const b=n.absoluteBoundingBox,r=n.absoluteRenderBounds,paint=n.strokes.find(s=>s.visible!==false);
  refinements[n.id]={kind:'outline',bounds:{x:r.x-b.x,y:r.y-b.y,width:r.width,height:r.height},stroke:n.strokeWeight,color:`rgb(${['r','g','b'].map(k=>Math.round(paint.color[k]*255)).join(',')})`};
 }
 n.children?.forEach(collectRefinements);
}
Object.values(figma.nodes).forEach(e=>collectRefinements(e.document));
const assetManifest=JSON.parse(await fs.readFile(path.resolve(root,'../designs/assets.json')));
for(const asset of assetManifest.assets.filter(a=>['255:775','254:358'].includes(a.id)))refinements[asset.id]={kind:'asset-size',width:asset.render.width,height:asset.render.height};
await fs.writeFile(path.join(generated,'refinements.json'),JSON.stringify(refinements));
await fs.writeFile(path.join(generated,'outline-glyphs.js'),(await fs.readFile(path.join(source,'opening-glyphs.js'),'utf8')).replace('window.SPOTME_GLYPHS=','export default '));
const browser=await chromium.launch({headless:true}),page=await browser.newPage();
const files=['index.html',...(await fs.readdir(source,{withFileTypes:true})).filter(d=>d.isDirectory()&&d.name!=='assets').map(d=>d.name+'/index.html')],pages={},hashes={};
async function parse(html,selector){return page.evaluate(({html,selector})=>{
  const doc=new DOMParser().parseFromString(html,'text/html');
  function camel(name){return name.startsWith('--')?name:name.replace(/^-ms-/,'ms-').replace(/-([a-z])/g,(_,s)=>s.toUpperCase());}
  const aliases={class:'className',for:'htmlFor',tabindex:'tabIndex',viewbox:'viewBox',preserveaspectratio:'preserveAspectRatio',pathlength:'pathLength'};
  function node(el){if(el.nodeType===3)return el.textContent;if(el.nodeType!==1||['SCRIPT','TEMPLATE'].includes(el.tagName))return null;
    const props={};for(const a of el.attributes){if(a.name==='style'){props.style=Object.fromEntries([...el.style].map(k=>[camel(k),el.style.getPropertyValue(k)]));continue;}let key=aliases[a.name]??(a.name.startsWith('data-')||a.name.startsWith('aria-')?a.name:camel(a.name));props[key]=['hidden','disabled','inert','controls','loop','autoPlay'].includes(key)?true:a.value;}
    return {tag:el.localName,props,children:[...el.childNodes].map(node).filter(v=>v!==null)};
  }
  return {tree:node(doc.querySelector(selector)),title:doc.title,frame:doc.body.dataset.frame};
},{html,selector});}
try{
 for(const file of files){const html=await fs.readFile(path.join(source,file),'utf8'),route=file==='index.html'?'/':'/'+file.replace('index.html','');pages[route]={...await parse(html,'main'),route};hashes[file]=crypto.createHash('sha256').update(html).digest('hex');}
 await fs.writeFile(path.join(generated,'pages.json'),JSON.stringify(pages));
 await fs.mkdir(path.join(generated,'pages'),{recursive:true});
 const loaders=[];
 for(const [route,data] of Object.entries(pages)){const file=route==='/'?'home':route.replaceAll('/','');await fs.writeFile(path.join(generated,'pages',file+'.json'),JSON.stringify(data));loaders.push(`${JSON.stringify(route)}:()=>import('./pages/${file}.json')`);}
 await fs.writeFile(path.join(generated,'route-loaders.js'),'export default {'+loaders.join(',')+'};');
 const html=await fs.readFile(path.join(motion,'scroll/index.html'),'utf8');
 const study=JSON.parse(html.match(/window\.STUDY=(.*?);window\.STUDY\.variant=/s)[1]);
 const body=html.replaceAll('src="assets/','src="/motion-assets/').replaceAll('url(assets/','url(/motion-assets/').replace('href="../tweak.html"','href="/lab/"');
 const parsed=await parse(body,'body');
 const template=html.match(/<template id="fill-template">([\s\S]*?)<\/template>/)[1];
 await fs.writeFile(path.join(generated,'motion.json'),JSON.stringify({tree:parsed.tree,fill:(await parse(template,'svg')).tree,study}));
 const styles=html.match(/<style>([\s\S]*?)<\/style>/)[1];await fs.writeFile(path.join(generated,'motion-style.js'),'export default '+JSON.stringify(styles.replaceAll("'assets/","'/motion-assets/"))+';');
 await fs.writeFile(path.join(generated,'source-hashes.json'),JSON.stringify(hashes,null,2));
}finally{await browser.close();}
console.log(`Synced ${Object.keys(pages).length} routes and source assets; static originals unchanged.`);
// Adapt existing approved motion into lifecycle-managed ES modules. No eval or iframe.
const scoped=code=>code.replaceAll('document.querySelectorAll(','scope.querySelectorAll(').replaceAll('document.querySelector(','scope.querySelector(').replaceAll('document.getElementById(','byId(').replaceAll("'assets/","'/motion-assets/");
let opening=(await fs.readFile(path.join(motion,'tools/timeline.js'),'utf8')).split('(async()=>{')[1].split('})().catch')[0];
opening=opening.replace('window.STUDY_SETTINGS=settings;','').replaceAll('window.STUDY','study');
const from=opening.indexOf('  await document.fonts.ready;'),to=opening.indexOf('  const cameraTransform');
opening=opening.slice(0,from)+opening.slice(to);
opening=opening.replace("window.__timelines=window.__timelines||{};window.__timelines['COMPOSITION_ID']=tl;study_READY=true;",'timeline=tl;');
opening=scoped(opening);
await fs.writeFile(path.join(generated,'opening-runtime.js'),`import {gsap} from 'gsap';
export async function startOpening(scope,study,signal){
 await document.fonts.ready;await Promise.all([...scope.querySelectorAll('img')].map(i=>i.decode()));
 if(signal.aborted)return null;
 const byId=id=>scope.querySelector('[id="'+id+'"]'),mask=byId('remi-mask'),originalRemi=byId('poster-remi');
 let timeline;
 const context=gsap.context(()=>{${opening}},scope);
 return {timeline,dispose(){context.revert();byId('mirror-stage')?.querySelector('svg')?.remove();mask.id='remi-mask';mask.append(originalRemi);}};
}`);
let scroll=(await fs.readFile(path.join(motion,'tools/scroll.js'),'utf8')).split('(async()=>{')[1].split('})().catch')[0];
scroll=scroll.replace(/  const deadline=[^\n]+\n/,'').replace("  const intro=window.__timelines['spotme-scroll'];",'');
scroll=scroll.replace('await standing.decode();','await standing.decode();if(signal.aborted){scope.querySelector("#charge-fill")?.remove();standing.remove();return null;}');
scroll=scoped(scroll).replaceAll('STUDY.','study.').replace('window.SCROLL_STUDY=','const api=');
scroll=scroll.replaceAll('document.addEventListener(', 'listen(document,').replaceAll('hero.addEventListener(', 'listen(hero,').replaceAll('reduced.addEventListener(', 'listen(reduced,').replace(/(?<![.\w])addEventListener\(/g,'listen(window,');
scroll=scroll.replace("document.body.dataset.phase=value;",'scope.dataset.phase=value;');
await fs.writeFile(path.join(generated,'scroll-runtime.js'),`import {gsap} from 'gsap';
export async function startScroll(scope,study,intro,signal){
 const byId=id=>scope.querySelector('[id="'+id+'"]');
 const listen=(target,event,handler,options={})=>target.addEventListener(event,handler,{...options,signal});
 const restoration=history.scrollRestoration;
 const originalStyles=[scope.querySelector('#home .canvas'),scope.querySelector('#home [data-source-node-id="254:244"]')].map(el=>[el,el.getAttribute('style')]);
 ${scroll}
 return {api,dispose(){chargeTween?.kill();finishTween?.kill();moveTween?.kill();stopShake();stopHint();intro.pause();for(const el of [standing,cue,scope.querySelector('#charge-fill')])el?.remove();for(const [el,style] of originalStyles)el.setAttribute('style',style);document.body.classList.remove('pinned');history.scrollRestoration=restoration;for(const el of scope.querySelectorAll('#study-tools button'))el.onclick=null;}};
}`);
