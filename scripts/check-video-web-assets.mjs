import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {videoAssetVariants,videoEntrySources} from '../src/integration/video-assets.js';
import {videoLayoutNode} from '../src/integration/video-layout.js';
import {imageSources} from '../src/integration/route-preload.js';
const data=JSON.parse(await fs.readFile(new URL('../src/generated/pages/video.json',import.meta.url),'utf8'));
const raw=[...imageSources(data.tree)],entry=videoEntrySources(raw);
for(const asset of videoAssetVariants){
 assert(raw.includes(asset.source),'Exact delivered source remains recorded');
 assert(!entry.includes(asset.source),'Original must not be warmed by the browser');
 assert.equal(entry.includes(asset.web),!asset.belowFold);
 const source=await fs.readFile(new URL('../public'+asset.source,import.meta.url));
 const web=await fs.readFile(new URL('../public'+asset.web,import.meta.url));
 const a=await sharp(source).metadata(),b=await sharp(web).metadata();
 assert.equal(b.width,asset.width);assert.equal(a.hasAlpha,b.hasAlpha);
 assert(Math.abs(a.width/a.height-b.width/b.height)<.001,'Aspect ratio preserved');
 assert(web.length<source.length*.25,'Substantial byte reduction');
 const node={tag:'img',props:{src:asset.source,style:{width:'900px',height:'1200px'}}};
 const result=videoLayoutNode(node);
 assert.equal(result.props.src,asset.web);assert.equal(result.props.style,node.props.style);
 assert.equal(result.props.loading,asset.belowFold?'lazy':'eager');
 assert.equal(node.props.src,asset.source,'Never mutate frozen source');
}
console.log('PASS: correct derivatives, preserved alpha/ratio/geometry, no original preloads');
