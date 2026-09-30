'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {motion,useReducedMotion} from 'motion/react';
import {routePalette,paletteFor} from './palette';
import {bounded,warmRoute,warmAllAssets} from './route-preload';

const NavigationContext=createContext(null);
export const useSiteNavigation=()=>useContext(NavigationContext);
const order=Object.keys(routePalette);
const ease=[.76,0,.24,1];

export default function RouteTransition({children,navigation}){
 const pathname=usePathname(),router=useRouter(),reduced=useReducedMotion();
 const [transition,setTransition]=useState(null),[booting,setBooting]=useState(true),[bootReady,setBootReady]=useState(false),[progress,setProgress]=useState(0),[showLoading,setShowLoading]=useState(false);
 const current=useRef(null),counter=useRef(0),previous=useRef(pathname),queued=useRef(null),startRef=useRef(null);
 const phase=useCallback((id,value)=>{
  if(current.current?.id!==id)return;
  const next={...current.current,phase:value};current.current=next;document.documentElement.dataset.routeTransition=value;setTransition(next);
 },[]);
 const begin=useCallback((target,value='covering',from=pathname)=>{
  const next={id:++counter.current,target,phase:value,direction:order.indexOf(target)>=order.indexOf(from)?1:-1};
  current.current=next;document.documentElement.dataset.routeTransition=value;setTransition(next);return next;
 },[pathname]);
 const start=useCallback(target=>{
  if(current.current){queued.current=target;return;}
  if(pathname===target)return;
  router.prefetch(target);void warmRoute(target,'high').catch(()=>{});begin(target);
 },[pathname,router,begin]);
 startRef.current=start;
 const navigate=useCallback((event,target)=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(booting)return;start(target);
 },[start,booting]);
 const finish=useCallback(id=>{
  if(current.current?.id!==id)return;
  current.current=null;delete document.documentElement.dataset.routeTransition;setTransition(null);
  window.dispatchEvent(new Event('spotme:route-revealed'));
  const target=queued.current;queued.current=null;if(target)startRef.current(target);
 },[]);
 useEffect(()=>{
  let cancelled=false;
  document.documentElement.dataset.routeTransition='boot';
  const unsubscribe=warmAllAssets(router,value=>{if(!cancelled)setProgress(value);});
  void bounded(Promise.all([unsubscribe.ready,new Promise(resolve=>setTimeout(resolve,650))]),12000).then(()=>{if(!cancelled)setBootReady(true);});
  return()=>{cancelled=true;unsubscribe();};
 },[router]);
 const finishBoot=()=>{setBooting(false);delete document.documentElement.dataset.routeTransition;window.dispatchEvent(new Event('spotme:route-revealed'));};
 useEffect(()=>{
  if(previous.current===pathname)return;
  const from=previous.current;previous.current=pathname;
  if(current.current?.target===pathname)return;
  // Browser history can interrupt a navigation: retire that transaction, then reveal its destination.
  current.current=null;queued.current=null;
  if(routePalette[pathname])begin(pathname,'loading',from);
 },[pathname,begin]);
 useEffect(()=>{
  if(!transition||transition.phase!=='loading'||pathname!==transition.target)return;
  let cancelled=false,observer,timer;
  const prepare=async()=>{
   await bounded(warmRoute(pathname,'high'),6000);
   const images=[...document.querySelectorAll('[data-route-content] img')].filter(img=>{const r=img.getBoundingClientRect();return r.top<innerHeight*1.5&&r.bottom>0;});
   await bounded(Promise.allSettled([document.fonts.ready,...images.map(img=>img.decode())]),3000);
   if(pathname==='/')await new Promise(resolve=>{
    const ready=()=>!!document.querySelector('[data-react-motion][data-ready], [data-react-page="/"]');
    if(ready()){resolve();return;}
    observer=new MutationObserver(()=>{if(ready()){clearTimeout(timer);observer.disconnect();resolve();}});
    timer=setTimeout(()=>{observer.disconnect();resolve();},6000);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-ready']});
   });
   // Leave the incoming page settled under the solid color before uncovering it.
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   if(!cancelled&&current.current?.phase==='loading')phase(transition.id,'revealing');
  };
  void prepare();return()=>{cancelled=true;observer?.disconnect();clearTimeout(timer);};
 },[pathname,transition?.id,transition?.phase,phase]);
 useEffect(()=>{
  setShowLoading(false);
  if(!transition||transition.phase!=='loading')return;
  const hint=setTimeout(()=>setShowLoading(true),1000);
  const timer=setTimeout(()=>phase(transition.id,'error'),18000);
  return()=>{clearTimeout(hint);clearTimeout(timer);};
 },[transition?.id,transition?.phase,phase]);
 useEffect(()=>()=>{current.current=null;delete document.documentElement.dataset.routeTransition;},[]);
 const covered=booting||!!transition;
 const target=transition?.target||pathname;
 const softReveal=target==='/features/'||target==='/remi-ai/';
 return <NavigationContext.Provider value={{navigate,target,phase:booting?'boot':transition?.phase||'idle'}}>
  {navigation}
  <div data-route-content data-site-theme={paletteFor(pathname).name} style={{'--page-mint':paletteFor(pathname).background}} data-route-phase={booting?'boot':transition?.phase||'idle'} aria-busy={covered} inert={covered}>{children}</div>
  {booting&&<motion.div className="route-curtain route-boot" style={{backgroundColor:pathname==='/'?'#000':paletteFor(pathname).background,color:pathname==='/'||pathname==='/video/'?'#fafaf8':'#263d35'}} initial={false} animate={{opacity:bootReady?0:1}} transition={{duration:reduced?0:.45}} onAnimationComplete={()=>{if(bootReady)finishBoot();}}>
   <div className="route-loading" role="status"><span>불러오는 중</span><div className="route-progress" role="progressbar" aria-label="사이트 에셋 로딩" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)}><span style={{transform:`scaleX(${progress})`}}/></div></div>
  </motion.div>}
  {transition&&<motion.div className="route-curtain" key={transition.id} style={{backgroundColor:paletteFor(transition.target).background,color:transition.target==='/video/'?'#fafaf8':'#263d35'}}
   initial={{x:reduced||transition.phase==='loading'?'0%':`${transition.direction*100}%`}}
   animate={{x:transition.phase==='revealing'?(reduced||softReveal?'0%':`${transition.direction*-100}%`):'0%',opacity:(reduced||softReveal)&&transition.phase==='revealing'?0:1}}
   transition={{duration:reduced?0:transition.phase==='revealing'?.7:.62,ease:softReveal&&transition.phase==='revealing'?[.4,0,.2,1]:ease}}
   onAnimationComplete={()=>{
    if(current.current?.id!==transition.id)return;
    if(transition.phase==='covering'){phase(transition.id,'loading');router.push(transition.target,{scroll:true});}
    if(transition.phase==='revealing')finish(transition.id);
   }}>
   {transition.phase==='loading'&&showLoading&&<div className="route-loading" role="status"><span>불러오는 중</span><i/></div>}
   {transition.phase==='error'&&<div className="route-loading" role="alert"><p>페이지를 불러오지 못했어요.</p><a href={transition.target}>다시 불러오기</a><button onClick={()=>finish(transition.id)}>닫기</button></div>}
  </motion.div>}
 </NavigationContext.Provider>;
}
