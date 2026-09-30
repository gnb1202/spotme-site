import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {videoAssetVariants} from '../src/integration/video-assets.js';
const root=path.resolve(import.meta.dirname,'..');
const report=[];
for(const item of videoAssetVariants){
 const input=path.join(root,'public',item.source),output=path.join(root,'public',item.web);
 const source=await fs.readFile(input),hash=createHash('sha256').update(source).digest('hex');
 if(path.parse(input).name!==hash)throw Error('Source hash mismatch: '+input);
 const metadata=await sharp(source).metadata();
 await fs.mkdir(path.dirname(output),{recursive:true});
 const result=await sharp(source).resize({width:item.width,withoutEnlargement:true}).webp({quality:85,alphaQuality:100,effort:5}).toFile(output);
 report.push({source:input,sha256:hash,output,width:result.width,height:result.height,sourceWidth:metadata.width,sourceHeight:metadata.height,sourceBytes:source.length,webBytes:result.size,webSha256:createHash('sha256').update(await fs.readFile(output)).digest('hex')});
}
await fs.writeFile(path.join(root,'reports/integration/video-web-assets.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
