import React,{StrictMode,useEffect,useLayoutEffect,useRef,useState,lazy,Suspense,startTransition} from 'react';
import {createRoot} from 'react-dom/client';
import pages from './generated/route-loaders';
import {DesignNode} from './DesignNode';
import {useFontAlignment} from './useFontAlignment';
import './generated/site.css';
import {AnimatePresence,LayoutGroup,motion,useIsPresent,useReducedMotion} from 'motion/react';
import {preparePage,prepareAllPages} from './preparePage';

const MotionExperience=lazy(()=>import('./MotionExperience'));
function Page({page}){
  const ref=useRef(null),calibrationEpoch=useFontAlignment(ref,page.route),present=useIsPresent(),reduced=useReducedMotion();
  useEffect(()=>{
    if(!calibrationEpoch)return;
    const timer=setTimeout(()=>{void prepareAllPages();},0);
    return()=>clearTimeout(timer);
  },[calibrationEpoch]);
  useEffect(()=>{if(present){document.title=page.title;document.body.dataset.frame=page.frame;}},[page,present]);
  return <motion.div ref={ref} data-react-page={page.route} data-page-active={present} inert={!present} aria-hidden={!present}
    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:[1,1]}}
    transition={{duration:reduced?0:.28,ease:[.22,1,.36,1]}}
    style={{gridArea:'1 / 1',minWidth:0,alignSelf:'start',position:'relative',zIndex:present?1:0,pointerEvents:present?'auto':'none'}}>
    <DesignNode node={page.tree} calibrationEpoch={calibrationEpoch} enhanceNav={new URLSearchParams(location.search).get('ui')!=='original'}/>
  </motion.div>;
}
const routeComponents=Object.fromEntries(Object.keys(pages).map(route=>[route,lazy(()=>preparePage(route).then(({default:page})=>({default:()=> <Page page={page}/>})))]));
function App(){
  const [url,setUrl]=useState(()=>location.pathname+location.search),restoring=useRef(false);
  useEffect(()=>{
    const navigate=()=>{restoring.current=true;startTransition(()=>setUrl(location.pathname+location.search));};
    const prefetch=event=>{
      const a=event.target.closest?.('a[href]');if(!a)return;
      const target=new URL(a.href);
      if(target.origin===location.origin&&pages[target.pathname])preparePage(target.pathname).catch(()=>{});
    };
    const click=event=>{
      const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||a.target||a.hasAttribute('download'))return;
      const target=new URL(a.href);if(target.origin!==location.origin||(!pages[target.pathname]&&target.pathname!=='/lab/'))return;
      event.preventDefault();const keep=a.hasAttribute('data-keep-scroll'),y=keep?scrollY:0;
      history.replaceState({y:scrollY},'');history.pushState({y},'',target.pathname+target.search+target.hash);restoring.current=true;startTransition(()=>setUrl(target.pathname+target.search));
    };
    addEventListener('popstate',navigate);document.addEventListener('click',click);document.addEventListener('pointerover',prefetch);document.addEventListener('focusin',prefetch);
    return()=>{removeEventListener('popstate',navigate);document.removeEventListener('click',click);document.removeEventListener('pointerover',prefetch);document.removeEventListener('focusin',prefetch);};
  },[]);
  useLayoutEffect(()=>{if(restoring.current){restoring.current=false;scrollTo(0,history.state?.y??0);}},[url]);
  const parsed=new URL(url,location.origin),page=pages[parsed.pathname];
  if(parsed.pathname==='/lab/')return <main style={{padding:40,background:'#101715',color:'#5eefd3',minHeight:'100vh',fontFamily:'sans-serif'}}><h1>SPOT ME · React 로컬 비교</h1><p>원본 에셋과 시안 유지 · 미배포</p><p><a href="/">React 사이트</a></p><p><a href="/?experience=scroll&variant=a">A 오프닝 + 스크롤 충전</a></p><p><a href="/?experience=scroll&variant=b">B 오프닝 + 스크롤 충전</a></p><p><a href="/?experience=scroll&intro=skip">충전부터 바로 보기</a></p></main>;
  if(!page)return <main style={{padding:40}}><h1>페이지를 찾을 수 없습니다.</h1><a href="/">홈으로</a></main>;
  if(parsed.pathname==='/'&&parsed.searchParams.get('experience')==='scroll')return <Suspense fallback={<div style={{minHeight:'100vh',background:'#000'}}/>}><MotionExperience key={url}/></Suspense>;
  const RoutePage=routeComponents[parsed.pathname];
  return <Suspense fallback={<div style={{minHeight:'100vh'}}/>}><div style={{display:'grid'}}><AnimatePresence initial={false} mode="sync"><RoutePage key={parsed.pathname}/></AnimatePresence></div></Suspense>;
}
createRoot(document.getElementById('root')).render(<StrictMode><LayoutGroup id="spotme-site-navigation"><App/></LayoutGroup></StrictMode>);
