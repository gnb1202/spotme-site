const videos=[document.querySelector('#video-a'),document.querySelector('#video-b')];
const status=document.querySelector('#status'),scrub=document.querySelector('#scrub'),time=document.querySelector('#time');
const ready=v=>v.readyState>=1?Promise.resolve():new Promise((resolve,reject)=>{v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',reject,{once:true});});
async function seek(v,t){await ready(v);v.pause();if(Math.abs(v.currentTime-t)<.001)return;await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;});}
let operation=0;
async function play(list){const current=++operation;try{await Promise.all(list.map(v=>seek(v,0)));if(current!==operation)return;await Promise.all(list.map(v=>v.play()));status.textContent=list.length===2?'A/B를 함께 재생합니다.':'선택한 시안을 재생합니다.';}catch{status.textContent='영상을 불러오지 못했습니다. 새로고침 후 다시 재생해 주세요.';}}
document.querySelector('#play-both').onclick=()=>play(videos);
document.querySelector('#pause-both').onclick=()=>{operation++;videos.forEach(v=>v.pause());status.textContent='모두 일시정지했습니다.';};
document.querySelectorAll('[data-replay]').forEach(b=>b.onclick=()=>play([document.querySelector('#video-'+b.dataset.replay)]));
async function show(t){const current=++operation;try{await Promise.all(videos.map(ready));if(current!==operation)return;videos.forEach(v=>{v.pause();v.currentTime=t;});scrub.value=t;time.value=t.toFixed(2)+'초';status.textContent='같은 시점을 표시합니다.';}catch{status.textContent='영상을 불러오지 못했습니다.';}}
scrub.oninput=()=>show(Number(scrub.value));
for(const variant of ['a','b'])for(const t of [.45,.75,1.1,1.35,1.7,2.0,2.4,3.0,3.5,4.2]){const b=document.createElement('button');b.className='keyframe';b.innerHTML=`<img src="reports/${variant}-${t.toFixed(3)}.png" alt="${variant.toUpperCase()} ${t.toFixed(2)}초 프레임" loading="lazy"><span>${variant.toUpperCase()} · ${t.toFixed(2)}초</span>`;b.onclick=()=>show(t);document.querySelector('#keyframes').append(b);}
