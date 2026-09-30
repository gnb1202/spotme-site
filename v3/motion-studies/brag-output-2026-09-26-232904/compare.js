(()=>{
 const frames=[...document.querySelectorAll('iframe')],input=document.querySelector('#time'),clock=document.querySelector('#clock'),button=document.querySelector('#play');
 let timelines=[],running=false,start=0,raf=0,current=0;
 const fit=()=>frames.forEach(f=>f.style.transform=`scale(${f.parentElement.clientWidth/1920})`);new ResizeObserver(fit).observe(document.querySelector('main'));fit();
 const seek=t=>{current=t;timelines.forEach(tl=>tl.pause().totalTime(Math.min(t,tl.duration()),true));input.value=t;clock.value=t.toFixed(2)+' / 5.00초';};
 const stop=()=>{running=false;cancelAnimationFrame(raf);};
 const tick=now=>{if(!running)return;seek(Math.min(5,(now-start)/1000));if(current>=5)stop();else raf=requestAnimationFrame(tick);};
 button.onclick=()=>{stop();seek(0);running=true;start=performance.now();raf=requestAnimationFrame(tick);};
 document.querySelector('#pause').onclick=stop;input.oninput=()=>{stop();seek(Number(input.value));};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 Promise.all(frames.map(f=>new Promise((resolve,reject)=>{
   async function ready(){try{const deadline=performance.now()+15000;while(!f.contentWindow.STUDY_READY){if(performance.now()>deadline||f.contentWindow.STUDY_ERROR)throw Error(f.contentWindow.STUDY_ERROR||'타임라인 로드 시간 초과');await new Promise(r=>setTimeout(r,50));}await f.contentDocument.fonts.ready;await Promise.all([...f.contentDocument.images].map(i=>i.decode()));resolve({timeline:Object.values(f.contentWindow.__timelines)[0]});}catch(e){reject(e);}}
   if(f.contentDocument.readyState==='complete'&&f.contentWindow.STUDY_READY)ready();else f.addEventListener('load',ready,{once:true});
 }))).then(all=>{timelines=all.map(v=>v.timeline);seek(0);button.disabled=false;document.querySelector('#status').textContent='준비됨. 재생 버튼 또는 시간 슬라이더로 비교하세요.';window.COMPARISON_READY=true;}).catch(e=>document.querySelector('#status').textContent='로드 실패: '+e.message);
})();
