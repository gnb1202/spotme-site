import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const out=import.meta.dirname,root=path.dirname(out);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function files(dir){const result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
const protectedRoots=['a','b','scroll','../public'];
const fingerprints={};
for(const dir of protectedRoots)for(const file of await files(path.resolve(root,dir)))fingerprints[path.relative(root,file)]=hash(await fs.readFile(file));
await fs.mkdir(path.join(out,'reports'),{recursive:true});
const baseline=path.join(out,'reports/preserved-before.json');
try{await fs.access(baseline);}catch{await fs.writeFile(baseline,JSON.stringify(fingerprints,null,2));}
const runtime=await fs.readFile(path.join(out,'timeline.js'),'utf8');
for(const [target,source] of [['composition','a'],['web','scroll']]){
  const dir=path.join(out,target);await fs.mkdir(dir,{recursive:true});
  await fs.cp(path.join(root,source,'assets'),path.join(dir,'assets'),{recursive:true});
  await fs.copyFile(path.join(root,source,'gsap.min.js'),path.join(dir,'gsap.min.js'));
  let html=await fs.readFile(path.join(root,source,'index.html'),'utf8');
  const marker='/* One finite paused timeline;';const start=html.indexOf(marker),end=html.indexOf('</script>',start);
  if(start<0||end<0)throw Error('Unknown source composition structure');
  html=html.slice(0,start)+runtime+html.slice(end);
  html=html.replaceAll('data-composition-id="spotme-a"','data-composition-id="spotme-brag"').replaceAll('data-duration="4.5"','data-duration="5"');
  html=html.replace(/<title>.*?<\/title>/,'<title>SPOT ME · BRAG 5초 로컬 시안</title>');
  html=html.replace('</style>','\n#poster-title,#mirror-stage{opacity:0}\n</style>');
  if(target==='web'){
    html=html.replace('href="../tweak.html">Tweak','href="../">A/B/새 시안 비교');
    let live=await fs.readFile(path.join(root,'tools/scroll.js'),'utf8');
    live=live.replace("['spotme-scroll']","['spotme-brag']").replace('totalTime(4.5,true)','totalTime(intro.duration(),true)');
    await fs.writeFile(path.join(dir,'scroll.js'),live);
  }
  await fs.writeFile(path.join(dir,'index.html'),html);
}
await fs.writeFile(path.join(out,'reports/source-contract.json'),await fs.readFile(path.join(root,'reports/source-contract.json')));
await fs.writeFile(path.join(out,'reports/scroll-assets.json'),await fs.readFile(path.join(root,'reports/scroll-assets.json')));
await fs.writeFile(path.join(out,'share-copy.txt'),'SPOT ME MY WORKOUT\n');
// Reuse proven interaction cases against the isolated copy, never regenerate old A/B.
let test=await fs.readFile(path.join(root,'tools/verify-scroll.mjs'),'utf8');
test=test.replaceAll('http://127.0.0.1:4186/scroll/','http://127.0.0.1:4186/'+path.basename(out)+'/web/');
await fs.writeFile(path.join(out,'verify-scroll.mjs'),test);
let cue=await fs.readFile(path.join(root,'tools/verify-cue.mjs'),'utf8');
cue=cue.replaceAll('http://127.0.0.1:4186/scroll/','http://127.0.0.1:4186/'+path.basename(out)+'/web/');
await fs.writeFile(path.join(out,'verify-cue.mjs'),cue);
console.log('Built isolated composition + web; protected files fingerprinted:',Object.keys(fingerprints).length);
