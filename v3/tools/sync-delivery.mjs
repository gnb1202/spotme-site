// Canonical asset source is the user's extracted delivery in this repository.
// Match bytes/image hashes, never guess by filename. No network access.
import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
const root=path.resolve('../스팟미_웹사이트_260925_v1'),manifest=JSON.parse(await fs.readFile('designs/assets.json')),audit=JSON.parse(await fs.readFile('designs/delivery-audit.json')),raw=JSON.parse(await fs.readFile('designs/figma-data.json'));
const refs=new Map(),nodes=new Map();function walk(n){nodes.set(n.id,n);for(const f of n.fills??[])if(f.type==='IMAGE'){const list=refs.get(f.imageRef)??[];list.push(n.id);refs.set(f.imageRef,list)}n.children?.forEach(walk)}Object.values(raw.nodes).forEach(x=>walk(x.document));
const mapping=new Map([...audit.sha1Matches,...audit.matches].map(m=>[m.imageRef,m.delivery.replaceAll('\\','/')]));
const overrides=JSON.parse(await fs.readFile('designs/delivery-overrides.json'));
for(const o of overrides.mappings){const matches=audit.local.filter(l=>path.basename(l.path)===o.file);if(matches.length!==1)throw new Error('Ambiguous delivery '+o.file);mapping.set(o.imageRef,path.relative(root,matches[0].path).replaceAll('\\','/'));}
manifest.delivery=[];manifest.deliveryNodeOverrides=[];
for(const [imageRef,relative] of mapping){
 const source=path.resolve(root,relative);if(!source.startsWith(root+path.sep))throw new Error('Out of scope delivery path');
 const local=audit.local.find(l=>l.path===source);if(!local)throw new Error('Missing delivery inventory '+relative);
 const bytes=await fs.readFile(source),sha256=createHash('sha256').update(bytes).digest('hex');if(sha256!==local.sha256)throw new Error('Delivery changed since inspection '+relative);
 // ASCII, content-addressed deployment paths avoid Windows CLI Unicode-path
 // omissions. Keep the original Korean filename in sourcePath for auditing.
 const assetPath='assets/delivery-260925/'+sha256+'.png';await fs.mkdir(path.dirname('public/'+assetPath),{recursive:true});await fs.copyFile(source,'public/'+assetPath);
 const record={imageRef,nodeIds:refs.get(imageRef),path:assetPath,sourcePath:'../스팟미_웹사이트_260925_v1/'+relative,sha256,pixelWidth:local.width,pixelHeight:local.height,format:'png',match:overrides.mappings.some(o=>o.imageRef===imageRef)?'inspected same artwork / different raster size':'identical image hash'};
 manifest.delivery.push(record);
 const transform=overrides.mappings.find(o=>o.imageRef===imageRef);
 const existing=manifest.fills.find(f=>f.imageRef===imageRef);if(existing){if(existing.kind==='local-delivery'){existing.path=assetPath;existing.sha256=sha256;}existing.deliveryPath=assetPath;existing.deliverySource=record.sourcePath;existing.deliverySha256=sha256;existing.deliveryRegistration=transform?.registration;existing.deliveryRotation=transform?.rotation;}else manifest.fills.push({...record,kind:'local-delivery'});
 for(const id of refs.get(imageRef)??[]){const n=nodes.get(id);if(manifest.assets.some(a=>a.id===id)&&!n.children?.length)manifest.deliveryNodeOverrides.push(id);}
}
manifest.deliveryRoot='../스팟미_웹사이트_260925_v1';
manifest.deliveryExceptions=overrides.exceptions;
manifest.fallbacks={fills:manifest.fills.filter(f=>!mapping.has(f.imageRef)).map(f=>({imageRef:f.imageRef,path:f.path,reason:overrides.exceptions.find(e=>e.imageRef===f.imageRef)?.reason??'No matching delivered PNG. Retain frozen same-version Figma fill.'})),nodeExports:manifest.assets.filter(a=>!manifest.deliveryNodeOverrides.includes(a.id)&&!manifest.composedPhones?.includes(a.id)).map(a=>({id:a.id,path:a.path,name:a.name,reason:'Source vector or no matching delivered standalone artwork. Retain same-version Figma export.'}))};
await fs.writeFile('designs/assets.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({deliveryFiles:manifest.delivery.length,standaloneNodeOverrides:manifest.deliveryNodeOverrides.length,figmaFillFallbacks:manifest.fallbacks.fills.length,figmaCompositeFallbacks:manifest.fallbacks.nodeExports.length}));
