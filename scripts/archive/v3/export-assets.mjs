import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const raw=JSON.parse(await fs.readFile('designs/figma-data.json')),source=JSON.parse(await fs.readFile('designs/source.json'));
const assets=[],frames=Object.entries(raw.nodes).map(([id,{document:n}])=>({id,name:n.name,bounds:n.absoluteBoundingBox,render:n.absoluteRenderBounds}));
function walk(n){
 if(n.visible===false||n.absoluteRenderBounds===null)return;
 if(n.type!=='TEXT'&&((n.fills??[]).some(f=>f.visible!==false&&f.type==='IMAGE')||/iphone/i.test(n.name)||['VECTOR','BOOLEAN_OPERATION','STAR','REGULAR_POLYGON'].includes(n.type))){
  assets.push({id:n.id,name:n.name,bounds:n.absoluteBoundingBox,render:n.absoluteRenderBounds??n.absoluteBoundingBox,blend:n.blendMode??'NORMAL',fillBlend:n.fills?.find(f=>f.type==='IMAGE')?.blendMode??'NORMAL'});return;
 }
 n.children?.forEach(walk);
}
Object.values(raw.nodes).forEach(x=>x.document.children.forEach(walk));
await fs.mkdir('public/assets/figma-v3',{recursive:true});await fs.mkdir('designs/reference',{recursive:true});
const headers={'X-Figma-Token':process.env.FIGMA_API_KEY};if(!headers['X-Figma-Token'])throw new Error('No Figma key');
async function api(ids){const r=await fetch(`https://api.figma.com/v1/images/${source.fileKey}?ids=${ids.join(',')}&format=png&scale=1&use_absolute_bounds=false`,{headers});if(!r.ok)throw new Error(`Export HTTP ${r.status}`);return (await r.json()).images}
const jobs=[...assets.map(a=>({a,path:`public/assets/figma-v3/${a.id.replace(':','-')}.png`})),...frames.map(a=>({a,path:`designs/reference/${a.id.replace(':','-')}.png`}))];
let cached={};try{cached=JSON.parse(await fs.readFile('designs/export-urls.json'))}catch{}
function metadata(job,bytes){Object.assign(job.a,{path:job.path.replace(/^public\//,''),sha256:createHash('sha256').update(bytes).digest('hex'),pixelWidth:bytes.readUInt32BE(16),pixelHeight:bytes.readUInt32BE(20)});}
const pending=[];for(const job of jobs){try{const bytes=await fs.readFile(job.path);if(bytes.length<24)throw new Error('Incomplete');metadata(job,bytes)}catch{pending.push(job)}}
console.log(`${jobs.length} exports; ${pending.length} remaining`);
for(let i=0;i<pending.length;i+=30){
 const group=pending.slice(i,i+30),missing=group.filter(j=>!cached[j.a.id]);
 if(missing.length){Object.assign(cached,await api(missing.map(j=>j.a.id)));await fs.writeFile('designs/export-urls.json',JSON.stringify(cached));}
 const queue=[...group];await Promise.all(Array.from({length:5},async()=>{while(queue.length){const job=queue.shift(),url=cached[job.a.id];if(!url)throw new Error('Missing export '+job.a.id);const r=await fetch(url);if(!r.ok)throw new Error(`Download ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile(job.path,bytes);metadata(job,bytes);}}));
 console.log(`Exported ${Math.min(i+30,pending.length)}/${pending.length}`);
}
await fs.writeFile('designs/assets.json',JSON.stringify({source,assets,frames},null,2));console.log(JSON.stringify({artwork:assets.length,references:frames.length}));
