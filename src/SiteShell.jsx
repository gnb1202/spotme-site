'use client';
import {Suspense,useEffect} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {AnimatePresence,LayoutGroup,motion,useReducedMotion,useIsPresent} from 'motion/react';
import Lenis from 'lenis';
import pages from './generated/route-loaders';

let preload;
function warmAssets(){
  return preload??=Promise.allSettled(Object.values(pages).map(async load=>{
    const {default:page}=await load(),jobs=[];
    function visit(node){
      if(typeof node==='string')return;
      if(node.tag==='img'&&node.props.src){const image=new Image();image.src=node.props.src;jobs.push(image.decode().catch(()=>{}));}
      node.children?.forEach(visit);
    }
    visit(page.tree);await Promise.all(jobs);
  }));
}
function ScrollDriver(){
  const pathname=usePathname(),params=useSearchParams(),reduced=useReducedMotion();
  const study=params.get('experience')==='scroll';
  useEffect(()=>{
    if(reduced||study)return;
    const lenis=new Lenis({autoRaf:true,lerp:.12,smoothWheel:true,syncTouch:false,anchors:true});
    const visibility=()=>document.hidden?lenis.stop():lenis.start();
    document.addEventListener('visibilitychange',visibility);
    return()=>{document.removeEventListener('visibilitychange',visibility);lenis.destroy();};
  },[pathname,reduced,study]);
  return null;
}
function TransitionFrame({children}){
  const present=useIsPresent(),reduced=useReducedMotion();
  return <motion.div data-transition-active={present} inert={!present} aria-hidden={!present}
    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:[1,1]}}
    transition={{duration:reduced?0:.28,ease:[.22,1,.36,1]}}
    style={{gridArea:'1 / 1',minWidth:0,position:'relative',zIndex:present?1:0,pointerEvents:present?'auto':'none'}}>{children}</motion.div>;
}
export function SiteShell({children}){
  const pathname=usePathname(),router=useRouter(),reduced=useReducedMotion();
  useEffect(()=>{
    if(['/', '/features/', '/remi-ai/', '/video/'].includes(pathname)||pathname.startsWith('/concept'))return;
    const timer=setTimeout(()=>{Object.keys(pages).forEach(route=>router.prefetch(route));void warmAssets();},100);
    return()=>clearTimeout(timer);
  },[router,pathname]);
  // The independent concept owns its motion and does not preload the legacy artwork.
  if(['/', '/features/', '/remi-ai/', '/video/'].includes(pathname)||pathname.startsWith('/concept'))return children;
  return <LayoutGroup id="spotme-site-navigation"><Suspense fallback={null}><ScrollDriver/></Suspense>
    <div style={{display:'grid'}}><AnimatePresence initial={false}>
      <TransitionFrame key={pathname}>{children}</TransitionFrame>
    </AnimatePresence></div>
  </LayoutGroup>;
}
