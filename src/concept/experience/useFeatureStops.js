'use client';
import {useEffect} from 'react';
import {nextFeatureStop} from './feature-stops';

export default function useFeatureStops(ref){
  useEffect(()=>{
    const root=ref.current;
    const overview=root.querySelector('#overview'),cards=root.querySelector('#benefits');
    const grid=cards.querySelector('.xp-benefit-grid'),remi=root.querySelector('#remi-sequence');
    const desktop=matchMedia('(min-width:901px) and (min-height:701px)');
    const reduced=matchMedia('(prefers-reduced-motion:reduce)');
    let stops=[],frame=0,releaseTimer=0,locked=false,lastWheel=0,disposed=false;
    const top=el=>el.getBoundingClientRect().top+window.scrollY;
    const paint=()=>{
      if(!desktop.matches){delete cards.dataset.scrollFrame;return;}
      cards.dataset.scrollFrame='complete';
    };
    const cancel=()=>{
      if(locked)window.scrollTo({top:scrollY,behavior:'instant'});
      cancelAnimationFrame(frame);clearTimeout(releaseTimer);locked=false;
    };
    const measure=()=>{
      cancel();
      stops=[top(overview)+overview.offsetHeight-innerHeight,top(cards),...(cards.offsetHeight>innerHeight+4?[top(cards)+cards.offsetHeight-innerHeight]:[]),top(remi)-32];
      paint();
    };
    const move=target=>{
      cancel();locked=true;
      const started=performance.now();
      window.scrollTo({top:target,behavior:reduced.matches?'instant':'smooth'});
      const settle=()=>{
        if(disposed)return;
        if(Math.abs(scrollY-target)<2||performance.now()-started>1800){
          // Consume the tail of a trackpad gesture, never skip two reading frames.
          const release=()=>{
            if(performance.now()-lastWheel<180)releaseTimer=setTimeout(release,180);
            else locked=false;
          };
          releaseTimer=setTimeout(release,180);
        }else frame=requestAnimationFrame(settle);
      };
      frame=requestAnimationFrame(settle);
    };
    const wheel=event=>{
      if(!desktop.matches||root.closest('[inert]')||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
      if(event.target.closest('input,textarea,select,[contenteditable="true"],[data-native-scroll]'))return;
      lastWheel=performance.now();
      if(locked){event.preventDefault();return;}
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
      let target=nextFeatureStop(scrollY,Math.sign(delta),stops);
      // Pause at the fully completed report before the following gesture leaves it.
      if(delta>0&&scrollY<stops[0]-4&&scrollY+delta>=stops[0])target=stops[0];
      if(target!==null){event.preventDefault();move(target);}
    };
    const key=event=>{
      if(event.key==='Escape'){cancel();return;}
      if(!desktop.matches||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))return;
      const direction=event.key==='PageDown'||(event.key===' '&&!event.shiftKey)?1:event.key==='PageUp'||(event.key===' '&&event.shiftKey)?-1:0;
      if(!direction)return;
      if(locked){event.preventDefault();return;}
      const target=nextFeatureStop(scrollY,direction,stops);
      if(target!==null){event.preventDefault();move(target);}
    };
    const resize=measure;
    measure();
    const observer=new ResizeObserver(measure);
    [overview,cards,grid,remi].forEach(el=>observer.observe(el));
    window.addEventListener('wheel',wheel,{passive:false});
    window.addEventListener('keydown',key);
    window.addEventListener('scroll',paint,{passive:true});
    window.addEventListener('resize',resize);
    window.addEventListener('pointerdown',cancel,{passive:true});
    desktop.addEventListener('change',resize);reduced.addEventListener('change',resize);
    return()=>{
      disposed=true;cancel();observer.disconnect();delete cards.dataset.scrollFrame;
      window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);
      window.removeEventListener('scroll',paint);window.removeEventListener('resize',resize);
      window.removeEventListener('pointerdown',cancel);
      desktop.removeEventListener('change',resize);reduced.removeEventListener('change',resize);
    };
  },[ref]);
}
