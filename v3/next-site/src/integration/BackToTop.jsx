'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteNavigation} from './RouteTransition';

export default function BackToTop(){
  const pathname=usePathname(),navigation=useSiteNavigation();
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const update=()=>setScrolled(window.scrollY>1);
    update();
    window.addEventListener('scroll',update,{passive:true});
    return()=>window.removeEventListener('scroll',update);
  },[pathname]);
  if(!['/','/features/','/remi-ai/','/video/'].includes(pathname))return null;
  const goToTop=()=>{
    window.scrollTo({top:0,left:0,behavior:'instant'});
    document.querySelector('.site-brand')?.focus({preventScroll:true});
  };
  return <button type="button" className="site-back-to-top" aria-label="맨 위로 이동" title="맨 위로 이동"
    hidden={!scrolled||navigation?.phase!=='idle'} onClick={goToTop}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 7-7 7 7M12 5v14"/>
    </svg>
  </button>;
}
