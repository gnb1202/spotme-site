import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {backgroundLayout} from '../src/integration/home-background-preview.js';
for(const [w,h] of [[1920,900],[2560,1080],[1440,900],[390,844]]){
  const a=backgroundLayout(w,h);
  assert.equal(a.top,0);assert(a.width>=w+3.99&&a.height>=h,'Background covers both viewport dimensions with bleed');
  assert.equal(a.heroScale,Math.min(1,w/1920,h/1080),'Foreground size must not change');
}
const source=await readFile(new URL('../src/integration/home-background-preview.js',import.meta.url),'utf8');
assert(!source.includes('location.search'),'Old B links cannot override approved top alignment');
const component=await readFile(new URL('../src/MotionExperience.jsx',import.meta.url),'utf8');
assert(!component.includes('BackgroundTweak'),'No A/B controls remain');
console.log('PASS: fixed top alignment, full width, unchanged foreground, no query override or tweak');
