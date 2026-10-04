const clamp=value=>Math.max(0,Math.min(1,value));
export const shouldCelebrateGym=(previous,current,active,reduced)=>active&&!reduced&&current>previous;
// Source names/costs: app gym-v6-spec.json and gym-stages.json.
export const gymStages=[
 {asset:'gym-before',name:'파괴된 헬스장',task:'헬스장 복원',cost:50},
 {asset:'gym-after',name:'가난한 헬스장',task:'헬스장 증축',cost:100},
 {asset:'gym-expanded',name:'가난한 헬스장',task:'헬스장 리모델링',cost:200},
 {asset:'gym-rare',name:'평범한 헬스장',task:'헬스장 2단계 리모델링',cost:500},
];
// Brief starting hold; three scroll-driven upgrades; hold RARE before leaving.
export function gymRevealProgress(progress){
  return clamp((progress-.08)/.66);
}
export function gymGrowthState(progress){
 const reveal=gymRevealProgress(progress),position=reveal*3;
 const index=Math.min(3,Math.floor(position)),complete=index===3;
 const cycle=position-index;
 // Each upgrade visibly reaches 100%, holds, then evolves before the next fill.
 const fill=complete?1:clamp(cycle/.65);
 const layers=gymStages.map((_,i)=>i===0?1:clamp((position-(i-.25))/.25));
 // Fixed demo wallet: enough for 50 + 100 + 200, not a live balance.
 const cost=complete?gymStages[2].cost:gymStages[index].cost;
 const amount=Math.round(fill*cost);
 const spent=complete?350:gymStages.slice(0,index).reduce((sum,stage)=>sum+stage.cost,0)+amount;
 return {reveal,index,complete,fill,percent:Math.round(fill*100),layers,cost,amount,wallet:350-spent};
}
