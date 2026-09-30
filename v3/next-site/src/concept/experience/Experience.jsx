'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import {motion,MotionConfig,useMotionValueEvent,useReducedMotion,useScroll,useInView} from 'motion/react';
import {art,reportMonths,tierPreview,tierHaloColors} from './data';
import './experience.css';
import RemiJourney from './RemiJourney';
import ActualOverview from './ActualOverview';
import useFeatureStops from './useFeatureStops';
import './feature-stops.css';
import {scrollJourneyTo} from './journey-scroll';

const ease=[.22,1,.36,1];
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
function Arrow(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>;}
function Artwork({id,alt='',className='',...props}){return <img src={art(id)} alt={alt} className={className} draggable="false" {...props}/>;}
function useSequence(ref,count){
 const [active,setActive]=useState(0),current=useRef(0),pending=useRef(null),reduced=useReducedMotion(),cancelScroll=useRef(()=>{});
 useEffect(()=>{
  const release=()=>{cancelScroll.current();pending.current=null;};
  window.addEventListener('wheel',release,{passive:true});
  window.addEventListener('touchstart',release,{passive:true});
  window.addEventListener('resize',release);
  window.addEventListener('keydown',release);
  window.addEventListener('pointerdown',release);
  return()=>{release();window.removeEventListener('wheel',release);window.removeEventListener('touchstart',release);window.removeEventListener('resize',release);window.removeEventListener('keydown',release);window.removeEventListener('pointerdown',release);};
 },[]);
 const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
 useMotionValueEvent(scrollYProgress,'change',value=>{
  if(reduced||!window.matchMedia('(min-width: 901px) and (min-height: 701px)').matches)return;
  const next=clamp(Math.floor(value*count),0,count-1);
  // A click keeps its selected content stable during smooth travel through earlier steps.
  if(pending.current!==null){if(next!==pending.current)return;pending.current=null;}
  if(next!==current.current){current.current=next;setActive(next);}
 });
 const select=index=>{
  cancelScroll.current();
  current.current=index;setActive(index);
  if(!reduced&&window.matchMedia('(min-width: 901px) and (min-height: 701px)').matches){
   pending.current=index;
   const el=ref.current;
   cancelScroll.current=scrollJourneyTo(el.getBoundingClientRect().top+window.scrollY+(el.offsetHeight-window.innerHeight)*(index+.25)/count,{onComplete:()=>{pending.current=null;}});
  }
 };
 return [active,select];
}
function Transition({children,className='',delay=0}){
 const reduced=useReducedMotion();
 return <motion.div className={className} initial={false} whileInView={reduced?undefined:{opacity:[0,1],y:[36,0]}} viewport={{once:true,amount:.12}} transition={{duration:.75,delay,ease}}>{children}</motion.div>;
}
function Header(){return <div className="feature-header-space" aria-hidden="true"/>;}

// Illustrative cumulative progress: rest days stay flat; both endpoints match the displayed totals.
const reportTrends={
 july:[0,.12,.12,.19,.42,.44,.44,.70,.73,.92,.92,1].map(value=>value*reportMonths[0].total/reportMonths[1].total*.94),
 august:[0,.04,.04,.22,.25,.25,.49,.52,.72,.74,.96,1].map(value=>value*.94),
};
function Chart({active=false}){
 const id=useId().replaceAll(':',''),reduced=useReducedMotion(),shown=active||reduced;
 const path=values=>values.map((value,i)=>`${i?'L':'M'} ${5+i/(values.length-1)*290} ${138-value*118}`).join(' ');
 const d=path(reportTrends.august);
 return <svg className="xp-chart" viewBox="0 0 300 154" role="img" aria-label="7월과 8월 누적 운동 볼륨 예시">
  <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5eefd3" stopOpacity=".3"/><stop offset="1" stopColor="#5eefd3" stopOpacity="0"/></linearGradient><clipPath id={id+'-reveal'}><motion.rect x="0" y="0" height="154" initial={false} animate={{width:shown?300:0}} transition={{duration:reduced?0:shown?.7:.12,ease:'linear'}}/></clipPath></defs>
  {[20,59,98,138].map(y=><path key={y} d={`M5 ${y}H295`} className="xp-chart-grid"/>)}
  <path d={path(reportTrends.july)} fill="none" stroke="#71828b" strokeWidth="2" strokeLinejoin="round"/>
  <path d={d} fill="none" stroke="#5eefd3" strokeWidth="2" opacity=".16" strokeLinejoin="round"/>
  <g clipPath={`url(#${id}-reveal)`}>
   <path d={`${d} L295 138 L5 138Z`} fill={`url(#${id})`}/>
   <path d={d} fill="none" stroke="#5eefd3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
   <circle cx="295" cy={138-reportTrends.august.at(-1)*118} r="4" fill="#5eefd3"/>
  </g>
 </svg>;
}
function Overview(){return <ActualOverview/>;}

// User-requested reference frame; SPOT ME artwork inside remains our original asset.
const gymPhoneFrame='https://static.toss.im/assets/toss-im/asset/shopping/phone-frame.png';
function GymScene({active}){
 const reduced=useReducedMotion();
 return <div className="xp-gym-scene"><Artwork id="gym-before" alt="정비 전 레미의 헬스장" aria-hidden={active}/><motion.div className="xp-gym-after" aria-hidden={!active} initial={false} animate={{opacity:active?1:0}} transition={{duration:reduced?0:.32,ease:[.65,0,.2,1]}}><Artwork id="gym-after" alt="기구가 생긴 레미의 헬스장"/></motion.div></div>;
}
export function GymCard(){
 const [chosen,setChosen]=useState(false),[hover,setHover]=useState(false),reduced=useReducedMotion(),active=chosen||hover;
 return <article className="xp-benefit" id="growth"><Transition><div className="xp-benefit-art xp-gym-art" onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(true);}} onPointerLeave={()=>setHover(false)} onPointerCancel={()=>setHover(false)} onKeyDown={e=>{if(e.key==='Escape'){setChosen(false);setHover(false);}}}>
  <div className="xp-card-kicker">헬스장</div><h3>오늘의 운동이<br/>내 공간을 바꿔요</h3>
  <div className="xp-gym-phone"><div className="xp-gym-screen"><GymScene active={active}/>
   {!reduced&&active&&<motion.div className="xp-gym-sheen" aria-hidden="true" initial={{x:'-180%',opacity:0}} animate={{x:'320%',opacity:[0,.7,.7,0]}} transition={{duration:.725,ease:[.45,0,.15,1],opacity:{times:[0,.16,.65,1]}}}/>}
  </div><img className="xp-gym-phone-frame" src={gymPhoneFrame} alt="" draggable="false"/></div>
  <div className="xp-gym-reward"><Artwork id="cheese" className="xp-gym-reward-cheese"/><div><b>모은 치즈로 한 단계 더</b><small>운동 퀘스트의 보상을 헬스장에</small></div></div>
  
 </div></Transition><h3>꾸준함으로 채워가는<br/>레미와 나의 헬스장</h3><p>퀘스트로 모은 치즈를 사용해<br/>조금씩 나만의 공간을 키워요.</p></article>;
}
function TierCard(){
 const ref=useRef(null),visible=useInView(ref,{amount:.2}),reduced=useReducedMotion();
 const [badge,setBadge]=useState({index:0,turn:0,faces:[0,0]}),[hover,setHover]=useState(false),[playing,setPlaying]=useState(false),[pageVisible,setPageVisible]=useState(true);
 const {index,turn,faces}=badge;
 const [settledTurn,setSettledTurn]=useState(0);
 const arrivingChampion=index===tierPreview.length-1;
 const champion=arrivingChampion&&(reduced||settledTurn===turn);
 const flipTo=next=>setBadge(previous=>{
  if(previous.index===next)return previous;
  const turn=previous.turn+1;
  return {index:next,turn,faces:previous.faces.map((value,face)=>face===turn%2?next:value)};
 });
 const reset=()=>{setHover(false);setPlaying(false);flipTo(0);};
 useEffect(()=>{
  const update=()=>{setPageVisible(!document.hidden);if(document.hidden)reset();};
  update();document.addEventListener('visibilitychange',update);
  return()=>document.removeEventListener('visibilitychange',update);
 },[]);
 useEffect(()=>{if(!visible)reset();},[visible]);
 const running=(hover||playing)&&visible&&pageVisible&&!reduced;
 useEffect(()=>{
  if(!running||index===tierPreview.length-1)return;
  const timer=window.setTimeout(()=>flipTo(index+1),800);
  return()=>window.clearTimeout(timer);
 },[running,index]);
 return <article className="xp-benefit" id="tier-preview"><Transition delay={.08}><div ref={ref} className={`xp-benefit-art xp-tier-art ${champion?'is-challenger':''}`} onPointerEnter={e=>{if(e.pointerType==='mouse'){if(!reduced)flipTo(1);setHover(true);}}} onPointerLeave={reset} onPointerCancel={reset} onKeyDown={e=>{if(e.key==='Escape')reset();}}>
  <div className="xp-card-kicker">티어</div><h3>쌓인 운동은<br/>다음 티어로</h3>
  <div className="xp-tier-stage">
   {tierPreview.map((id,i)=><motion.div key={id} className="xp-tier-halo" data-tier={id} style={{'--tier-glow':tierHaloColors[id]}} aria-hidden="true" initial={false} animate={{opacity:index===i?(arrivingChampion?1:.85):0,scale:reduced?1:arrivingChampion?1.12:1}} transition={{duration:reduced?0:.45,ease}}/>)}
   <div className="xp-tier-celebration" data-prepared={visible&&!reduced&&pageVisible} aria-hidden="true">
    <motion.div className="xp-tier-arrival-ring" initial={false} animate={arrivingChampion&&!reduced?{scale:1.62,opacity:[0,.95,.6,0]}:{scale:.55,opacity:0}} transition={arrivingChampion&&!reduced?{duration:1.15,ease,opacity:{times:[0,.12,.5,1]}}:{duration:0}}/>
    <motion.div className="xp-tier-arrival-ring secondary" initial={false} animate={arrivingChampion&&!reduced?{scale:1.35,opacity:[0,.8,0]}:{scale:.48,opacity:0}} transition={arrivingChampion&&!reduced?{duration:1.05,delay:.12,ease,opacity:{times:[0,.18,1]}}:{duration:0}}/>
    <motion.div className="xp-tier-rays" initial={false} animate={arrivingChampion&&!reduced?{scale:1.3,rotate:12,opacity:[0,.75,0]}:{scale:.6,rotate:-12,opacity:0}} transition={arrivingChampion&&!reduced?{duration:1.3,ease,opacity:{times:[0,.2,1]}}:{duration:0}}/>
   </div>
<motion.div className="xp-tier-badges" initial={false} animate={{rotateY:reduced?0:turn*180}} transition={{duration:reduced?0:.6,ease}} onAnimationComplete={()=>setSettledTurn(turn)}>{faces.map((selected,face)=><div key={face} className="xp-tier-badge" aria-hidden={turn%2!==face} style={{transform:reduced?'none':`rotateY(${face*180}deg)`,opacity:reduced?(turn%2===face?1:0):1}}>{tierPreview.map((id,i)=><Artwork key={id} id={id} alt={id.toUpperCase()+' 티어 배지'} aria-hidden={selected!==i} style={{visibility:selected===i?'visible':'hidden'}} loading="eager"/>)}{<div className="xp-tier-polish" data-prepared={visible&&!reduced&&pageVisible} aria-hidden="true" style={{maskImage:`url(${art('challenger')})`,WebkitMaskImage:`url(${art('challenger')})`}}><motion.div className="xp-tier-polish-streak" initial={false} animate={champion&&!reduced&&turn%2===face?{x:'320%',opacity:[0,.95,.95,0]}:{x:'-180%',opacity:0}} transition={champion&&!reduced&&turn%2===face?{duration:.9,delay:.15,ease:[.45,0,.15,1],opacity:{delay:.15,duration:.9,times:[0,.15,.7,1]}}:{duration:0}}/></div>}</div>)}</motion.div>
  </div>
  <div className="xp-tier-name"><strong>{tierPreview[index].toUpperCase()}</strong></div>
  <div className="xp-tier-progress"><motion.i animate={{scaleX:(index+1)/tierPreview.length}} transition={{duration:reduced?0:.25,ease}}/></div><p className="xp-tier-note">쌓아온 운동 볼륨을 티어로 확인해요</p>
  
 </div></Transition><h3>오늘보다 한 단계 더,<br/>쌓아온 운동이 보이도록</h3><p>운동 기록이 쌓이면 티어도 달라져요.<br/>나의 다음 단계를 확인해 보세요.</p></article>;
}
function ReportCard(){
 const [hover,setHover]=useState(false),[focused,setFocused]=useState(false),[touch,setTouch]=useState(false),sample=reportMonths[1];
 useEffect(()=>{const media=matchMedia('(hover: none)');const update=()=>setTouch(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 return <article className="xp-benefit" id="progress-report"><Transition delay={.16}>
  <div className="xp-benefit-art xp-report-art" tabIndex={0} aria-label="운동 리포트 그래프 미리보기" onPointerEnter={e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')setHover(true);}} onPointerLeave={()=>setHover(false)} onPointerCancel={()=>setHover(false)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}>
   <div className="xp-card-kicker">운동 리포트</div><h3>얼마나 달라졌는지<br/>한눈에</h3>
   <div className="xp-report-sheet">
    <div className="xp-report-volume"><small>이번 달 운동 볼륨</small><strong>{sample.total.toLocaleString()}<span> kg</span></strong></div>
    <Chart active={hover||focused||touch}/>
    <div className="xp-report-legend"><span>7월</span><span>8월</span></div>
    <div className="xp-report-stats"><div><b>{sample.sessions}<small>회</small></b><span>이번 달 운동</span></div><div><b>+{(reportMonths[1].total-reportMonths[0].total).toLocaleString()}<small>kg</small></b><span>지난달 대비</span></div></div>
   </div>
  </div></Transition><h3>막연했던 노력이<br/>분명한 나의 기록으로</h3><p>운동 횟수와 볼륨의 변화를 한눈에.<br/>지난달의 나와 비교해 보세요.</p></article>;
}
function Benefits(){return <section className="xp-benefits xp-wrap" id="benefits" aria-labelledby="xp-benefits-title"><Transition className="xp-benefits-heading"><p className="xp-eyebrow">눈에 보이면, 더 즐거우니까</p><h2 id="xp-benefits-title">쌓이는 운동,<br className="xp-mobile-break"/> <span>눈에 보이는 변화.</span></h2></Transition><div className="xp-benefit-grid"><GymCard/><TierCard/><ReportCard/></div></section>;}

function RemiSequence(){return <RemiJourney useSequence={useSequence}/>;}
export default function Experience(){const ref=useRef(null);useFeatureStops(ref);return <MotionConfig reducedMotion="user"><div className="xp" ref={ref}><a className="xp-skip" href="#overview">본문으로 건너뛰기</a><Header/><main><Overview/><Benefits/><RemiSequence/></main><footer className="xp-footer xp-wrap"><Artwork id="logo" alt="SPOT ME"/><p>운동은 나답게. 성장은 눈에 보이게.</p><div><Link href="/concept/reference/">레퍼런스 비교</Link><Link href="/concept/review/">기존 화면 근거</Link></div></footer></div></MotionConfig>;}
