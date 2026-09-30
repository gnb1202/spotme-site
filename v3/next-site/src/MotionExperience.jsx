import React,{useEffect,useRef,useState} from 'react';
import {DesignNode} from './DesignNode';
import data from './generated/motion.json';
import styles from './generated/motion-style';
import {startOpening} from './generated/opening-runtime';
import {startScroll} from './generated/scroll-runtime';
import {useFontAlignment} from './useFontAlignment';
import {setupBackgroundPreview} from './integration/home-background-preview';
import HomePhoneOverview from './integration/HomePhoneOverview';

export default function MotionExperience(){
  const ref=useRef(null),[error,setError]=useState('');
  const epoch=useFontAlignment(ref,'motion-home',{markReady:false});
  useEffect(()=>{
    const controller=new AbortController(),scope=ref.current;
    const disposeBackground=setupBackgroundPreview(scope);
    const study={...data.study,variant:new URLSearchParams(location.search).get('variant')==='b'?'b':'a'};
    let opening,interaction;
    const template=document.createElement('template');template.id='fill-template';template.content.append(scope.querySelector('#fill-source svg').cloneNode(true));scope.append(template);
    (async()=>{
      opening=await startOpening(scope,study,controller.signal);
      if(controller.signal.aborted){opening?.dispose();return;}
      interaction=await startScroll(scope,study,opening.timeline,controller.signal);
      if(controller.signal.aborted){interaction?.dispose();opening?.dispose();return;}
      window.SCROLL_STUDY=interaction.api;
      scope.dataset.ready='true';
    })().catch(e=>{if(!controller.signal.aborted){setError(String(e));document.body.classList.remove('pinned');}console.error(e);});
    return()=>{controller.abort();interaction?.dispose();opening?.dispose();disposeBackground();template.remove();if(window.SCROLL_STUDY===interaction?.api)delete window.SCROLL_STUDY;};
  },[]);
  return <div ref={ref} data-react-motion data-phase="loading"><style>{styles}</style>{data.tree.children.map((node,i)=>node.props?.id==='next-content'?<HomePhoneOverview key={i}/>:<DesignNode key={i} node={node} calibrationEpoch={epoch}/>)}<div id="fill-source" hidden><DesignNode node={data.fill}/></div>{error&&<p role="alert" style={{position:'fixed',top:0,zIndex:100,background:'white',color:'black'}}>{error}</p>}</div>;
}
