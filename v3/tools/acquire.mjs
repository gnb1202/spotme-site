import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const fileKey='9gPp2ja89DZnz9q9Xr74wT';
const ids=['20:127','254:343','112:577','112:753','255:1085','255:1162','254:182','255:786','255:859','255:939','255:1012','145:215'];
await fs.mkdir('designs',{recursive:true});
try{await fs.access('designs/figma-data.json');throw new Error('Frozen source already exists; do not re-extract')}catch(e){if(e.code!=='ENOENT')throw e}
if(!process.env.FIGMA_API_KEY)throw new Error('FIGMA_API_KEY is missing');
const response=await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${ids.join(',')}`,{headers:{'X-Figma-Token':process.env.FIGMA_API_KEY}});
if(!response.ok)throw new Error(`Figma acquisition HTTP ${response.status}`);
const bytes=Buffer.from(await response.arrayBuffer()),raw=JSON.parse(bytes);
await fs.writeFile('designs/figma-data.json',bytes);
const meta={fileKey,acquiredAt:new Date().toISOString(),version:raw.version,lastModified:raw.lastModified,sha256:createHash('sha256').update(bytes).digest('hex'),frames:ids};
await fs.writeFile('designs/source.json',JSON.stringify(meta,null,2));
console.log(JSON.stringify(meta));
