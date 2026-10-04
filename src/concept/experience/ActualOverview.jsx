'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {motion,AnimatePresence,useMotionValueEvent,useReducedMotion,useScroll} from 'motion/react';
import {art} from './data';
import {Battle} from './RemiJourney';
import reportCells from './report-cells.json';
import {gymGrowthState,gymStages,shouldCelebrateGym} from './gym-progress';
import './actual-overview.css';
import {overviewPhase} from './overview-timing';
import OverviewCheeseRain from './OverviewCheeseRain';

const ease=[.22,1,.36,1];
const clamp=n=>Math.max(0,Math.min(1,n));
const reportRestIds=new Set(['1:5967','1:5990','1:5980','1:5975']);
const reportWorkoutCells=reportCells.filter(cell=>!reportRestIds.has(cell.id));
// Fixed showcase responses adapted to the app's persona.ts rules; not live AI output.
const choices=[
 {name:'루틴 생성',icon:'plugin-routine',title:'가슴 루틴 생성',question:'헬스장에서 할 가슴 운동 루틴을 3종목으로 짜줘. 세트와 쉬는 시간도 알려줘.',answer:'스팟미님, 가슴 운동은 아래 순서로 구성해볼 수 있어요.',items:[{title:'푸쉬업',detail:'3세트 × 10회 · 세트 사이 60초 휴식'},{title:'체스트 프레스 머신',detail:'3세트 × 12회 · 세트 사이 90초 휴식'},{title:'덤벨 벤치 프레스',detail:'3세트 × 10회 · 세트 사이 90초 휴식'}],closing:'참고용 루틴이에요. 자세를 유지할 수 있는 무게로 시작하고, 버거우면 반복 수나 무게를 낮춰요.'},
 {name:'운동 추천',icon:'plugin-exercise',title:'오늘의 운동 추천',question:'오늘은 헬스장에서 상체 운동을 하고 싶어. 가슴·등·어깨 운동을 하나씩 추천해줘.',answer:'스팟미님, 가슴·등·어깨를 고르게 쓰는 세 종목을 추천해요.',items:[{title:'체스트 프레스 머신 · 가슴',detail:'밀어내는 동작으로 가슴을 운동해요.'},{title:'바벨 로우 · 등',detail:'당기는 동작으로 등 근육을 운동해요.'},{title:'덤벨 숄더 프레스 · 어깨',detail:'위로 밀어 올리며 어깨를 운동해요.'}],closing:'참고용 제안이에요. 익숙한 종목부터, 무게보다 동작을 안정적으로 유지하는 데 집중해요.'},
 {name:'기록 피드백',icon:'plugin-feedback',title:'내 운동 기록 돌아보기',question:'최근 벤치 프레스 기록은 20kg으로 12회씩 3세트야. 이 기록을 보고 피드백해줘.',answer:'스팟미님, 공유해주신 벤치 프레스 기록을 살펴봤어요.',paragraphs:['20kg으로 12회씩 3세트를 완료했고, 총 반복 횟수는 36회예요.','이 기록만으로 자세나 체력 향상을 단정할 수는 없지만, 다음 운동과 비교할 기준이 생겼어요.','다음에는 같은 조건에서 마지막 세트가 얼마나 버거웠는지도 함께 기록해보세요.']},
 {name:'식단 추천',icon:'plugin-food',title:'운동과 함께하는 식사',question:'운동하는 날 먹기 좋은 아침·점심·저녁 메뉴를 간단하게 추천해줘.',answer:'스팟미님, 탄수화물·단백질·채소를 함께 담은 하루 식사 예시예요.',items:[{title:'아침',detail:'오트밀 + 플레인 요거트 + 바나나'},{title:'점심',detail:'잡곡밥 + 닭가슴살 + 채소 반찬'},{title:'저녁',detail:'현미밥 + 두부구이 + 샐러드'}],closing:'양은 활동량과 배고픔에 맞춰 조절해요. 알레르기가 있거나 맞지 않는 식재료는 다른 음식으로 바꿔주세요.'},
];
export {choices as remiChoices};
function Art({id,alt='',...props}){return <img src={art(id)} alt={alt} draggable="false" {...props}/>;}
function Status(){return <div className="ov-status" aria-hidden="true"><b>9:41</b><span>▮▮▮ ◒ ▰</span></div>;}
function Phone({children,dark=false,label}){
 const ref=useRef(null),[scale,setScale]=useState(.8);
 useEffect(()=>{const el=ref.current;const resize=()=>setScale(el.clientWidth/393);resize();const observer=new ResizeObserver(resize);observer.observe(el);return()=>observer.disconnect();},[]);
 return <div className={`ov-phone ${dark?'dark':''}`} ref={ref} role="group" aria-label={label}><div className="ov-canvas" data-reference="393x852" style={{transform:`scale(${scale})`}}><Status/>{children}<div className="ov-home-indicator"/></div></div>;
}
function AppNav(){return <div className="ov-app-nav" aria-hidden="true">{['운동','레미 AI','리포트','랭킹','프로필'].map((name,i)=><div key={name}><Art id={'nav-'+i}/><small>{name}</small></div>)}</div>;}
function ChatDemo(){
 const reduced=useReducedMotion(),[selected,setSelected]=useState(null);
 const choice=selected===null?null:choices[selected];
 const reset=()=>setSelected(null);
 return <div className="ov-chat-demo"><Phone dark label="레미AI 채팅 01B 데모"><AnimatePresence initial={false} mode="wait"><motion.div className="ov-chat-page" key={selected===null?'welcome':'answer-'+selected} initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced?0:.25}}>
{choice?<><div className="ov-chat-heading"><button onClick={reset} aria-label="레미 AI 네 가지 질문으로 돌아가기">‹</button><b>{choice.title}</b></div><div className="ov-chat-question"><em>@{choice.name}</em> {choice.question}</div><div className="ov-chat-answer" aria-live="polite"><div className="ov-answer-author"><span className="ov-ai-avatar"><Art id="ai-mark"/></span><Art id="remi-thinking" className="ov-thinking" alt="답변하는 레미"/></div><motion.div className="ov-answer-content" initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.4,ease}}><p>{choice.answer}</p>{choice.items&&<ol>{choice.items.map(item=><li key={item.title}><b>{item.title}</b><span>{item.detail}</span></li>)}</ol>}{choice.paragraphs?.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{choice.closing&&<p className="ov-answer-closing">{choice.closing}</p>}</motion.div></div></>:<><span className="ov-history">☷ 채팅 내역</span><h3 className="ov-chat-greeting">안녕하세요, 스팟미!<br/>무엇이 궁금한가요?</h3><span className="ov-remi-shadow"/><Art id="remi-front" className="ov-chat-remi" alt="네 가지 질문을 기다리는 레미"/><div className="ov-chat-choices">{choices.map((item,i)=><button key={item.name} disabled={i===0} onClick={i===0?undefined:()=>setSelected(i)} aria-label={i===0?item.name:`${item.name} 데모 보기`}><Art id={item.icon}/><b>{item.name}</b></button>)}</div></>}
 </motion.div></AnimatePresence><div className="ov-chat-input" aria-hidden="true"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" focusable="false"><path d={choice?'M12 3v18M3 12h18':'M5 5l14 14M19 5L5 19'}/></svg></span><span>레미에게 물어보세요</span><Art id="voice"/></div><AppNav/></Phone></div>;
}
function ReportDemo({progress}){
 const reduced=useReducedMotion(),id=useId().replaceAll(':','');
 const p=reduced?1:clamp((progress-.1)/.75);
 const phase=(start,end)=>clamp((p-start)/(end-start));
 // Sample monthly totals, not live user records. Both series use the same scale.
 const julyVolume=18320,augustVolume=28640;
 const shown=phase(0,.45),volume=Math.round(augustVolume*shown),volumeGain=Math.round((augustVolume-julyVolume)*shown),counts=phase(.36,.75),bottom=phase(.65,1);
 const filledCells=Math.floor(counts*reportWorkoutCells.length);
 const filledIds=new Set(reportWorkoutCells.slice(0,filledCells).map(cell=>cell.id));
 const transition={duration:reduced?0:.16,ease:'linear'};
 return <div className="ov-report-demo"><Phone label="운동결과 1B 리포트 데모"><div className="ov-report-date"><span>‹</span><b>2026.08.08</b></div><div className="ov-report-tabs"><span>요약</span><b>8월</b></div>
<div className="ov-report-card"><div className="ov-volume"><span>총 볼륨</span><strong>{volume.toLocaleString('en-US')}<small> kg</small></strong></div>
<svg className="xp-chart ov-report-chart" viewBox="0 0 300 115" aria-label={`월별 누적 운동 볼륨 예시: 7월 ${julyVolume}kg, 8월 ${volume}kg`} role="img"><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5eefd3" stopOpacity=".7"/><stop offset="1" stopColor="#5eefd3" stopOpacity="0"/></linearGradient><clipPath id={id+'clip'}><rect width={260*shown} height="115"/></clipPath></defs><path d="M0 108H260" stroke="#627680" strokeWidth="2"/><g clipPath={`url(#${id}clip)`}><path d="M0 108 L18 103 L32 103 L44 96 L55 91 L70 85 L84 85 L92 80 L104 75 L113 75 L134 65 L153 59 L166 54 L180 48 L207 41 L223 41 L244 32 L260 26 L260 108Z" fill={`url(#${id})`}/><path d="M0 108 L18 103 L32 103 L44 96 L55 91 L70 85 L84 85 L92 80 L104 75 L113 75 L134 65 L153 59 L166 54 L180 48 L207 41 L223 41 L244 32 L260 26" fill="none" stroke="#5eefd3" strokeWidth="1.5"/><path data-series="july" d="M0 108.00 L18 104.80 L32 104.80 L44 100.32 L55 97.13 L70 93.29 L84 93.29 L92 90.09 L104 86.89 L113 86.89 L134 80.49 L153 76.66 L166 73.46 L180 69.62 L207 65.14 L223 65.14 L244 59.39 L260 55.55" fill="none" stroke="#a1a8af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></g><circle cx="260" cy="26" r="4" fill="#5eefd3" opacity={shown>=.99?1:0}/></svg>
   <div className="ov-report-legend"><span>● 7월</span><span>● 8월</span></div>
<div className="ov-report-middle"><motion.div animate={{opacity:.22+.78*counts,y:reduced?0:12*(1-counts)}} transition={transition}><h3>7월보다<br/><em>{volumeGain.toLocaleString('en-US')} kg</em><br/>더 들었어요</h3></motion.div><div><div className="ov-calendar" aria-hidden="true">{reportCells.map(cell=><motion.i key={cell.id} data-node={cell.id} style={{left:cell.x,top:cell.y,width:cell.size,height:cell.size}} animate={{opacity:filledIds.has(cell.id)?1:.35,scale:reduced?1:filledIds.has(cell.id)?1:.8}} transition={transition} className={filledIds.has(cell.id)?'active':''}/>)}</div><p>총 운동 횟수</p><b>{filledCells}</b></div></div>
   <div className="ov-report-bottom">{[['bench','제일 많이 한 운동','벤치 프레스'],['part-chest-active','제일 많이 한 부위','가슴']].map(([asset,label,name],i)=><motion.div key={asset} animate={{opacity:.15+.85*phase(.65+i*.12,.86+i*.14),y:reduced?0:18*(1-bottom)}} transition={transition}><p>{label}</p><Art id={asset} alt={name}/><b>{name}</b></motion.div>)}</div>
  </div><div className="ov-report-next" aria-hidden="true">다음</div>
 </Phone></div>;
}
function GymDemo({progress,active}){
 const reduced=useReducedMotion(),state=gymGrowthState(reduced?1:progress),stage=gymStages[state.index];
 const previous=useRef(state.index),serial=useRef(0),[impact,setImpact]=useState(null);
 useEffect(()=>{
  const before=previous.current;previous.current=state.index;
  if(shouldCelebrateGym(before,state.index,active,reduced))setImpact({id:++serial.current,stage:state.index});
  else if(!active||reduced||state.index<before)setImpact(null);
 },[state.index,active,reduced]);
 return <div data-gym-reveal={state.reveal.toFixed(3)} data-gym-stage={stage.asset}>
  <Phone label="헬스장 키우기 실제 화면 구성">
   <div className="ov-gym-heading"><span>‹</span><b>{stage.name}</b><span><Art id="cheese"/>{state.wallet}</span></div>
   <div className={`ov-gym-progress ${state.complete?'is-rare':''}`}><span>{state.complete?'RARE':'NORMAL'}</span><b>{state.complete?gymStages[2].task:stage.task}</b><div role="progressbar" aria-label="헬스장 업그레이드" aria-valuemin={0} aria-valuemax={100} aria-valuenow={state.percent}><i style={{transform:`scaleX(${state.fill})`}}/><small>{state.percent}%</small></div></div>
   <div className="ov-gym-image">{gymStages.map((item,i)=><Art key={item.asset} id={item.asset} alt={item.name} style={{opacity:state.layers[i]}} aria-hidden={i!==state.index}/>)}
    {impact&&!reduced&&active&&<div key={impact.id} className={`ov-gym-impact ${impact.stage===3?'is-rare':''}`} style={{height:impact.stage===1?140:278}} aria-hidden="true" onAnimationEnd={event=>{if(event.target===event.currentTarget)setImpact(current=>current?.id===impact.id?null:current);}}>
     <span className="ov-gym-bloom"/><span className="ov-gym-ring"/><span className="ov-gym-ring second"/><span className="ov-gym-shine"/>
     {Array.from({length:impact.stage===3?12:8},(_,i)=>{const angle=i*Math.PI*2/(impact.stage===3?12:8);return <i key={i} className="ov-gym-spark" style={{'--dx':`${Math.cos(angle)*145}px`,'--dy':`${Math.sin(angle)*(impact.stage===1?68:125)}px`,'--delay':`${i%3*35}ms`}}/>;})}
    </div>}
   </div>
   <div className="ov-gym-bottom"><Art id="cheese"/><span>{state.amount}/{state.cost}</span><div>업그레이드</div></div>
   {state.complete&&<div className="ov-gym-success"><b>헬스장이 성장했어요!</b><em>{stage.name}</em></div>}
  </Phone>
 </div>;
}
function BattleDemo({progress}){const reduced=useReducedMotion();return <div><Phone label="운동과 전투 진행 예시"><div className="rj-canvas ov-shared-battle" inert><Battle stage={progress>.7?7:progress>.4?6:5} go={()=>{}} reduced={reduced} adjustment={{weight:15,reps:14}}/></div></Phone></div>;}
const stories=[
 {id:'overview-remi',label:'레미 AI',title:<>나에게 맞추는<br/>레미 AI</>,description:'루틴을 만들고, 운동을 고르고, 기록과 식사를 돌아보는 순간까지. 궁금한 것을 레미와 이야기해요.'},
 {id:'overview-gym',label:'헬스장 성장',title:<>오늘의 운동으로<br/>달라지는 나의 공간</>,description:'운동 퀘스트로 모은 치즈를 헬스장에. 꾸준함이 쌓이는 모습을 눈으로 확인해요.'},
 {id:'overview-battle',label:'운동과 전투',title:<>한 세트의 운동이<br/>레미의 한 번의 공격으로</>,description:'내가 운동할 때 레미도 함께 싸워요. 마지막 몬스터를 물리치고 오늘의 운동을 마무리해요.'},
 {id:'overview-report',label:'운동 리포트',title:<>얼마나 달라졌는지,<br/>한눈에 보이도록</>,description:'총 운동 볼륨부터 운동 횟수, 가장 많이 한 운동과 부위까지. 흩어진 기록이 하나의 리포트로 모여요.'},
];
export default function ActualOverview(){
 const ref=useRef(null),[progress,setProgress]=useState(0),reduced=useReducedMotion();
 const [timing,setTiming]=useState(null);
 useEffect(()=>{
  const section=ref.current,sticky=section.querySelector('.ov-reference-sticky');
  const measure=()=>{
   const step=sticky.clientHeight,total=section.offsetHeight-window.innerHeight;
   const first=Math.max(1,section.offsetHeight-step*4);
   setTiming(previous=>previous?.first===first&&previous?.step===step&&previous?.total===total?previous:{first,step,total});
  };
  measure();const observer=new ResizeObserver(measure);observer.observe(section);observer.observe(sticky);
  window.addEventListener('resize',measure);
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
 },[]);
 const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
 useMotionValueEvent(scrollYProgress,'change',setProgress);
 const phase=timing?overviewPhase(progress,timing):progress*4;
 const active=Math.min(3,Math.floor(phase));
 const reportProgress=clamp(phase-3);
 return <section ref={ref} className="actual-overview ov-reference" id="overview" aria-labelledby="xp-title">
  {stories.map((item,index)=><span key={item.id} id={item.id} className="ov-anchor" style={{top:index===0?0:`calc(var(--ov-intro-distance) + ${(index-1)*100}svh + 1px)`,scrollMarginTop:'-80px'}} aria-hidden="true"/>)}
  <div className="ov-reference-sticky">
   <OverviewCheeseRain section={ref} reduced={reduced}/>
   <div className="ov-reference-layout xp-wrap">
    <div className="ov-reference-copy">
     <h1 id="xp-title">운동을 이어가는 일은<br/>한결 즐겁게</h1>
     <div className="ov-reference-list">{stories.map((item,index)=><div key={item.id} className={`ov-reference-feature ${active===index?'selected':''}`}>
      <h2 id={item.id+'-title'} aria-current={active===index?'step':undefined}>{item.label}</h2>
      <motion.div className="ov-reference-body" initial={false} animate={{height:active===index?'auto':0,opacity:active===index?1:0}} transition={{duration:reduced?0:.35,ease}} inert={active!==index} aria-hidden={active!==index}>
       <p>{item.description}</p>
      </motion.div>
     </div>)}</div>
    </div>
    <div className="ov-reference-art">
     <div className="ov-reference-glow" aria-hidden="true"/>
     <div className="ov-reference-tilt"><div className="ov-reference-device"><div className="ov-reference-mask">
      <motion.div className="ov-reference-screens" initial={false} animate={{y:`-${active*100}%`}} transition={{duration:reduced?0:.7,ease}}>
       {stories.map((item,index)=><div key={item.id} className="ov-reference-screen" inert={active!==index} aria-hidden={active!==index} aria-labelledby={item.id+'-title'}>
        {index===0?<ChatDemo/>:index===1?<GymDemo active={active===1} progress={reduced?1:clamp(phase-1)}/>:index===2?<BattleDemo progress={reduced?1:clamp(phase-2)}/>:<ReportDemo progress={reportProgress}/>}
       </div>)}
      </motion.div>
     </div></div></div>
     
    </div>
   </div>
  </div>
 </section>;
}
