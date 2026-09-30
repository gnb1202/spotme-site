import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const site=resolve(import.meta.dirname,'../../..');
const app=resolve(site,'../SpotMe/스팟미_260920_v1');
const delivery=resolve(site,'스팟미_웹사이트_260925_v1');
const output=resolve(import.meta.dirname,'../public/concept/experience');
const sources={
 'cheese':[app,'02-3_아이콘-운동/아이콘_인앱재화.png',180],
 'remi-front':[app,'03_캐릭터/01_레미-공용/레미_front.png',600],
 'remi-thinking':[app,'03_캐릭터/04_레미-레미AI/레미_레미AI_05.png',400],
 'plugin-routine':[app,'02-4_아이콘-레미AI/아이콘_레미ai_플러그인_01.png',100],
 'plugin-exercise':[app,'02-1_아이콘-공용/아이콘_운동_color.png',100],
 'plugin-feedback':[app,'02-4_아이콘-레미AI/아이콘_레미ai_플러그인_03.png',100],
 'plugin-food':[app,'02-4_아이콘-레미AI/아이콘_레미ai_플러그인_04.png',100],
 'bench':[app,'02-3_아이콘-운동/01_운동-운동목록/@_원본/01_가슴/가슴_바벨-벤치프레스.png',240],
 'part-chest-active':[app,'02-3_아이콘-운동/02_운동-운동부위/아이콘_운동_운동부위_가슴_선택후.png',180],
 'ai-mark':[app,'02-3_아이콘-운동/아이콘_운동_AI추천운동_알림.png',160],
 'voice':[app,'02-1_아이콘-공용/아이콘_호출버튼.png',100],
 'listening':[app,'03_캐릭터/01_레미-공용/레미_음성활성화.png',320],
 'platform':[app,'05_운동/04_운동진행/운동_필드.png',400],
 'battle-bg':[resolve(site,'../SpotMe/frontend/assets/0920_v1/retained/ui/battle'),'background.jpg',800],
 'monster-hit':[app,'03_캐릭터/05_몬스터/몬스터_의욕고갈형1_사망.png',400],
 'fighter-hit':[app,'03_캐릭터/03_레미-운동/레미_운동진행_03.png',400],
 'fighter-complete':[app,'03_캐릭터/03_레미-운동/레미_루틴완료.png',400],
 'part-chest':[app,'02-3_아이콘-운동/02_운동-운동부위/아이콘_운동_운동부위_가슴_선택전.png',160],
 'part-back':[app,'02-3_아이콘-운동/02_운동-운동부위/아이콘_운동_운동부위_등_선택전.png',160],
 'part-shoulder':[app,'02-3_아이콘-운동/02_운동-운동부위/아이콘_운동_운동부위_어깨_선택전.png',160],
 'like':[app,'05_운동/03_AI추천운동/아이콘_좋아요.png',80],
 'dislike':[app,'05_운동/03_AI추천운동/아이콘_싫어요.png',80],
 'row':[app,'02-3_아이콘-운동/01_운동-운동목록/@_원본/02_등/등_바벨_바벨로우.png',200],
 'press':[app,'02-3_아이콘-운동/01_운동-운동목록/@_원본/04_어깨/어깨_덤벨_덤벨숄더프레스.png',200],
 logo:[delivery,'01_로고/스팟미_로고_B.png',600],
 remi:[delivery,'03_오브젝트/@_캐릭터/01_레미/레미_홈A_01.png',900],
 coach:[delivery,'03_오브젝트/@_캐릭터/01_레미/레미_레미AI_01.png',400],
 fighter:[app,'03_캐릭터/03_레미-운동/레미_운동진행_01.png',400],
 monster:[app,'03_캐릭터/05_몬스터/몬스터_의욕고갈형1_일반.png',400],
 'gym-before':[app,'05_운동/02_헬스장키우기/헬스장_노멀_01.png',1200],
 'gym-after':[app,'05_운동/02_헬스장키우기/헬스장_노멀_02.png',1200],
 'gym-expanded':[app,'05_운동/02_헬스장키우기/헬스장_노멀_03.png',1200],
 'gym-rare':[app,'05_운동/02_헬스장키우기/헬스장_레어_01.png',1200],
 silver:[app,'07_프로필/01_티어/리포트_티어_04_silver.png',600],
 gold:[app,'07_프로필/01_티어/리포트_티어_05_gold.png',600],
 unranked:[app,'07_프로필/01_티어/리포트_티어_01_unranked.png',600],
 iron:[app,'07_프로필/01_티어/리포트_티어_02_iron.png',600],
 bronze:[app,'07_프로필/01_티어/리포트_티어_03_bronze.png',600],
 platinum:[app,'07_프로필/01_티어/리포트_티어_06_platinum.png',600],
 emerald:[app,'07_프로필/01_티어/리포트_티어_07_emerald.png',600],
 diamond:[app,'07_프로필/01_티어/리포트_티어_08_diamond.png',600],
 master:[app,'07_프로필/01_티어/리포트_티어_09_master.png',600],
 grandmaster:[app,'07_프로필/01_티어/리포트_티어_10_grandmaster.png',600],
 challenger:[app,'07_프로필/01_티어/리포트_티어_11_challanger.png',600],
 body:[app,'06_리포트/01_근육피로도/근육피로도_전면.png',320],
 pushup:[app,'02-3_아이콘-운동/01_운동-운동목록/@_원본/01_가슴/가슴_맨몸_푸쉬업.png',200],
 chest:[app,'02-3_아이콘-운동/01_운동-운동목록/@_원본/01_가슴/가슴_머신_체스트프레스머신.png',200],
 shoulder:[app,'02-3_아이콘-운동/01_운동-운동목록/@_원본/04_어깨/어깨_덤벨_덤벨래터럴레이즈.png',200],
};
await mkdir(output,{recursive:true});
for(const [i,label] of ['운동','레미AI','리포트','랭킹','프로필'].entries()){
 sources['nav-'+i]=[app,`02-1_아이콘-공용/01_내비게이션바/아이콘_내비바_0${i+1}_${label}-클릭${i===1?'후':'전'}.png`,100];
}
const hash=data=>createHash('sha256').update(data).digest('hex');
const manifest=[];
for(const [id,[root,file,width]] of Object.entries(sources)){
 const source=resolve(root,file),original=await readFile(source);
 const result=await sharp(original).resize({width,withoutEnlargement:true}).webp({quality:90}).toBuffer();
 const name=id+'.webp';await writeFile(resolve(output,name),result);
 const meta=await sharp(result).metadata();
 manifest.push({id,source,sourceSha256:hash(original),outputSha256:hash(result),path:'/concept/experience/'+name,width:meta.width,height:meta.height,bytes:result.length,transform:'proportional resize + WebP; no crop or generated replacement'});
}
await writeFile(resolve(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${manifest.length} source-verified assets; ${Math.round(manifest.reduce((n,a)=>n+a.bytes,0)/1024)} KB`);
