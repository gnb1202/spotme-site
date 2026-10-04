import {copyFileSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const delivery=resolve(root,'design-reference/assets/delivery-260925');
const destination=resolve(import.meta.dirname,'../public/concept/assets');
const assets={
  logo:'01_로고/스팟미_로고_B.png',
  remi:'03_오브젝트/@_캐릭터/01_레미/레미_홈A_01.png',
  routine:'@_UI패턴/1_운동_AI추천운동.png',
  chat:'@_UI패턴/1_운동 - 운동진행3-4B.png',
  report:'@_UI패턴/3_리포트2.png',
  profile:'@_UI패턴/운동수준2C.png',
  ready:'@_UI패턴/운동루틴준비2.png',
  workout:'@_UI패턴/1_운동_c_01.png',
  quest:'@_UI패턴/1_운동_퀘스트_주간퀘스트_조건달성.png',
  ranking:'@_UI패턴/4_랭킹_이번달.png',
  gym:'@_UI패턴/1_운동_헬스장키우기.png',
};
mkdirSync(destination,{recursive:true});
const manifest=Object.entries(assets).map(([id,file])=>{
  const source=resolve(delivery,file),target=resolve(destination,id+'.png');
  copyFileSync(source,target);
  const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
  if(hash(source)!==hash(target))throw Error('Asset mismatch: '+id);
  return {id,source:'design-reference/assets/delivery-260925/'+file,path:'/concept/assets/'+id+'.png',sha256:hash(source),kind:'delivered-design-screen-or-artwork',runtimeVerified:false};
});
writeFileSync(resolve(destination,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Verified ${manifest.length} unmodified delivered assets.`);
