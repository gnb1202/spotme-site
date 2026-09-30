import {gsap} from 'gsap';
export async function startScroll(scope,study,intro,signal){
 const byId=id=>scope.querySelector('[id="'+id+'"]');
 const listen=(target,event,handler,options={})=>target.addEventListener(event,handler,{...options,signal});
 const restoration=history.scrollRestoration;
 const originalStyles=[scope.querySelector('#home .canvas'),scope.querySelector('#home [data-source-node-id="254:244"]')].map(el=>[el,el.getAttribute('style')]);
 
  const hero=scope.querySelector('#hero-scroll'),next=scope.querySelector('#next-content'),home=scope.querySelector('#home'),canvas=home.querySelector('.canvas');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),title=home.querySelector('[data-source-node-id="205:3"]'),remi=home.querySelector('[data-source-node-id="254:244"]');
  const status=scope.querySelector('#charge-status'),skipOpening=scope.querySelector('#skip-opening');
  let state='loading',target=0,progress={value:0},chargeTween,shakeTween,hintTween,finishTween,moveTween,touchY=null;
  const events=[];
  function setState(value){state=value;scope.dataset.phase=value;events.push({state:value,time:performance.now()});}
  function fit(){const w=document.documentElement.clientWidth;document.documentElement.style.setProperty('--hero-scale',Math.min(w/1920,innerHeight/1080));document.documentElement.style.setProperty('--page-scale',w/1920);}
  fit();listen(window,'resize',()=>{fit();stopShake();if(state==='moving'){moveTween?.kill();scrollTo(0,next.offsetTop);setState('released');}});

  title.after(scope.querySelector('#fill-template').content.cloneNode(true));
  const level=scope.querySelector('#charge-level'),standing=document.createElement('img');standing.id='standing-remi';standing.alt='바벨을 들고 일어선 레미';standing.src='/motion-assets/remi-standing.png';standing.draggable=false;
  const h=600,w=h*study.standing.width/study.standing.height;
  Object.assign(standing.style,{height:h+'px',width:w+'px',left:(study.remi.x+study.remi.width/2-w/2)+'px',top:(study.remi.y+study.remi.height-h)+'px'});remi.after(standing);await standing.decode();if(signal.aborted){scope.querySelector("#charge-fill")?.remove();standing.remove();return null;}
  const scrollLabel=[...home.querySelectorAll('.text')].find(el=>el.textContent.trim()==='SCROLL');
  const cue=document.createElement('button');cue.id='scroll-cue';cue.type='button';cue.setAttribute('aria-label','아래로 스크롤하거나 눌러 타이포 충전하기');cue.innerHTML='<span class="cue-card"></span><span class="cue-card"></span><span class="cue-card"></span>';
  const labelX=scrollLabel?parseFloat(scrollLabel.style.left)+parseFloat(scrollLabel.style.width)/2:960,labelY=scrollLabel?parseFloat(scrollLabel.style.top):980;
  Object.assign(cue.style,{left:(labelX-36)+'px',top:(labelY-86)+'px'});canvas.append(cue);
  // Composition playback is passive; the local interaction layer explicitly enables only this cue.
  function stopShake(){shakeTween?.kill();gsap.set(canvas,{x:0,y:0});gsap.set(remi,{x:0,y:0,rotation:0});}
  function stopHint(){hintTween?.kill();hintTween=null;gsap.set('#scroll-cue .cue-card',{y:0,opacity:i=>[.18,.45,.95][i]});}
  function renderFill(){const height=study.title.height;level.setAttribute('y',height*(1-progress.value));level.setAttribute('height',height*progress.value);}
  function hint(){
    stopHint();gsap.set(cue,{opacity:1});
    if(reduced.matches||document.hidden||state!=='charging'||target!==0)return;
    const cards=[...cue.querySelectorAll('.cue-card')];
    // Travel down only. Reset above the starting point while invisible, never visibly bounce upward.
    hintTween=gsap.timeline({repeat:-1,repeatDelay:.35}).set(cards,{y:-7,opacity:0},0);
    cards.forEach((card,i)=>hintTween.to(card,{y:0,opacity:1,duration:.28,ease:'power1.out'},i*.16).to(card,{y:13,opacity:0,duration:.4,ease:'power1.in'},i*.16+.28));
  }
  function ready(){intro.pause().totalTime(4.5,true);setState('charging');skipOpening.hidden=true;document.body.classList.add('pinned');status.textContent='아래로 스크롤해 글자를 채워 주세요. 방향키 또는 삼각형 버튼도 사용할 수 있습니다.';hint();}
  function reset(playIntro=true){
    chargeTween?.kill();finishTween?.kill();moveTween?.kill();stopShake();stopHint();target=0;progress.value=0;renderFill();
    gsap.set(remi,{opacity:1});gsap.set(standing,{opacity:0,y:0,scaleY:1});gsap.set(cue,{opacity:0});scrollTo(0,0);document.body.classList.add('pinned');skipOpening.hidden=false;
    intro.eventCallback('onComplete',ready);setState('opening');
    if(!playIntro||reduced.matches)ready();else intro.restart();
  }
  function moveNext(){
    if(state!=='holding')return;setState('moving');document.body.classList.remove('pinned');
    const position={y:scrollY};
    const done=()=>{scrollTo(0,next.offsetTop);setState('released');next.focus({preventScroll:true});status.textContent='다음 섹션으로 이동했습니다.';};
    if(reduced.matches){done();return;}
    moveTween=gsap.to(position,{y:next.offsetTop,duration:.75,ease:'power2.inOut',onUpdate:()=>scrollTo(0,position.y),onComplete:done});
  }
  function finish(){
    if(state!=='charging')return;setState('standing');stopHint();stopShake();target=1;progress.value=1;renderFill();gsap.set(cue,{opacity:0});
    status.textContent='충전 완료. 레미가 일어섭니다.';
    const standDuration=reduced.matches?0:.34;
    finishTween=gsap.timeline().to(remi,{opacity:0,duration:reduced.matches?0:.1},0)
      .fromTo(standing,{opacity:0,y:30,scaleY:.94},{opacity:1,y:0,scaleY:1,duration:standDuration,ease:'power3.out',immediateRender:false},0)
      .call(()=>setState('holding'),[],standDuration)
      .call(moveNext,[],standDuration+.5);
  }
  function strain(){
    stopShake();if(reduced.matches)return;
    const amount=.8+target*1.8;
    shakeTween=gsap.timeline().to(canvas,{x:amount,y:-amount*.35,duration:.045}).to(canvas,{x:-amount,y:amount*.35,duration:.045}).to(canvas,{x:amount*.65,y:0,duration:.04}).to(canvas,{x:0,y:0,duration:.09})
      .to(remi,{x:-amount*1.5,y:amount*.5,rotation:-.12,duration:.045},0).to(remi,{x:amount*1.5,y:0,rotation:.12,duration:.045},.045).to(remi,{x:0,y:0,rotation:0,duration:.13},.09);
  }
  function charge(delta){if(state!=='charging')return;stopHint();target=Math.max(0,Math.min(1,target+delta));chargeTween?.kill();strain();status.textContent=`충전 ${Math.round(target*100)}%`;
    if(reduced.matches){progress.value=target;renderFill();if(target===1)finish();}
    else chargeTween=gsap.to(progress,{value:target,duration:.18,ease:'power1.out',onUpdate:renderFill,onComplete:()=>{if(target===1)finish();}});
  }
  const blocked=()=>['loading','opening','charging','standing','holding','moving'].includes(state);
  listen(window,'wheel',event=>{
    if(event.ctrlKey||!blocked())return;event.preventDefault();
    if(state==='charging'&&Math.abs(event.deltaY)>Math.abs(event.deltaX)){
      const unit=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
      charge(Math.max(-180,Math.min(180,event.deltaY*unit))/1100);
    }
  },{passive:false});
  listen(hero,'touchstart',event=>{touchY=event.touches.length===1?event.touches[0].clientY:null;},{passive:true});
  listen(hero,'touchmove',event=>{if(!blocked()||touchY===null||event.touches.length!==1)return;event.preventDefault();const y=event.touches[0].clientY,delta=touchY-y;touchY=y;charge(delta/700);},{passive:false});
  const cancelTouch=()=>{touchY=null;stopShake();};listen(hero,'touchend',cancelTouch);listen(hero,'touchcancel',cancelTouch);
  listen(window,'keydown',event=>{
    if(event.key==='Escape'&&blocked()){event.preventDefault();intro.pause();if(state==='opening')ready();else{chargeTween?.kill();finishTween?.kill();stopShake();stopHint();setState('holding');moveNext();}return;}
    if(event.target.closest('button,a,input,select,textarea')||!blocked()||event.ctrlKey||event.metaKey||event.altKey)return;
    if(['ArrowDown','PageDown',' ','ArrowUp','PageUp','Home','End'].includes(event.key)){
      event.preventDefault();if(state==='charging')charge(event.key==='Home'?-1:event.key==='End'?1:['ArrowUp','PageUp'].includes(event.key)||event.shiftKey?-.18:.18);
    }
  });
  cue.onclick=()=>charge(.25);
  skipOpening.onclick=ready;
  scope.querySelector('#skip-charge').onclick=()=>{if(state==='opening')ready();if(state==='charging')charge(1);};
  scope.querySelector('#restart').onclick=()=>reset(true);
  listen(window,'scroll',()=>{if(state==='released'&&scrollY<2)reset(false);},{passive:true});
  listen(document,'visibilitychange',()=>{
    if(document.hidden){intro.pause();chargeTween?.pause();finishTween?.pause();moveTween?.pause();stopShake();stopHint();}
    else{if(state==='opening')intro.play();chargeTween?.resume();finishTween?.resume();moveTween?.resume();if(state==='charging'&&target===0)hint();}
  });
  listen(reduced,'change',()=>{stopShake();stopHint();if(reduced.matches&&state==='opening')ready();else if(state==='charging'&&target===0)hint();});
  const api={get state(){return state;},get progress(){return progress.value;},get target(){return target;},events,reset:()=>reset(false)};
  history.scrollRestoration='manual';reset(new URLSearchParams(location.search).get('intro')!=='skip');

 return {api,dispose(){chargeTween?.kill();finishTween?.kill();moveTween?.kill();stopShake();stopHint();intro.pause();for(const el of [standing,cue,scope.querySelector('#charge-fill')])el?.remove();for(const [el,style] of originalStyles)el.setAttribute('style',style);document.body.classList.remove('pinned');history.scrollRestoration=restoration;for(const el of scope.querySelectorAll('#study-tools button'))el.onclick=null;}};
}