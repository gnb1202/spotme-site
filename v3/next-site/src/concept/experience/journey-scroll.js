import {animate} from 'motion';

// One eased scroll owner; native smooth scrolling must not stack on each frame.
export function scrollJourneyTo(top,{reduced=false,onComplete}={}){
 const target=Math.max(0,Math.min(top,document.documentElement.scrollHeight-window.innerHeight));
 if(reduced){window.scrollTo({top:target,behavior:'instant'});onComplete?.();return()=>{};}
 const control=animate(window.scrollY,target,{
  duration:1.25,ease:[.45,0,.2,1],
  onUpdate:value=>window.scrollTo({top:value,behavior:'instant'}),onComplete,
 });
 return()=>control.stop();
}
