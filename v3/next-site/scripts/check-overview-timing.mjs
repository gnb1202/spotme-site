import assert from 'node:assert/strict';
import {overviewPhase} from '../src/concept/experience/overview-timing.js';
for(const [step,header] of [[720,80],[900,80],[844,100]]){
 const previousFromPageTop=Math.min(500,Math.max(320,step*.625));
 const first=Math.min(250,Math.max(160,step*.3125))-header;
 assert.equal(first+header,previousFromPageTop/2);
 const total=first+step*3;
 const phaseAt=distance=>overviewPhase(distance/total,{first,step,total});
 assert.equal(phaseAt(0),0);
 assert.ok(phaseAt(first-1)<1);
 assert.equal(phaseAt(first),1);
 assert.ok(Math.abs(phaseAt(first+step/2)-1.5)<1e-10);
 assert.equal(phaseAt(first+step),2);
 assert.equal(phaseAt(first+step*2),3);
 assert.equal(phaseAt(total),4);
 assert.equal(overviewPhase(2,{first,step,total}),4);
}
console.log('PASS: shortened AI intro, unchanged gym/battle/report runways');
