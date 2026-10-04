import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {mainNavigation,demoVideo} from '../src/integration/navigation.js';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const origin=process.argv[2]||'http://127.0.0.1:4189';
assert.deepEqual(mainNavigation.map(x=>x.label),['홈','기능','레미 AI','시연 영상']);
assert.equal(demoVideo.src,'/videos/spotme-site-demo-web-crf20.mp4');
assert.equal(demoVideo.type,'video/mp4');
const videoFile=await stat(new URL('../public'+demoVideo.src,import.meta.url));
assert(videoFile.size>0);
const media=await fetch(origin+demoVideo.src,{headers:{Range:'bytes=0-23'}});
assert.equal(media.status,206,'MP4 must support seeking via range requests');
assert(media.headers.get('content-type').includes('video/mp4'));
assert.equal((await media.arrayBuffer()).byteLength,24);
for(const route of mainNavigation.map(x=>x.href)){
 const response=await fetch(origin+route);assert.equal(response.status,200,route);
 const html=await response.text();assert(html.includes('주요 메뉴'),route+' navigation');
 if(route==='/features/')assert(html.includes('운동을 이어가는 일은'));
 if(route==='/remi-ai/'){assert(html.includes('remi-demo-phone'));for(const name of ['루틴 생성','운동 추천','기록 피드백','식단 추천'])assert(html.includes(name));}
 if(route==='/video/'){assert(html.includes('시연 영상'));assert(!html.includes('<iframe')&&!html.includes('<video'),'Video must wait for user activation');}
}
const figmaText=await read('../design-reference/figma-data.json');
const source=JSON.parse(await read('../design-reference/source.json'));
assert.equal(createHash('sha256').update(figmaText).digest('hex'),source.sha256,'Frozen Figma data changed');
const figma=JSON.parse(figmaText);
const find=(node,id,key='id')=>node[key]===id?node:(node.children||[]).map(child=>typeof child==='object'?find(child,id,key):null).find(Boolean);
const results=[];
for(const [page,frame,ids] of [['home','20:127',['205:3','254:244','20:200']],['video','145:215',['254:38','256:615']]]){
 const generated=JSON.parse(await read(`../src/generated/pages/${page}.json`));
 function locate(n,id){if(n.props?.['data-source-node-id']===id)return n;return(n.children||[]).map(c=>typeof c==='object'?locate(c,id):null).find(Boolean);}
 for(const id of ids){
  const expected=find(figma.nodes[frame].document,id).absoluteBoundingBox;
  const root=figma.nodes[frame].document.absoluteBoundingBox;
  const actual=locate(generated.tree,id).props.style;
  const deltas=[Math.abs(parseFloat(actual.left)-(expected.x-root.x)),Math.abs(parseFloat(actual.top)-(expected.y-root.y)),Math.abs(parseFloat(actual.width)-expected.width),Math.abs(parseFloat(actual.height)-expected.height)];
  assert(Math.max(...deltas)<.01,id+' geometry changed');
  results.push({page,id,maxDeltaPx:Math.max(...deltas)});
 }
}
const runtime=await read('../src/generated/scroll-runtime.js');
assert(runtime.includes("document.body.classList.remove('pinned')")&&runtime.includes('history.scrollRestoration=restoration'));
const embed=await read('../src/integration/DemoVideo.jsx');
assert(embed.includes('controls playsInline autoPlay preload="metadata"')&&embed.includes('onError='));
assert(!embed.includes('youtube'));
console.log(JSON.stringify({result:'PASS',routes:4,frozenFigmaSha256:source.sha256,sourceGeometry:results,scope:'Source contract and HTTP checks; live DOM and visual checks recorded separately.'},null,2));
