import assert from 'node:assert/strict';
import {gymRevealProgress,gymGrowthState,gymStages,shouldCelebrateGym} from '../src/concept/experience/gym-progress.js';
const atPosition=position=>gymGrowthState(.08+position/3*.66);
for(const p of [-1,0,.08])assert.equal(gymRevealProgress(p),0);
for(const p of [.75,.8,1,2])assert.equal(gymRevealProgress(p),1);
assert(gymRevealProgress(.62)<1,'Keep charging beyond the previous completion point');
assert.equal(gymGrowthState(.1515).percent,50,'Half charge takes 22% more scroll than before');
assert.deepEqual(gymStages.map(s=>s.asset),['gym-before','gym-after','gym-expanded','gym-rare']);
for(let cycle=0;cycle<3;cycle++){
 const start=atPosition(cycle+.01),half=atPosition(cycle+.325),full=atPosition(cycle+.7),evolving=atPosition(cycle+.875);
 assert.equal(start.index,cycle);
 assert(start.percent<5);
 assert.equal(half.percent,50);
 assert.equal(full.percent,100);
 assert.equal(full.layers[cycle+1],0,'Do not evolve before the meter reaches 100%');
 assert.equal(evolving.percent,100);
 assert(Math.abs(evolving.layers[cycle+1]-.5)<1e-10);
}
const final=gymGrowthState(1);
assert.equal(final.index,3);assert.equal(final.percent,100);assert.equal(final.wallet,0);
assert.deepEqual(final.layers,[1,1,1,1]);
const forward=Array.from({length:301},(_,i)=>gymGrowthState(i/300));
assert.deepEqual(Array.from({length:301},(_,i)=>gymGrowthState((300-i)/300)),[...forward].reverse());
for(const s of forward){assert(s.wallet>=0&&s.wallet<=350);assert(s.percent>=0&&s.percent<=100);}
console.log('PASS: three 0–100% cycles, evolve only after full, rare hold, wallet and reverse');
for(const [before,after] of [[0,1],[1,2],[2,3],[0,3]])assert(shouldCelebrateGym(before,after,true,false));
for(const [before,after,active,reduced] of [[1,1,true,false],[3,2,true,false],[0,1,false,false],[0,1,true,true]])assert(!shouldCelebrateGym(before,after,active,reduced));
console.log('PASS: growth effect only on forward evolution; no hold, reverse, inactive or reduced-motion bursts');
