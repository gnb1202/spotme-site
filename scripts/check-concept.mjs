import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {capabilities,benefits,journey} from '../src/concept/content.js';
const base=resolve(import.meta.dirname,'..');
const repo=base;
const manifest=JSON.parse(readFileSync(resolve(base,'public/concept/assets/manifest.json')));
for(const item of manifest){
  const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.equal(hash(resolve(repo,item.source)),item.sha256,item.id+' source hash');
  assert.equal(hash(resolve(base,'public'+item.path)),item.sha256,item.id+' published copy hash');
}
for(const group of [capabilities,benefits,journey]){
  assert.equal(group.length,3);
  for(const item of group){
    assert.ok(item.evidence&&item.note&&item.description);
    assert.ok(manifest.find(asset=>asset.id===item.id));
  }
}
for(const file of ['01-capabilities.png','02-benefits.png','03-journey.png','benefit-objects.png'])assert.ok(existsSync(resolve(base,'public/concept/generated',file)));
const origin=process.argv[2]||'http://127.0.0.1:4189';
for(const path of ['/concept/','/concept/review/']){
  const response=await fetch(origin+path);assert.equal(response.status,200,path);
  const html=await response.text();
  const titles=path==='/concept/'?['홈','기능','레미 AI','시연 영상']:['AI 운동 서포트','게임처럼 즐기는 운동','파트너 레미','홍보 영상'];
  for(const title of titles)assert.ok(html.includes(title),`${path}: ${title}`);
}
const main=await (await fetch(origin+'/concept/')).text();
const sectionIds=['overview','benefits','remi-sequence'];
const positions=sectionIds.map(id=>main.indexOf(`id="${id}"`));
positions.forEach((position,i)=>assert(position>=0,`Missing section ${sectionIds[i]}`));
assert(positions[0]<positions[1]&&positions[1]<positions[2],'Overview, benefits, then Remi journey');
for(const path of ['/','/ai/','/game/','/characters/','/video/'])assert.equal((await fetch(origin+path)).status,200,path);
console.log('PASS: 11 source/copy hashes, 9 content evidence mappings, 4 generated assets, reference section order, SSR content and 7 routes. Browser interaction tests are separate.');
