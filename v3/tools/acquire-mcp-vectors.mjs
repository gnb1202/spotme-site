import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const context=await fs.readFile('designs/context/112-577.txt','utf8'),base=context.match(/assetPathPrefix = "([^"]+)"/)[1];
const manifest=JSON.parse(await fs.readFile('designs/assets.json')),raw=JSON.parse(await fs.readFile('designs/figma-data.json'));
const nodes=new Map();function walk(n){nodes.set(n.id,n);n.children?.forEach(walk)}Object.values(raw.nodes).forEach(x=>walk(x.document));
for(const [id,file,kind] of [['112:723','0095d.svg','mcp-vector'],['112:721','e6938.svg','mcp-mask']]){
 const path=`assets/figma-v3/${id.replace(':','-')}.svg`,r=await fetch(base+'/'+file);if(!r.ok)throw new Error(`MCP SVG ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile('public/'+path,bytes);const n=nodes.get(id),b=n.absoluteBoundingBox;
 const record={id,name:n.name,kind,path,bounds:b,render:b,pixelWidth:b.width,pixelHeight:b.height,sha256:createHash('sha256').update(bytes).digest('hex'),sourceContext:'designs/context/112-577.txt'};
 if(kind==='mcp-mask')manifest.masks=[record];else manifest.assets.push(record);
}
await fs.writeFile('designs/assets.json',JSON.stringify(manifest,null,2));
