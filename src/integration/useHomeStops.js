'use client';
import {useEffect} from 'react';

// Match the Features reading-frame behavior; the opening owns its own scroll.
export default function useHomeStops(ref){
  useEffect(()=>{
    const root=ref.current;
    const desktop=matchMedia('(min-width:901px) and (min-height:701px)');
    const reduced=matchMedia('(prefers-reduced-motion:reduce)');
    const research=root.querySelector('.hs-research-layout');
    const plateau=root.querySelector('.hs-plateau-layout');
    const solution=root.querySelector('.hs-solution');
    const solutionLayout=root.querySelector('.hs-solution-layout');
    const overview=root.querySelector('#home-overview');
    const overviewLayout=root.querySelector('.hpo-layout');
    let stops=[],frame=0,releaseTimer=0,locked=false,lastWheel=0,disposed=false;
    const top=el=>el.getBoundingClientRect().top+scrollY;
    const cancel=()=>{
      if(locked)window.scrollTo({top:scrollY,behavior:'instant'});
      cancelAnimationFrame(frame);clearTimeout(releaseTimer);locked=false;
      delete root.dataset.homeScrolling;
    };
    const measure=()=>{
      cancel();
      const header=document.querySelector('.site-navigation')?.getBoundingClientRect().height||0;
      const frames=[
        [top(root),research],
        [top(plateau)-header-40,plateau],
        [top(solution),solutionLayout],
        [top(overview),overviewLayout],
      ];
      const limit=Math.max(0,document.documentElement.scrollHeight-innerHeight);
      const points=[0];
      for(const [start,content] of frames){
        points.push(start);
        // A second stop exposes the bottom of an expanded/tall reading frame.
        const bottom=top(content)+content.getBoundingClientRect().height-innerHeight+24;
        if(bottom>start+4)points.push(bottom);
      }
      stops=points.map(y=>Math.max(0,Math.min(y,limit))).sort((a,b)=>a-b).filter((y,i,all)=>!i||y-all[i-1]>4);
    };
    const enabled=()=>desktop.matches&&!root.closest('[inert]')&&window.SCROLL_STUDY?.state==='released';
    const destination=direction=>direction>0?stops.find(y=>y>scrollY+4):stops.findLast(y=>y<scrollY-4);
    const move=target=>{
      cancel();locked=true;root.dataset.homeScrolling='true';
      const started=performance.now();
      window.scrollTo({top:target,behavior:reduced.matches?'instant':'smooth'});
      const settle=()=>{
        if(disposed)return;
        if(Math.abs(scrollY-target)<2||performance.now()-started>1800){
          // Consume gesture momentum so one wheel gesture visits one frame.
          const release=()=>{
            if(performance.now()-lastWheel<180)releaseTimer=setTimeout(release,180);
            else{locked=false;delete root.dataset.homeScrolling;}
          };
          releaseTimer=setTimeout(release,180);
        }else frame=requestAnimationFrame(settle);
      };
      frame=requestAnimationFrame(settle);
    };
    const wheel=event=>{
      if(!enabled()||event.defaultPrevented||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
      if(event.target.closest('input,textarea,select,[contenteditable="true"],[data-native-scroll]'))return;
      lastWheel=performance.now();
      if(locked){event.preventDefault();return;}
      const target=destination(Math.sign(event.deltaY));
      if(target!==undefined){event.preventDefault();move(target);}
    };
    const key=event=>{
      if(event.key==='Escape'){cancel();return;}
      if(!enabled()||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))return;
      const direction=event.key==='PageDown'||(event.key===' '&&!event.shiftKey)?1:event.key==='PageUp'||(event.key===' '&&event.shiftKey)?-1:0;
      if(!direction){if(['Home','End','ArrowUp','ArrowDown'].includes(event.key))cancel();return;}
      if(locked){event.preventDefault();return;}
      const target=destination(direction);
      if(target!==undefined){event.preventDefault();move(target);}
    };
    measure();
    const observer=new ResizeObserver(measure);
    [root,research,plateau,solution,solutionLayout,overview,overviewLayout].forEach(el=>observer.observe(el));
    window.addEventListener('wheel',wheel,{passive:false});
    window.addEventListener('keydown',key);
    window.addEventListener('resize',measure);
    window.addEventListener('pointerdown',cancel,{passive:true});
    window.addEventListener('touchstart',cancel,{passive:true});
    desktop.addEventListener('change',measure);reduced.addEventListener('change',measure);
    return()=>{
      disposed=true;cancel();observer.disconnect();
      window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);
      window.removeEventListener('resize',measure);window.removeEventListener('pointerdown',cancel);
      window.removeEventListener('touchstart',cancel);
      desktop.removeEventListener('change',measure);reduced.removeEventListener('change',measure);
    };
  },[ref]);
}
