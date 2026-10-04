import fs from 'node:fs/promises';import sharp from 'sharp';import {execFile} from 'node:child_process';import {promisify} from 'node:util';
const exec=promisify(execFile),pages=JSON.parse(await fs.readFile('designs/pages.json')),results=[];
await fs.mkdir('reports/migration',{recursive:true});
for(const p of pages){const before=`reports/before-delivery/${p.slug}.png`,after=`reports/captures/${p.slug}.png`,a=await sharp(before).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(after).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(a.info.width!==b.info.width||a.info.height!==b.info.height)throw new Error('Dimensions changed '+p.slug);
 let different=0,overThreshold=0;for(let i=0;i<a.data.length;i+=4){let delta=0;for(let c=0;c<4;c++)delta=Math.max(delta,Math.abs(a.data[i+c]-b.data[i+c]));if(delta)different++;if(delta>30)overThreshold++;}
 const total=a.info.width*a.info.height,result={page:p.slug,width:a.info.width,height:a.info.height,exactMatch:100*(total-different)/total,threshold30Match:100*(total-overThreshold)/total,changedPixels:different,scope:'Before/after moving repository and replacing confirmed local artwork; NOT Figma fidelity'};
 if(different){const dir=`reports/migration/${p.slug}`;await fs.mkdir(dir,{recursive:true});const r=await exec('python',['C:/Users/PC-CA/.mimikyu/scripts/compare.py',before,after,'--regions','--output-dir',dir],{encoding:'utf8',maxBuffer:2000000});await fs.writeFile(dir+'/compare.txt',r.stdout+r.stderr);result.mimikyu=JSON.parse(r.stdout);}
 results.push(result);console.log(JSON.stringify({page:p.slug,exact:result.exactMatch,threshold30:result.threshold30Match}));
}await fs.writeFile('reports/migration/results.json',JSON.stringify(results,null,2));
