import {clamp,wrap,horizontalIntent,slideDestination,dragOffset,chapterAt,anchorTarget,fontSettings,elasticLimit} from './motion-core.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const mobile=matchMedia('(max-width: 48rem)');
const cleanups=new Set(),motionAnimations=new Set();
const settleEase='cubic-bezier(.16,1,.3,1)';
const listen=(target,type,handler,options)=>target.addEventListener(type,handler,options);
function animate(element,keyframes,options={}){
  if(reduced.matches||document.hidden||!element.animate)return null;
  const animation=element.animate(keyframes,{duration:400,easing:settleEase,...options});
  motionAnimations.add(animation);
  const done=()=>motionAnimations.delete(animation);
  animation.addEventListener('finish',done,{once:true});
  animation.addEventListener('cancel',done,{once:true});
  return animation;
}
function stopMotion(){
  cleanups.forEach(cleanup=>cleanup());
  motionAnimations.forEach(animation=>animation.cancel());motionAnimations.clear();
}
listen(document,'visibilitychange',()=>{if(document.hidden)stopMotion();});
listen(window,'blur',stopMotion);listen(window,'pagehide',stopMotion);
listen(reduced,'change',()=>{if(reduced.matches)stopMotion();});
// Suppress native image/link ghost dragging, not our pointer-based interactions.
listen(document,'dragstart',event=>event.preventDefault());

function initOpeningLayout(){
  const header=document.querySelector('.site-header');
  let height=0;
  function measure(){
    const next=header.getBoundingClientRect().height;
    if(next===height)return;
    height=next;document.documentElement.style.setProperty('--site-header-height',`${height}px`);
  }
  measure();
  if('ResizeObserver' in window)new ResizeObserver(measure).observe(header);
  else{listen(window,'resize',measure);document.fonts?.ready.then(measure);}
}

// Capture after horizontal intent; leave vertical touch scrolling browser-owned.
function draggable(element,{start=()=>{},move,end,cancel,freeMouse=false}){
  let pointer=null,suppressClick=false;
  function release(){
    const previous=pointer;pointer=null;
    window.removeEventListener('pointermove',onMove);
    window.removeEventListener('pointerup',onUp);
    window.removeEventListener('pointercancel',onCancel);
    element.classList.remove('is-dragging');
    if(previous&&element.hasPointerCapture(previous.id))element.releasePointerCapture(previous.id);
    return previous;
  }
  function onCancel(){const previous=release();if(previous?.active)suppressClick=true;if(previous)cancel?.();}
  function onMove(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(!pointer.active){
      const free=freeMouse&&pointer.type==='mouse';
      if(!free&&Math.abs(dy)>=8&&Math.abs(dy)>Math.abs(dx)){onCancel();return;}
      if(!(free?Math.hypot(dx,dy)>=8:horizontalIntent(dx,dy)))return;
      pointer.active=true;element.classList.add('is-dragging');
      element.setPointerCapture(event.pointerId);start(event);
    }
    event.preventDefault();move({dx,dy,x:event.clientX,y:event.clientY,pointerType:pointer.type});
  }
  function onUp(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    const previous=release();
    if(previous.active){
      suppressClick=true;end({dx:event.clientX-previous.x,dy:event.clientY-previous.y});
      setTimeout(()=>{suppressClick=false;},0);
    }
  }
  listen(element,'pointerdown',event=>{
    if(pointer||!event.isPrimary||event.button!==0)return;
    const control=event.target.closest('a,input,button');
    if(control&&control!==element)return;
    suppressClick=false;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,type:event.pointerType,active:false};
    listen(window,'pointermove',onMove,{passive:false});listen(window,'pointerup',onUp);listen(window,'pointercancel',onCancel);
  });
  listen(element,'lostpointercapture',onCancel);
  listen(element,'click',event=>{if(suppressClick&&event.detail!==0){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
  listen(window,'keydown',event=>{if(event.key==='Escape')onCancel();});
  listen(window,'resize',onCancel);cleanups.add(onCancel);
  return onCancel;
}

function initCarousel(carousel){
  const stage=carousel.querySelector('.carousel-stage'),track=carousel.querySelector('.carousel-track');
  const slides=[...carousel.querySelectorAll('.slide')],dots=[...carousel.querySelectorAll('.carousel-dot')];
  const status=carousel.querySelector('.slide-status');
  let current=0,width=stage.getBoundingClientRect().width,animation=null;
  const position=offset=>track.style.setProperty('--track-x',`${-current*width+offset}px`);
  const clearAnimation=()=>{animation?.cancel();animation=null;track.classList.remove('is-settling');};
  function show(index,{instant=false,wrapTransition=false}={}){
    const previous=current;current=wrap(index,slides.length);clearAnimation();
    slides.forEach((slide,i)=>{slide.inert=i!==current;slide.setAttribute('aria-hidden',String(i!==current));});
    dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));
    carousel.dataset.active=String(current);status.textContent=`${current+1} / ${slides.length}`;
    if(!instant&&!reduced.matches&&!document.hidden&&!wrapTransition)track.classList.add('is-settling');
    position(0);
    if(wrapTransition&&previous!==current)animation=animate(track,[{opacity:.35},{opacity:1}],{duration:180});
  }
  const cancelDrag=draggable(stage,{
    start:clearAnimation,
    move:({dx})=>{if(!reduced.matches)position(dragOffset(current,dx,width,slides.length));},
    end:({dx})=>show(slideDestination(current,dx,width,slides.length)),
    cancel:()=>show(current,{instant:true})
  });
  function select(index){cancelDrag();show(index,{wrapTransition:Math.abs(index-current)>1||index<0||index>=slides.length});}
  carousel.querySelectorAll('[data-step]').forEach(button=>listen(button,'click',()=>select(current+Number(button.dataset.step))));
  dots.forEach((button,i)=>listen(button,'click',()=>select(i)));
  listen(stage,'keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();select(event.key==='Home'?0:event.key==='End'?slides.length-1:current+(event.key==='ArrowLeft'?-1:1));
  });
  listen(track,'transitionend',event=>{if(event.propertyName==='transform')track.classList.remove('is-settling');});
  const resize=()=>{cancelDrag();width=stage.getBoundingClientRect().width;show(current,{instant:true});};
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);else listen(window,'resize',resize);
  cleanups.add(()=>show(current,{instant:true}));
  stage.dataset.ready='true';stage.tabIndex=0;
  carousel.querySelector('.carousel-controls').hidden=false;
  show(0,{instant:true});
}

function initElastic(element){
  let dx=0,dy=0,angle=0,animation=null;
  const transform=()=>`translate(${dx}px,${dy}px) rotate(${angle}deg)`;
  const cancelAnimation=()=>{animation?.cancel();animation=null;};
  function reset(immediate=false){
    const from=transform();cancelAnimation();
    const rebound=`translate(${-dx*.06}px,${-dy*.06}px) rotate(${-angle*.06}deg)`;
    dx=dy=angle=0;element.style.removeProperty('transform');
    if(!immediate)animation=animate(element,[{transform:from},{transform:rebound,offset:.76},{transform:'none'}]);
  }
  draggable(element,{
    freeMouse:true,start:cancelAnimation,
    move:delta=>{
      if(reduced.matches)return;
      const rect=element.parentElement.getBoundingClientRect(),limit=elasticLimit(element.dataset.elastic,rect.width,rect.height);
      dx=clamp(delta.dx,-limit,limit);dy=clamp(delta.dy,-limit,limit);angle=dx/limit*(element.dataset.elastic==='icon'?4:2);
      element.style.transform=transform();
    },
    end:()=>reset(),cancel:()=>reset()
  });
  listen(element,'click',()=>{cancelAnimation();dx=0;dy=-6;angle=element.dataset.elastic==='icon'?-2:2;reset();});
  listen(window,'keydown',event=>{if(event.key==='Escape')reset(true);});
  listen(window,'resize',()=>reset(true));cleanups.add(()=>reset(true));element.disabled=false;
}

function initType(){
  const slider=document.querySelector('#font-size'),preview=document.querySelector('#font-preview'),output=document.querySelector('#font-size-value');
  let touched=false;
  function render(value){
    const settings=fontSettings(mobile.matches);
    slider.max=String(settings.max);slider.value=String(clamp(value,settings.min,settings.max));
    preview.style.setProperty('--preview-size',`${slider.value}px`);output.value=`${slider.value}px`;slider.setAttribute('aria-valuetext',`${slider.value} 픽셀`);
  }
  listen(slider,'input',()=>{touched=true;render(Number(slider.value));});
  listen(document.querySelector('.type-reset'),'click',()=>{touched=false;render(fontSettings(mobile.matches).defaultValue);});
  listen(mobile,'change',()=>render(touched?Number(slider.value):fontSettings(mobile.matches).defaultValue));
  render(fontSettings(mobile.matches).defaultValue);document.querySelector('.type-controls').hidden=false;
}

function initHero(){
  const hero=document.querySelector('#hero'),character=hero.querySelector('.hero-character'),background=hero.querySelector('.hero-background');
  let frame=0,target={x:0,y:0},current={x:0,y:0},visible=true;
  function paint(){
    character.style.setProperty('--hero-x',`${current.x}px`);character.style.setProperty('--hero-y',`${current.y}px`);
    background.style.setProperty('--background-x',`${-current.x/2}px`);background.style.setProperty('--background-y',`${-current.y/2}px`);
  }
  function tick(){
    frame=0;current.x+=(target.x-current.x)*.2;current.y+=(target.y-current.y)*.2;
    const remaining=Math.hypot(target.x-current.x,target.y-current.y);
    if(remaining<.04)current={...target};paint();if(remaining>=.04)frame=requestAnimationFrame(tick);
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(tick);};
  function reset(){cancelAnimationFrame(frame);frame=0;target={x:0,y:0};current={x:0,y:0};paint();}
  listen(hero,'pointermove',event=>{
    if(!finePointer.matches||mobile.matches||reduced.matches||document.hidden||!visible)return;
    const rect=hero.getBoundingClientRect();
    target={x:clamp((event.clientX-rect.left)/rect.width*2-1,-1,1)*8,y:clamp((event.clientY-rect.top)/rect.height*2-1,-1,1)*8};schedule();
  });
  listen(hero,'pointerleave',()=>{target={x:0,y:0};if(!reduced.matches)schedule();else reset();});
  if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)reset();}).observe(hero);
  listen(window,'resize',reset);listen(finePointer,'change',reset);listen(mobile,'change',reset);cleanups.add(reset);
}

function initNavigation(){
  const mode=new URLSearchParams(location.search).get('nav')==='chapters'?'chapters':'rail';
  document.documentElement.dataset.nav=mode;document.documentElement.dataset.layout='motion-v1';
  const rail=document.querySelector('.chapter-rail');rail.hidden=mode!=='rail';
  const chapters=[...document.querySelectorAll('[data-chapter]')],links=[...rail.querySelectorAll('a')];
  // These containers are not reveal/parallax targets: their bounds stay stable
  // during motion. Native anchors keep history, keyboard and modifier-click behavior.
  const contents=chapters.map(chapter=>chapter.querySelector(':scope > .container:not(.source-divider)')??chapter);
  let frame=0;
  function refreshAnchors(){
    const maxScroll=document.documentElement.scrollHeight-innerHeight;
    chapters.forEach((chapter,index)=>{
      const sectionTop=chapter.getBoundingClientRect().top+scrollY;
      const content=contents[index].getBoundingClientRect();
      const target=chapter.id==='hero'?0:anchorTarget(content.top+scrollY,content.height,innerHeight,maxScroll);
      // Negative margins intentionally skip the section's outer padding.
      chapter.style.scrollMarginTop=`${sectionTop-target}px`;
    });
  }
  function update(){
    frame=0;const atBottom=window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2;
    const index=chapterAt(contents.map(content=>content.getBoundingClientRect().top),innerHeight,atBottom);
    links.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    rail.dataset.active=chapters[index].dataset.chapter;
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  listen(window,'scroll',schedule,{passive:true});listen(window,'resize',()=>{refreshAnchors();schedule();});listen(window,'hashchange',schedule);
  listen(document,'click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(link&&(rail.contains(link)||link.closest('.site-header')))refreshAnchors();
  });
  listen(document,'visibilitychange',()=>{if(!document.hidden)schedule();});
  if('ResizeObserver' in window)new ResizeObserver(()=>{refreshAnchors();schedule();}).observe(document.querySelector('main'));
  cleanups.add(()=>{cancelAnimationFrame(frame);frame=0;});
  refreshAnchors();update();
  const initialHash=location.hash;
  let interacted=false;
  ['pointerdown','wheel','keydown','touchstart'].forEach(type=>listen(window,type,()=>{interacted=true;},{once:true,passive:true}));
  const fontsReady=document.fonts?.ready??Promise.resolve();
  fontsReady.then(()=>{
    refreshAnchors();
    // Correct a directly opened #fragment after fonts settle, without taking
    // the scroll position away from someone who has already started browsing.
    if(initialHash&&location.hash===initialHash&&!interacted){
      chapters.find(chapter=>`#${chapter.id}`===initialHash)?.scrollIntoView({block:'start',behavior:'instant'});
    }
    schedule();
  });
}

function initReveals(){
  if(reduced.matches||!('IntersectionObserver' in window))return;
  const selectors=['.hero-copy','.hero-art','#background .eyebrow','#background .section-title','#background .background-copy','.growth-chart','.brand-grid>div:first-child','.app-icon-card','.brand-wordmark-card','.concept-equation> *','.concept-caption','.slide:first-child .feature-copy','.slide:first-child .feature-art','.main-colors>.subsection-title','.palette-row','.color-family','.typography>.subsection-title','.font-display','.type-group','.remi-intro','.remi-portrait','.remi-pose'];
  const pending=new Set();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const element=entry.target;observer.unobserve(element);pending.delete(element);element.classList.remove('reveal-pending');
    if(element.closest('[aria-hidden=true]'))return;
    animate(element,[{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}],{duration:520,delay:Number(element.dataset.revealOrder)*80,fill:'backwards'});
  }),{threshold:.12});
  const orders=new Map();
  document.querySelectorAll(selectors.join(',')).forEach(element=>{
    const chapter=element.closest('[data-chapter]');
    const index=orders.get(chapter)??0;orders.set(chapter,index+1);
    let order=Math.min(index,3);
    if(element.classList.contains('remi-pose'))order=[...element.parentElement.children].indexOf(element)%3;
    if(element.parentElement.classList.contains('concept-equation'))order=[...element.parentElement.children].indexOf(element);
    const rect=element.getBoundingClientRect();
    if(rect.bottom<0||rect.top<innerHeight*.85)return;
    element.dataset.revealOrder=String(order);element.classList.add('reveal-pending');pending.add(element);observer.observe(element);
  });
  function revealAll(){observer.disconnect();pending.forEach(element=>element.classList.remove('reveal-pending'));pending.clear();}
  listen(reduced,'change',()=>{if(reduced.matches)revealAll();});
  listen(document,'focusin',event=>{
    const element=event.target.closest('.reveal-pending');
    if(element){observer.unobserve(element);pending.delete(element);element.classList.remove('reveal-pending');}
  });
  const hero=document.querySelector('#hero');
  if(hero.getBoundingClientRect().bottom>0&&hero.getBoundingClientRect().top<innerHeight){
    ['.hero-copy','.hero-art'].forEach((selector,index)=>animate(hero.querySelector(selector),[{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}],{duration:520,delay:index*80,fill:'backwards'}));
  }
}

// Component failures must not prevent unrelated enhancements or readable content.
const initializers=[initOpeningLayout,initNavigation,...[...document.querySelectorAll('[data-carousel]')].map(carousel=>()=>initCarousel(carousel)),...[...document.querySelectorAll('[data-elastic]')].map(element=>()=>initElastic(element)),initType,initHero,initReveals];
for(const initialize of initializers){try{initialize();}catch(error){console.error('SPOT ME enhancement failed:',error);}}
