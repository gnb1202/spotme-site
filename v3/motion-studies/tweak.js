const ids=['a','b'];
const fields=[
  ['typePower','타이포 가속 곡선',1,5,.1,'','1은 선형, 높을수록 초반은 느리고 끝에서 빠르게 완성.'],
  ['drawStart','윤곽 시작',.8,1.6,.01,'초','타이포는 1.25초에 완성됩니다.'],
  ['drawDuration','윤곽 그리는 시간',.3,.9,.01,'초','짧을수록 테두리를 빠르게 그립니다.'],
  ['rushGap','흡입 전 대기',0,.4,.01,'초','윤곽 완성부터 흡입 시작까지의 간격.'],
  ['zoom','흡입 확대',3,9,.1,'배','높을수록 카메라가 깊게 들어갑니다.'],
  ['shake','버티는 떨림',0,8,.1,'px','0이면 회전을 포함한 떨림을 끕니다.'],
  ['rings','반복 윤곽 수',4,14,1,'개','인피니티 미러의 깊이.'],
  ['stroke','민트 선 두께',1,5,.1,'px','원본 화면 1920px 기준.'],
  ['revealPower','홈 등장 곡선',.6,2,.1,'','낮으면 홈이 일찍, 높으면 흡입 후반에 더 드러납니다.'],
  ['fade','윤곽 마무리 페이드',.25,.85,.01,'초','홈 위 민트 윤곽이 사라지는 시간. 홈은 흡입 중 등장.']
];
const defaults=id=>({typePower:3,revealPower:1.1,drawStart:id==='a'?1.32:1.02,drawDuration:.62,rushGap:id==='a'?.1:.14,zoom:6.4,shake:4.2,rings:10,stroke:2.8,fade:.43});
const key='spotme-mirror-tweak-v1';
let saved;try{saved=JSON.parse(localStorage.getItem(key));}catch{}
const settings=Object.fromEntries(ids.map(id=>[id,Object.fromEntries(fields.map(([name,,min,max])=>{const n=saved?.[id]?.[name];return [name,typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,name==='rings'?Math.round(n):n)):defaults(id)[name]];}))]));
const frames=Object.fromEntries(ids.map(id=>[id,document.querySelector('#frame-'+id)]));
const status=document.querySelector('#status'),scrub=document.querySelector('#scrub'),time=document.querySelector('#time');
const timelines={},generations={a:0,b:0},timers={};
let current=0,raf=0,running=false,epoch=0;
const ready=()=>ids.every(id=>timelines[id]);
function availability(){for(const el of document.querySelectorAll('#play,#pause,#scrub,[data-seek]'))el.disabled=!ready();}
function persist(){try{localStorage.setItem(key,JSON.stringify(settings));}catch{status.textContent='브라우저 저장이 제한되어 있습니다. JSON 저장을 이용해 주세요.';}}
function drawTime(){scrub.value=current;time.value=`${current.toFixed(2)}초 / 4.50초`;}
function seek(t){current=Math.max(0,Math.min(4.5,t));for(const tl of Object.values(timelines))tl.pause().totalTime(current,true);drawTime();}
function pause(){running=false;cancelAnimationFrame(raf);raf=0;}
function tick(now){if(!running)return;seek((now-epoch)/1000);if(current>=4.5){pause();status.textContent='재생 완료. 값을 바꾸거나 다시 재생해 보세요.';}else raf=requestAnimationFrame(tick);}
document.querySelector('#play').onclick=()=>{if(!ready())return;pause();seek(0);running=true;epoch=performance.now();raf=requestAnimationFrame(tick);status.textContent='같은 시계로 A/B를 함께 재생합니다.';};
document.querySelector('#pause').onclick=()=>{pause();status.textContent='일시정지했습니다.';};
scrub.oninput=()=>{pause();seek(Number(scrub.value));};
document.querySelectorAll('[data-seek]').forEach(button=>button.onclick=()=>{pause();seek(Number(button.dataset.seek));});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();status.textContent='탭이 숨겨져 재생을 멈췄습니다.';}});
function syncPanel(id){
  document.querySelector('#scroll-'+id).href='scroll/?'+new URLSearchParams({variant:id,...settings[id]});
  for(const [name,,min,max,step,unit] of fields){const input=document.querySelector(`#${id}-${name}`);input.value=settings[id][name];document.querySelector(`#${id}-${name}-value`).value=settings[id][name].toFixed(step===1?0:step===.1?1:2)+unit;}
  const s=settings[id],end=s.drawStart+s.drawDuration,rush=end+s.rushGap;
  document.querySelector('#timing-'+id).textContent=`윤곽 ${s.drawStart.toFixed(2)}–${end.toFixed(2)}초 → 흡입 + 홈 등장 ${rush.toFixed(2)}–3.42초 · 윤곽 종료 3.65초`;
}
function load(id){
  pause();clearTimeout(timers[id]);delete timelines[id];availability();
  const generation=++generations[id],frame=frames[id];status.textContent=`${id.toUpperCase()} 설정을 적용하고 있습니다…`;
  frame.onload=async()=>{
    const deadline=performance.now()+15000;
    while(generation===generations[id]&&performance.now()<deadline){
      const w=frame.contentWindow;
      if(w.STUDY_ERROR){status.textContent=`${id.toUpperCase()} 로드 실패: ${w.STUDY_ERROR}`;return;}
      if(w.STUDY_READY){
        timelines[id]=w.__timelines['spotme-'+id];timelines[id].pause().totalTime(current,true);
        w.document.documentElement.style.overflow='hidden';w.document.body.style.overflow='hidden';
        availability();if(ready())status.textContent='준비 완료. A/B 값을 각각 조절하고 함께 재생하세요.';return;
      }
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    if(generation===generations[id])status.textContent=`${id.toUpperCase()} 로드 시간이 초과되었습니다. 새로고침해 주세요.`;
  };
  frame.src=`${id}/?${new URLSearchParams(settings[id])}`;
}
function changed(id){pause();generations[id]++;delete timelines[id];availability();syncPanel(id);persist();clearTimeout(timers[id]);timers[id]=setTimeout(()=>load(id),250);}
for(const id of ids){
  const controls=document.querySelector('#controls-'+id);
  for(const [name,label,min,max,step,unit,hint] of fields){
    const item=document.createElement('div');item.className='control';
    item.innerHTML=`<label for="${id}-${name}">${label}<output id="${id}-${name}-value" for="${id}-${name}"></output></label><input id="${id}-${name}" aria-describedby="${id}-${name}-hint" type="range" min="${min}" max="${max}" step="${step}"><small id="${id}-${name}-hint">${hint}</small>`;
    item.querySelector('input').oninput=e=>{settings[id][name]=Number(e.target.value);changed(id);};controls.append(item);
  }
  syncPanel(id);
  const viewport=frames[id].parentElement;
  new ResizeObserver(()=>{frames[id].style.transform=`scale(${viewport.clientWidth/1920})`;}).observe(viewport);
  load(id);
}
document.querySelectorAll('[data-reset]').forEach(button=>button.onclick=()=>{const id=button.dataset.reset;settings[id]=defaults(id);changed(id);});
document.querySelectorAll('[data-copy]').forEach(button=>button.onclick=()=>{const id=button.dataset.copy,to=id==='a'?'b':'a';settings[to]={...settings[id]};changed(to);});
document.querySelector('#reset').onclick=()=>{pause();seek(0);for(const id of ids){settings[id]=defaults(id);changed(id);}};
document.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,settings},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='spotme-opening-tweak.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='설정 JSON을 저장했습니다. MP4나 사이트에는 적용되지 않았습니다.';};
window.TWEAK={get settings(){return structuredClone(settings);},get time(){return current;},get playing(){return running;},get ready(){return ready();}};
