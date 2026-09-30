'use client';
import {Suspense,useEffect,useRef} from 'react';
import {useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';
import {DesignNode} from './DesignNode';
import {useFontAlignment} from './useFontAlignment';

const MotionExperience=dynamic(()=>import('./MotionExperience'),{ssr:false,loading:()=> <div className="home-opening-loading" aria-busy="true" aria-label="홈 오프닝 불러오는 중"/>});
function Content({page}){
  const ref=useRef(null),epoch=useFontAlignment(ref,page.route),params=useSearchParams();
  const study=page.route==='/'&&params.get('experience')!=='static';
  useEffect(()=>{document.body.dataset.frame=page.frame;},[page]);
  if(study)return <MotionExperience key={params.toString()}/>;
  return <div ref={ref} data-react-page={page.route} data-page-active="true"><DesignNode node={page.tree} calibrationEpoch={epoch} enhanceNav={params.get('ui')!=='original'}/></div>;
}
export function SitePage({page}){
  return <Suspense fallback={<div><DesignNode node={page.tree}/></div>}><Content page={page}/></Suspense>;
}
