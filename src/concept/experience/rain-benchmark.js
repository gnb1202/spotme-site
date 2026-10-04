// Opt-in local QA only (?rainBench=1). Canvas callback timing is not GPU timing.
export function createRainBenchmark({root,el,reset}){
 let frames=null,cancelled=false;
 const record=(time,ms,draws,clearArea)=>{if(frames)frames.push({time,ms,draws,clearArea});};
 const run=async()=>{
  const trials=[];
  for(let trial=-1;trial<3&&!cancelled;trial++){
   el.dataset.benchmark=trial<0?'warmup':`run-${trial+1}`;
   const top=root.getBoundingClientRect().top+window.scrollY+3;
   const distance=Math.min(1200,(root.offsetHeight-window.innerHeight)*.65);
   window.scrollTo({top,behavior:'instant'});reset();frames=[];
   await new Promise(resolve=>{
    let start=null;
    const step=time=>{
     if(cancelled){resolve();return;}
     if(start===null)start=time;
     const t=(time-start)/1000;
     if(t<=2.4)window.scrollTo({top:top+distance*t/2.4,behavior:'instant'});
     if(t<8)requestAnimationFrame(step);else resolve();
    };requestAnimationFrame(step);
   });
   if(cancelled)break;
   const sample=frames;frames=null;
   const intervals=sample.slice(1).map((f,i)=>f.time-sample[i].time);
   const sorted=sample.map(f=>f.ms).sort((a,b)=>a-b);
   const result={frames:sample.length,fps:1000*(sample.length-1)/(sample.at(-1)?.time-sample[0]?.time),meanDrawMs:sample.reduce((s,f)=>s+f.ms,0)/sample.length,p95DrawMs:sorted[Math.floor(sorted.length*.95)],longFrames:intervals.filter(n=>n>25).length,drawCalls:sample.reduce((s,f)=>s+f.draws,0),clearArea:sample.reduce((s,f)=>s+f.clearArea,0)};
   if(trial>=0)trials.push(result);
  }
  if(cancelled)return;
  const mean=key=>trials.reduce((s,t)=>s+t[key],0)/trials.length;
  el.dataset.result=JSON.stringify({viewport:[innerWidth,innerHeight],deviceDpr:devicePixelRatio,trials,mean:{fps:mean('fps'),meanDrawMs:mean('meanDrawMs'),p95DrawMs:mean('p95DrawMs'),longFrames:mean('longFrames'),drawCalls:mean('drawCalls'),clearArea:mean('clearArea')}});
  el.dataset.benchmark='done';
 };
 return {record,run,cancel:()=>{cancelled=true;frames=null;}};
}
