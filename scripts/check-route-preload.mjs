import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {bounded,currentRoutes,imageSources,scheduleBackgroundWarm} from '../src/integration/route-preload.js';

assert.deepEqual(currentRoutes,['/','/features/','/remi-ai/','/video/']);
const tree={children:[{tag:'img',props:{src:'/hero.webp'}},{tag:'img',props:{src:'/hero.webp'}},{tag:'video',props:{src:'/videos/large.mp4'}},{tag:'iframe',props:{src:'https://youtube.com'}},'text']};
assert.deepEqual([...imageSources(tree)],['/hero.webp'],'Deduplicate artwork, never preload media');
for(const name of ['home','video']){
 const data=JSON.parse(await readFile(new URL(`../src/generated/pages/${name}.json`,import.meta.url)));
 for(const src of imageSources(data.tree))assert(!/\.(mp4|webm)(\?|$)/.test(src));
}
await bounded(Promise.reject(Error('offline')),20);
await bounded(new Promise(()=>{}),20);
const jobs=[];let prefetches=0;
globalThis.document={hidden:false,readyState:'complete',querySelector:()=>null,addEventListener(){},removeEventListener(){}};
globalThis.window={requestIdleCallback:fn=>{jobs.push(fn);return jobs.length;},cancelIdleCallback(){},removeEventListener(){}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{connection:{saveData:true}}});
const dispose=scheduleBackgroundWarm({prefetch(){prefetches++;}});
await jobs.shift()();assert.equal(prefetches,0,'Data saver avoids eager network work');dispose();
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{connection:{}}});
const cancel=scheduleBackgroundWarm({prefetch(){prefetches++;}});cancel();
await jobs.shift()();assert.equal(prefetches,0,'Unmount cancels queued background work');
delete globalThis.document;delete globalThis.window;
console.log('PASS: current-tab allowlist, artwork deduplication, media exclusion, bounded failures, data saver, cancellation');
