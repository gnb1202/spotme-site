'use client';
import {useCallback,useLayoutEffect,useRef,useState} from 'react';
import {demoVideo} from './navigation';
import {fitVideo} from './video-fit';

export default function DemoVideo({node,children}){
  const [playing,setPlaying]=useState(false);
  const [failed,setFailed]=useState(false);
  const container=useRef(null),videoRef=useRef(null),[layout,setLayout]=useState(null);
  useLayoutEffect(()=>{
    const canvas=container.current.closest('.canvas');
    const title=canvas?.querySelector('[data-source-node-id="145:225"]');
    const header=document.querySelector('.site-navigation');
    if(!canvas||!title)return;
    const fit=()=>{
      const box=canvas.getBoundingClientRect();
      if(!box.width)return;
      const next=fitVideo({canvasWidth:box.width,canvasTop:box.top+scrollY,
        viewportHeight:window.visualViewport?.height||innerHeight,
        headerHeight:header?.getBoundingClientRect().height||0,
        titleBottom:title.getBoundingClientRect().bottom+scrollY});
      // Preloaded below-fold artwork must stay below the fitted player on tall mobile screens.
      canvas.style.setProperty('--video-art-top',`${next.top+1036*next.scale+48/(box.width/1920)}px`);
      setLayout(next);
    };
    fit();
    const observer=new ResizeObserver(fit);
    for(const el of [canvas,title,header])if(el)observer.observe(el);
    window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
    return ()=>{observer.disconnect();window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);};
  },[]);
  const initializeVideo=useCallback(video=>{videoRef.current=video;if(video)video.volume=0.5;},[]);
  const play=()=>{
    setPlaying(true);
    videoRef.current?.play().catch(error=>{if(error.name!=='AbortError')setFailed(true);});
  };
  const style=layout?{...node.props.style,left:`${layout.left}px`,top:`${layout.top}px`,transform:`scale(${layout.scale})`,transformOrigin:'0 0'}:node.props.style;
  return <div {...node.props} ref={container} style={style} className={`${node.props.className} video-demo`}>
      <video ref={initializeVideo} aria-label="SPOT ME 시연 영상" src={demoVideo.src} controls={playing} playsInline preload="auto" aria-hidden={!playing} tabIndex={playing?0:-1} style={{opacity:playing?1:0,pointerEvents:playing?'auto':'none'}} onError={()=>setFailed(true)}>
        <a href={demoVideo.src}>시연 영상 파일 열기</a>
      </video>
      {playing&&failed&&<div className="video-demo-error" role="alert">
        <p>영상을 재생하지 못했습니다.</p>
        <button type="button" onClick={()=>{setFailed(false);setPlaying(false);videoRef.current?.pause();videoRef.current?.load();}}>다시 시도</button>
        <a href={demoVideo.src} target="_blank" rel="noreferrer">영상 파일 열기</a>
      </div>}
    {!playing&&<>
      {children}
      <button type="button" className="video-demo-start" onClick={play} aria-label="SPOT ME 시연 영상 재생">
        <span className="video-demo-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v18l15-9z"/></svg>시연 영상 재생</span>
      </button>
    </>}
  </div>;
}
