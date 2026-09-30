import assert from 'node:assert/strict';
import {bindChargeGeometry} from '../src/integration/charge-geometry.js';

let geometry,child,observer;
globalThis.document={createElementNS:()=>({attributes:{},setAttribute(key,value){this.attributes[key]=value;}})};
globalThis.MutationObserver=class{
  constructor(callback){this.callback=callback;observer=this;}
  observe(){this.connected=true;}
  disconnect(){this.connected=false;}
};
const title={querySelector:()=>geometry};
const fill={querySelector:()=>({replaceChildren(node){child=node;}})};

const controller=new AbortController();
const dispose=bindChargeGeometry(title,fill,controller.signal);
assert(observer.connected,'Wait for asynchronous font calibration');
geometry={dataset:{outlineGeometry:'calibrated-glyphs'}};
observer.callback();
assert.equal(child.attributes.href,'#calibrated-glyphs');
assert.equal(child.attributes.fill,'#5eefd3');
assert.equal(child.attributes.stroke,child.attributes.fill,'Charged area covers the outline seam with the same opaque color');
assert.equal(observer.connected,false,'Stop observing after binding');
dispose();

child=null;
bindChargeGeometry(title,fill,new AbortController().signal)();
assert.equal(child.attributes.href,'#calibrated-glyphs','Already calibrated outlines bind immediately');

geometry=null;
const cancelled=new AbortController();
bindChargeGeometry(title,fill,cancelled.signal);
cancelled.abort();
assert.equal(observer.connected,false,'Unmount cancels pending calibration observer');
console.log('PASS: shared SVG geometry, immediate/delayed calibration, abort cleanup');
