import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {mirrorFlight,projectMirror} from '../src/integration/mirror-depth.js';
assert.equal(projectMirror(0,0).scale,1,'First silhouette matches home size');
for(let i=0;i<mirrorFlight.count;i++){
  let passed=false,scale=0;
  for(let step=0;step<=1000;step++){
    const plane=projectMirror(i,step/1000);
    assert(Number.isFinite(plane.scale)&&plane.scale>0&&plane.scale<=7.5);
    assert(plane.opacity>=0&&plane.opacity<=1);
    assert(plane.scale>=scale,'Planes approach monotonically without reversing');scale=plane.scale;
    if(passed)assert.equal(plane.opacity,0,'No reappearance behind camera');
    if(plane.distance<=.24)passed=true;
  }
}
const near=projectMirror(0,.05).scale/projectMirror(0,0).scale;
const far=projectMirror(10,.05).scale/projectMirror(10,0).scale;
assert(near>far,'Near plane expands faster than far plane (not uniform zoom)');
assert(Array.from({length:18},(_,i)=>projectMirror(i,1)).filter(p=>p.distance<=.24).length>=10);
assert.deepEqual(projectMirror(5,0),projectMirror(5,0),'Replay is deterministic');
const runtime=await readFile(new URL('../src/integration/opening-depth.js',import.meta.url),'utf8');
assert(runtime.includes("tl.eventCallback('onStart',()=>{flight.progress=0;renderFlight();})"),'Reset SVG projection after a skip/seek');
assert(!runtime.includes('requestAnimationFrame')&&!runtime.includes('repeat:-1'),'No idle render loop');
assert(runtime.includes("tl.fromTo(byId('mirror-ring-0'),{opacity:0}"),'Hero outline fades in rather than popping');
assert(!runtime.includes("tl.set(ring.querySelectorAll('path')"),'Echo contours must draw progressively');
assert(runtime.includes("const drawStart=study.variant==='b'?.98:1.1"),'Remi drawing overlaps the title ending at 1.25s');
assert.equal((runtime.match(/autoRound:false/g)||[]).length,3,'All normalized 0–1 stroke tweens retain fractional values');
console.log('PASS: perspective depth, sequential passage, bounded projection, no recycled planes');
