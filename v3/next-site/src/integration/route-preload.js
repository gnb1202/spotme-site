// Only the four current tabs. Media is intentionally not part of this cache.
import {videoEntrySources,videoWebSource} from './video-assets.js';
import {overviewAsset,overviewScreens} from './home-overview-data.js';
const images=new Map();
const routes=new Map();
export const currentRoutes=['/','/features/','/remi-ai/','/video/'];
export function imageSources(node,result=new Set()){
 if(!node||typeof node!=='object')return result;
 if(node.tag==='img'&&node.props?.src)result.add(node.props.src);
 for(const child of node.children||[])imageSources(child,result);
 return result;
}
export function bounded(promise,ms){
 return new Promise(resolve=>{const timer=setTimeout(resolve,ms);Promise.resolve(promise).catch(()=>{}).finally(()=>{clearTimeout(timer);resolve();});});
}
function warmImage(src,priority){
 if(images.has(src)){const entry=images.get(src);if(priority==='high')entry.image.fetchPriority='high';return entry.promise;}
 const image=new Image();image.fetchPriority=priority;image.decoding='async';
 const entry={image,promise:null};
 entry.promise=new Promise(resolve=>{
  const finish=success=>{clearTimeout(timer);image.onload=null;image.onerror=null;if(!success)images.delete(src);resolve();};
  const timer=setTimeout(()=>finish(false),7000);
  image.onload=()=>image.decode().catch(()=>{}).then(()=>finish(true));
  image.onerror=()=>finish(false);image.src=src;
 });
 images.set(src,entry);return entry.promise;
}
async function sourcesFor(path,all=false){
 if(path==='/'){
  const [{default:data}]=await Promise.all([import('../generated/motion.json'),import('../MotionExperience')]);
  // The frozen next-content canvas is replaced by the new delivered-screen demo.
  const opening={children:data.tree.children.filter(node=>node.props?.id!=='next-content')};
  return [...imageSources(opening),'/motion-assets/remi-standing.png',...Object.keys(overviewScreens).map(overviewAsset)];
 }
 if(path==='/video/'){
  const {default:data}=await import('../generated/pages/video.json');
  return all?[...imageSources(data.tree)].map(videoWebSource):videoEntrySources([...imageSources(data.tree)]);
 }
 if(path==='/remi-ai/'){
  await import('./RemiStudio');
  return ['remi-thinking','plugin-routine','plugin-exercise','plugin-feedback','plugin-food'].map(id=>`/concept/experience/${id}.webp`);
 }
 if(path==='/features/'){
  const [{featureAssets}]=await Promise.all([import('./preload-assets'),import('../concept/experience/Experience')]);
  return [...featureAssets,'https://static.toss.im/assets/toss-im/asset/shopping/phone-frame.png'];
 }
 return [];
}
export function warmRoute(path,priority='low'){
 if(!currentRoutes.includes(path))return Promise.resolve();
 if(routes.has(path))return routes.get(path);
 const job=(async()=>{
  const queue=[...new Set(await sourcesFor(path))];
  // Limit background decoding/network pressure instead of starting every asset at once.
  await Promise.all(Array.from({length:3},async()=>{while(queue.length)await warmImage(queue.shift(),priority);}));
 })();
 routes.set(path,job);
 job.catch(()=>{}).finally(()=>routes.delete(path));
 return job;
}

export function scheduleBackgroundWarm(router){
 let stopped=false,started=false,idle,observer;
 const start=()=>{
  if(stopped||started||document.hidden)return;
  if(document.querySelector('[data-react-motion]:not([data-ready]),.home-opening-loading')){
   observer?.disconnect();observer=new MutationObserver(start);
   observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-ready']});return;
  }
  observer?.disconnect();started=true;
  idle=window.requestIdleCallback?.(run,{timeout:1500})??setTimeout(run,0);
 };
 const run=async()=>{
  if(stopped)return;
  const connection=navigator.connection;
  if(connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType||''))return;
  for(const path of currentRoutes){
   if(stopped)return;
   if(path===location.pathname)continue;
   router.prefetch(path);
   await warmRoute(path).catch(()=>{});
  }
 };
 const visible=()=>{if(!document.hidden)start();};
 document.addEventListener('visibilitychange',visible);
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
 return()=>{stopped=true;observer?.disconnect();window.removeEventListener('load',start);document.removeEventListener('visibilitychange',visible);if(window.cancelIdleCallback)window.cancelIdleCallback(idle);clearTimeout(idle);};
}

let startup;
const progressListeners=new Set();
let startupProgress=0;
// One shared image/font job survives React development remounts. Video loads on its page.
export function warmAllAssets(router,onProgress){
 progressListeners.add(onProgress);onProgress(startupProgress);
 if(!startup)startup=(async()=>{
  currentRoutes.forEach(path=>router.prefetch(path));
  const sets=await Promise.allSettled(currentRoutes.map(path=>sourcesFor(path,true)));
  const sources=[...new Set(['/brand/spotme-logo-a1.png',...sets.flatMap(item=>item.status==='fulfilled'?item.value:[])])];
  let done=0;
  const fontFiles=['Pretendard-Regular.otf','Pretendard-Medium.ttf','Pretendard-SemiBold.otf','Pretendard-Bold.otf','Pretendard-ExtraBold.otf'];
  const jobs=sources.map(src=>()=>warmImage(src,'high'));
  jobs.push(...fontFiles.map(file=>()=>fetch('/assets/fonts/'+file,{cache:'force-cache'}).then(response=>response.arrayBuffer())));
  jobs.push(()=>fetch('/motion-assets/fonts/Strelka Ultra.otf',{cache:'force-cache'}).then(response=>response.arrayBuffer()));
  const total=jobs.length;
  await Promise.all(Array.from({length:6},async()=>{while(jobs.length){const job=jobs.shift();try{await job();}catch{}finally{startupProgress=++done/total;for(const listener of progressListeners)listener(startupProgress);}}}));
  await bounded(Promise.allSettled([document.fonts.ready,...[400,500,600,700,800].map(weight=>document.fonts.load(`${weight} 16px SpotExperience`))]),3000);
 })();
 const unsubscribe=()=>progressListeners.delete(onProgress);unsubscribe.ready=startup;return unsubscribe;
}
