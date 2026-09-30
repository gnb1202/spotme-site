// Finish acquisition using ORIGINAL fills from the same newly frozen Figma file.
// Node export quota is exhausted. Never substitute old project assets.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('sharp');
const raw=JSON.parse(await fs.readFile('designs/figma-data.json')),source=JSON.parse(await fs.readFile('designs/source.json')),urls=JSON.parse(await fs.readFile('designs/image-fill-urls.json')).meta.images;
const assets=[],fills=new Map(),frames=Object.entries(raw.nodes).map(([id,{document:n}])=>({id,name:n.name,bounds:n.absoluteBoundingBox,render:n.absoluteRenderBounds}));
async function walk(n){
 if(n.visible===false||n.absoluteRenderBounds===null)return;
 const path=`public/assets/figma-v3/${n.id.replace(':','-')}.png`;
 try{const bytes=await fs.readFile(path),m=await sharp(bytes).metadata();assets.push({id:n.id,name:n.name,kind:'node-export',bounds:n.absoluteBoundingBox,render:n.absoluteRenderBounds,path:path.replace('public/',''),pixelWidth:m.width,pixelHeight:m.height,sha256:createHash('sha256').update(bytes).digest('hex'),fillBlend:n.fills?.find(f=>f.type==='IMAGE')?.blendMode??'NORMAL'});return;}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const f of n.fills??[])if(f.visible!==false&&f.type==='IMAGE'){const item=fills.get(f.imageRef)??{imageRef:f.imageRef,nodeIds:[],path:`assets/figma-v3/fill-${f.imageRef}.png`};item.nodeIds.push(n.id);fills.set(f.imageRef,item);}
 for(const c of n.children??[])await walk(c);
}
for(const {document:n} of Object.values(raw.nodes))for(const c of n.children)await walk(c);
const queue=[...fills.values()];let done=0;await Promise.all(Array.from({length:5},async()=>{while(queue.length){const f=queue.shift(),path='public/'+f.path;let bytes;try{bytes=await fs.readFile(path)}catch{if(!urls[f.imageRef])throw new Error('Missing image '+f.imageRef);const r=await fetch(urls[f.imageRef]);if(!r.ok)throw new Error(`Fill download ${r.status}`);bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile(path,bytes)}const m=await sharp(bytes).metadata();Object.assign(f,{sha256:createHash('sha256').update(bytes).digest('hex'),pixelWidth:m.width,pixelHeight:m.height,format:m.format});console.log(`Original fill ${++done}/${fills.size}`)}}));
for(const f of frames){try{const path=`designs/reference/${f.id.replace(':','-')}.png`,bytes=await fs.readFile(path),m=await sharp(bytes).metadata();Object.assign(f,{path,pixelWidth:m.width,pixelHeight:m.height,sha256:createHash('sha256').update(bytes).digest('hex'),referenceKind:'MCP thumbnail — NOT native-resolution verification'})}catch{f.referenceKind='Unavailable: MCP and export quota exceeded'}}
await fs.writeFile('designs/assets.json',JSON.stringify({source,assets,fills:[...fills.values()],frames,limitation:'Native node export HTTP429, Retry-After399545seconds. Original fills downloaded from this same file; no old assets. Only nine MCP thumbnail references available.'},null,2));
console.log(JSON.stringify({nodeExports:assets.length,originalFills:fills.size}));
