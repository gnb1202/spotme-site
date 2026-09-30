import assert from 'node:assert/strict';
import {fitVideo} from '../src/integration/video-fit.js';
for(const [w,h,header,canvasTop] of [[1920,1080,115,0],[1905,900,115,0],[1265,720,76,0],[1009,768,72,0],[375,812,100,100],[1920,650,115,0]]){
  const titleBottom=canvasTop+270*w/1920;
  const r=fitVideo({canvasWidth:w,canvasTop,viewportHeight:h,headerHeight:header,titleBottom});
  assert(Math.abs(r.width/r.height-1840/1036)<1e-10,'Original ratio is preserved');
  assert(r.screenTop+r.height<h,'Complete player fits above viewport bottom');
  assert(r.screenTop>header&&r.screenTop>titleBottom,'Clear of header and title');
  assert(r.width<=w&&r.width<=1280&&r.scale<=1,'No cropping or enlargement');
  assert(Math.abs(r.left*w/1920-(w-r.width)/2)<1e-8,'Centered');
  const start=Math.max(header,titleBottom,canvasTop);
  assert(Math.abs((r.screenTop-start)-(h-r.screenTop-r.height))<1e-8,'Top and bottom clear space must be equal');
  assert(r.screenTop-start>=(w<700?24:40)-1e-8,'More breathing room beneath the title');
}
console.log('PASS: full player visible on entry, original ratio, centered, uniform downscale');
