// Read the already-frozen MCP context; never request a new Figma snapshot.
import fs from 'node:fs/promises';import {createHash} from 'node:crypto';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('designs/assets.json')),raw=JSON.parse(await fs.readFile('designs/figma-data.json'));
const nodes=new Map();function walk(n){nodes.set(n.id,n);n.children?.forEach(walk)}Object.values(raw.nodes).forEach(x=>walk(x.document));
const id='112:690',file='assets/figma-v3/112-690.svg';
if(!manifest.assets.some(a=>a.id===id)){
 const context=await fs.readFile('designs/context/112-577.txt','utf8');
 const prefix=context.match(/const assetPathPrefix = "([^"]+)"/)[1],suffix=context.match(/const imgVector1 = `\$\{assetPathPrefix\}([^`]+)`/)[1];
 const response=await fetch(prefix+suffix);if(!response.ok)throw new Error('Cached vector download '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());if(!bytes.toString().includes('<svg'))throw new Error('Expected SVG');
 await fs.writeFile('public/'+file,bytes);const n=nodes.get(id),b=n.absoluteRenderBounds;
 manifest.assets.push({id,name:n.name,path:file,bounds:n.absoluteBoundingBox,render:b,pixelWidth:b.width,pixelHeight:b.height,sha256:createHash('sha256').update(bytes).digest('hex'),sourceContext:'designs/context/112-577.txt',kind:'mcp-vector'});
}
manifest.composedPhones=manifest.assets.filter(a=>/iphone/i.test(a.name)).map(a=>a.id);
const screenRef=nodes.get('145:146').fills.find(f=>f.type==='IMAGE').imageRef;
if(!manifest.fills.some(f=>f.imageRef===screenRef)){
 const context=await fs.readFile('designs/context/112-577.txt','utf8'),prefix=context.match(/const assetPathPrefix = "([^"]+)"/)[1],suffix=context.match(/const imgPlaceholder1 = `\$\{assetPathPrefix\}([^`]+)`/)[1];
 const response=await fetch(prefix+suffix);if(!response.ok)throw new Error('Cached screen '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer()),meta=await sharp(bytes).metadata(),file='assets/figma-v3/fill-'+screenRef+'.png';await fs.writeFile('public/'+file,bytes);
 manifest.fills.push({imageRef:screenRef,path:file,pixelWidth:meta.width,pixelHeight:meta.height,sha256:createHash('sha256').update(bytes).digest('hex'),sourceContext:'designs/context/112-577.txt',kind:'mcp-original-fill'});
}
await fs.writeFile('designs/assets.json',JSON.stringify(manifest,null,2));
console.log({composedPhones:manifest.composedPhones.length,vector:id});
