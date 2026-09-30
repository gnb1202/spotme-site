'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {overviewAsset,overviewFeatures,overviewScreens,overviewTour} from './home-overview-data';
import './home-phone-overview.css';

function Arrow({back=false}){
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={back?'M19 12H5m6-6-6 6 6 6':'M5 12h14m-6-6 6 6-6 6'}/></svg>;
}

export default function HomePhoneOverview(){
  const [screen,setScreen]=useState('home');
  const [playing,setPlaying]=useState(false);
  const [visible,setVisible]=useState(false);
  const [pageVisible,setPageVisible]=useState(true);
  const device=useRef(null),focusPhone=useRef(false);
  const current=overviewScreens[screen];
  const featureIndex=overviewFeatures.findIndex(item=>item.id===current.group);
  const feature=overviewFeatures[featureIndex];

  function revealPhone(){
    if(!window.matchMedia('(max-width:620px)').matches)return;
    device.current?.parentElement.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  }

  function select(id,fromPhone=false){
    setPlaying(false);
    const focusDevice=fromPhone||window.matchMedia('(max-width:620px)').matches;
    focusPhone.current=focusDevice;
    if(id===screen&&focusDevice)device.current?.focus({preventScroll:true});
    setScreen(id);
    if(!fromPhone)revealPhone();
  }

  useEffect(()=>{
    if(focusPhone.current){device.current?.focus({preventScroll:true});focusPhone.current=false;}
  },[screen]);

  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.25});
    observer.observe(device.current);
    const visibility=()=>setPageVisible(!document.hidden);
    visibility();document.addEventListener('visibilitychange',visibility);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);};
  },[]);

  useEffect(()=>{
    if(!playing||!visible||!pageVisible)return;
    const timer=setTimeout(()=>setScreen(id=>overviewTour[(overviewTour.indexOf(id)+1)%overviewTour.length]),4500);
    return()=>clearTimeout(timer);
  },[playing,visible,pageVisible,screen]);

  useEffect(()=>{
    // Decode the small, local screen set before a user selects it.
    if(!visible)return;
    Object.keys(overviewScreens).forEach(id=>{const image=new Image();image.src=overviewAsset(id);image.decode().catch(()=>{});});
  },[visible]);

  return <section id="next-content" className="home-phone-overview" tabIndex={-1} aria-labelledby="home-overview-title"
    onKeyDown={event=>{if(event.key==='Escape')setPlaying(false);}}>
    <main className="hpo-wrap">
      <div className="hpo-section-heading"><span>SPOT ME IN YOUR HANDS</span><span>APP OVERVIEW <i aria-hidden="true">/</i> <b>0{featureIndex+1}</b></span></div>
      <div className="hpo-layout">
        <div className="hpo-intro">
          <p className="hpo-eyebrow">나의 AI 운동 파트너</p>
          <h2 id="home-overview-title">내 운동의<br/>{' '}모든 순간,<br/><em>이 화면 안에.</em></h2>
          <p className="hpo-lead">운동을 준비하고, 레미와 함께하고,<br/>조금씩 달라지는 나를 만나요.</p>
          <div className="hpo-description" aria-live={playing?'off':'polite'} aria-atomic="true">
            <span className="hpo-current-number">0{featureIndex+1} <span>/ 06</span></span>
            <h3>{feature.title[0]}<br/>{' '}{feature.title[1]}</h3>
            <p>{feature.description}</p>
          </div>
          <button className="hpo-play" aria-pressed={playing} onClick={()=>{setPlaying(value=>!value);if(!playing)revealPhone();}}>
            <span className="hpo-play-icon" aria-hidden="true">{playing?<svg viewBox="0 0 24 24"><path d="M9 7v10M15 7v10"/></svg>:<svg viewBox="0 0 24 24"><path d="m9 6 9 6-9 6Z"/></svg>}</span>
            {playing?'자동 둘러보기 멈춤':'자동으로 둘러보기'}
          </button>
        </div>

        <div className="hpo-phone-column">
          <div className="hpo-phone-toolbar">
            <button onClick={()=>select('home')} disabled={screen==='home'} aria-label="운동 홈으로 돌아가기"><Arrow back/><span>운동 홈</span></button>
            <span aria-live={playing?'off':'polite'}>{current.name}</span>
          </div>
          <div className="hpo-device" ref={device} tabIndex={-1} role="group" aria-label={`${current.name} 인터랙티브 화면 미리보기`} data-screen={screen}>
            <span className="hpo-side-button hpo-side-button-left" aria-hidden="true"/>
            <span className="hpo-side-button hpo-side-button-right" aria-hidden="true"/>
            <div className="hpo-display">
              <div key={screen} className="hpo-screen">
                <img src={overviewAsset(screen)} alt={`SPOT ME ${current.name} 앱 화면`} width={screen==='gym'?1660:1572} height={screen==='gym'?3452:3408} draggable={false}/>
                {current.hotspots.map(([label,target,x,y,w,h])=><button key={label} className="hpo-hotspot" aria-label={label} title={label} style={{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`}} onClick={()=>select(target,true)}/>)}
              </div>
              <span className="hpo-island" aria-hidden="true"/>
            </div>
          </div>
          <p className="hpo-phone-hint"><span aria-hidden="true">↗</span> {current.hint||feature.hint}</p>
        </div>

        <div className="hpo-explore">
          <p className="hpo-explore-label">화면을 눌러, 먼저 만나보세요.</p>
          <nav className="hpo-features" aria-label="앱 화면 둘러보기">
            {overviewFeatures.map((item,index)=><button key={item.id} aria-pressed={feature.id===item.id} onClick={()=>select(item.id)}>
              <span className="hpo-feature-number">0{index+1}</span><span>{item.name}</span><Arrow/>
            </button>)}
          </nav>
          <div className="hpo-next">
            <span>이어서 체험하기</span>
            <button onClick={()=>select(current.next)}>{current.action}<Arrow/></button>
            {screen==='workout'&&<button className="hpo-finish" onClick={()=>select('result')}>운동을 마치고 결과 보기<Arrow/></button>}
          </div>
          <p className="hpo-notice">실제 디자인으로 구성한 화면 미리보기예요.<br/>AI 응답과 운동 기록은 예시로 제공됩니다.</p>
        </div>
      </div>
      <footer className="hpo-footer"><p>운동은 나답게.<br/><span>성장은 눈에 보이게.</span></p><Link href="/features/">스팟미 기능 더 알아보기<Arrow/></Link></footer>
    </main>
  </section>;
}
