// Secondary thumbnail diagnostic only. NOT the native-resolution Mimikyu gate.
import fs from 'node:fs/promises';import {createRequire} from 'node:module';import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url),sharp=require('sharp');
const manifest=JSON.parse(await fs.readFile('designs/assets.json')),pages=JSON.parse(await fs.readFile('designs/pages.json')),results=[];
for(const f of manifest.frames.filter(f=>f.path)){
 const p=pages.find(p=>p.frameId===f.id),dir=`reports/thumbnail/${p.slug}`;await fs.mkdir(dir,{recursive:true});
 // Remove only source overflow outside the 1920px page, never rescale the reference.
 const width=Math.round(f.pixelWidth*p.width/f.render.width),height=f.pixelHeight;
 await sharp(f.path).extract({left:0,top:0,width,height}).toFile(dir+'/reference.png');
 await sharp(`reports/captures/${p.slug}.png`).resize(width,height,{fit:'fill'}).toFile(dir+'/rendered.png');
 const r=spawnSync('python',['C:/Users/PC-CA/.mimikyu/scripts/compare.py',dir+'/reference.png',dir+'/rendered.png','--regions','--side-by-side','--output-dir',dir],{encoding:'utf8'});
 await fs.writeFile(dir+'/compare.txt',r.stdout+r.stderr);results.push({page:p.slug,width,height,scope:'THUMBNAIL ONLY — native pixel gate not run',output:r.stdout});console.log(p.slug,r.stdout.slice(0,240));
}
await fs.writeFile('reports/thumbnail/results.json',JSON.stringify(results,null,2));
