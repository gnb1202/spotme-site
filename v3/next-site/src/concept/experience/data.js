export const art=id=>`/concept/experience/${id}.webp`;
// Two-rank steps, with the highest badge included; not app scoring rules.
export const tierPreview=['iron','silver','platinum','diamond','grandmaster','challenger'];
// Halo hues follow the original badge artwork, not additional tier categories.
export const tierHaloColors={iron:'#87918f',silver:'#b1c6d2',platinum:'#20bda3',diamond:'#61ace7',grandmaster:'#e41685',challenger:'#f5d262'};
export const overview=[
 {title:'나에게 맞추는 레미 AI',description:'오늘의 운동을 추천받고, 운동 중에도 레미와 대화하며 루틴을 조정해요.',link:'레미와 운동해 보기',target:'#remi-sequence'},
 {title:'운동으로 달라지는 공간',description:'퀘스트로 모은 치즈로 헬스장을 키워요. 쌓인 운동은 티어로도 남아요.',link:'달라지는 모습 보기',target:'#growth'},
 {title:'한눈에 보이는 나의 진척도',description:'꾸준히 운동한 시간부터 운동 볼륨의 변화까지. 리포트에서 함께 확인해요.',link:'리포트 살펴보기',target:'#progress-report'},
 {title:'운동에 더하는 작은 전투',description:'운동을 하며 레미와 몬스터에 도전해요. 익숙한 운동에 즐거움 하나를 더해요.',link:'게임 기능 보기',target:'/game/'},
];
export const checkpoints=[
 {title:'오늘의 운동은 레미와 준비하고',description:'운동 시간과 사용할 기구, 나의 목표를 반영해요. 준비된 운동 목록을 먼저 확인하세요.'},
 {title:'버거운 순간에는 함께 조정하고',description:'운동 중에도 레미에게 물어보세요. 중량을 낮추는 제안을 확인하고 루틴에 반영해요.'},
 {title:'한 세트씩, 함께 끝까지',description:'내가 운동하는 동안 레미도 함께 싸워요. 몬스터를 물리치고 오늘의 운동을 마무리해요.'},
];
// Same July/August fixture formula as the app's guestReportSamples.ts.
function monthVolumes(month){
 const offsets=month===7?[0,5,2.5,7.5]:[7.5,12.5,5,10,7.5,15,2.5,10];
 const bases=month===7?[40,60]:[50,70,35];
 const singles=month===7?[50,70]:[60,80,45];
 return offsets.map((offset,i)=>bases.reduce((sum,base,j)=>sum+(base+i*2.5)*20+singles[j]+offset,0));
}
export const reportMonths=[7,8].map(month=>{
 const sessions=monthVolumes(month);
 let total=0;
 return {label:`${month}월`,sessions:sessions.length,total:sessions.reduce((a,b)=>a+b,0),points:[0,...sessions.map(value=>total+=value)]};
});
