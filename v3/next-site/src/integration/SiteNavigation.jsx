'use client';
import Link from 'next/link';
import {useLayoutEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {motion,useReducedMotion} from 'motion/react';
import {mainNavigation} from './navigation';
import {useSiteNavigation} from './RouteTransition';
import {paletteFor} from './palette';

export default function SiteNavigation(){
  const pathname=usePathname(),navigation=useSiteNavigation(),reduced=useReducedMotion();
  const navRef=useRef(null),[indicator,setIndicator]=useState(null);
  const hidden=pathname.startsWith('/concept/reference')||pathname.startsWith('/concept/review');
  const active=pathname.startsWith('/concept')?'/features/':pathname;
  const target=navigation?.target||active;
  const theme=target==='/video/'?'dark':target==='/features/'?'light':'mint';
  useLayoutEffect(()=>{
    const nav=navRef.current;if(!nav)return;
    let disposed=false;
    const measure=()=>{
      if(disposed)return;
      const selected=nav.querySelector('a[data-selected="true"]');if(!selected)return;
      const box=selected.getBoundingClientRect(),parent=nav.getBoundingClientRect();
      const next={x:box.left-parent.left,width:box.width};
      setIndicator(previous=>previous?.x===next.x&&previous?.width===next.width?previous:next);
    };
    measure();
    const observer=new ResizeObserver(measure);observer.observe(nav);
    for(const link of nav.querySelectorAll('a'))observer.observe(link);
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener('loadingdone',measure);
    return()=>{disposed=true;observer.disconnect();document.fonts.removeEventListener('loadingdone',measure);};
  },[target,hidden]);
  if(hidden)return null;
  return <motion.header className="site-navigation" data-theme={theme} data-route={active} data-navigation-phase={navigation?.phase||'idle'} initial={false}
    animate={{backgroundColor:paletteFor(target).background,color:target==='/video/'?'#fafaf8':'#343a40'}} transition={{duration:reduced?0:.62,ease:[.22,1,.36,1]}}>
    <div className="site-navigation-inner">
      <Link href="/" onClick={e=>navigation?.navigate(e,'/')} aria-label="SPOT ME 홈" className="site-brand"><img src="/brand/spotme-logo-a1.png" alt="SPOT ME" width="1920" height="280"/></Link>
      <nav ref={navRef} aria-label="주요 메뉴">{mainNavigation.map(({label,href})=><Link key={href} href={href} onClick={e=>navigation?.navigate(e,href)} aria-current={active===href?'page':undefined} data-selected={target===href}>
        {label}
      </Link>)}{indicator&&<motion.span className="site-tab-indicator" aria-hidden="true" initial={false} animate={indicator} transition={reduced?{duration:0}:{type:'spring',stiffness:420,damping:38,mass:.8}}/>}</nav>
    </div>
  </motion.header>;
}
