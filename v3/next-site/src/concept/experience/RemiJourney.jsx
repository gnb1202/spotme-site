'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion,useInView} from 'motion/react';
import {art,checkpoints} from './data';
import './remi-journey.css';
import {scrollJourneyTo} from './journey-scroll';
import CheesePop from './CheesePop';

// App reference canvas: 393 × 852. Artwork only is raster; every control is HTML.
const ease=[.22,1,.36,1];
export const journeyStages=[
 ['오늘의 루틴','내 조건을 확인하고',0],['AI 추천 운동','레미가 준비한 운동을 확인해요',0],
 ['운동 중 도움 요청','마이크를 눌러 레미를 불러요',1],['음성 요청','“체스트 프레스, 15kg으로 낮춰줘”',1],
 ['세트 중량 조정','20kg에서 15kg으로',1],['조정 완료','바뀐 중량으로 다시 시작해요',1],
 ['마지막 세트','운동이 레미의 공격으로 이어져요',2],['운동 완료','몬스터를 물리쳤어요',2],['운동 결과','오늘의 운동을 기록해요',2],
];
const exercises=[['pushup','푸쉬업','4세트 × 15회'],['chest','체스트 프레스 머신','4세트 × 20kg × 14회'],['row','바벨 로우','4세트 × 20kg × 14회'],['shoulder','덤벨 래터럴 레이즈','4세트 × 4kg × 14회'],['press','덤벨 숄더 프레스','4세트 × 5kg × 14회']];
function Art({id,alt='',...props}){return <img src={art(id)} alt={alt} draggable="false" {...props}/>;}
function Status(){return <div className="rj-status" aria-hidden="true"><b>9:41</b><span>▮▮▮ ◒ ▰</span></div>;}
function Primary({children,onClick,...props}){return <button className="rj-primary" onClick={onClick} {...props}>{children}</button>;}
function Routine({stage,go,reduced}){
 const ready=stage===1;
 return <div className="rj-routine">
  <button className="rj-close" aria-label="루틴 소개 처음으로" onClick={()=>go(0)}>×</button>
  <div className="rj-routine-heading"><b>AI 추천 운동</b><button onClick={()=>go(0)}>다시 추천</button></div>
  <button className={`rj-ai-banner ${ready?'is-ready':''}`} onClick={()=>go(1)} aria-label="오늘의 루틴을 준비했어요. AI 추천 운동 보기"><Art id="ai-mark"/><span><b>{ready?'AI가 만든 최적의 루틴이에요':'오늘의 루틴을 준비했어요'}</b><small>{ready?<>나의 데이터를 분석해서<br/>가장 적합한 루틴을 구성했어요.</>:<>오늘의 조건에 맞춰 준비한<br/>운동 목록을 확인해 보세요.</>}</small></span></button>
  <div className="rj-filters">{['1시간','운동 도구','운동 목적','컨디션'].map(t=><span key={t}>{t}<i>›</i></span>)}</div>
  <motion.div className="rj-routine-content" initial={false} animate={{opacity:ready?1:.24,filter:ready?'blur(0px)':'blur(3px)'}} transition={{duration:reduced?0:.5}} aria-hidden={!ready}>
   <b className="rj-part-label">운동 부위</b><div className="rj-parts">{[['chest','가슴',8],['back','등',4],['shoulder','어깨',8]].map(([id,label,n])=><div key={id}><Art id={'part-'+id}/><span><b>{label}</b><small>{n}세트</small></span></div>)}</div>
   <b className="rj-count">5종목 · 46분</b><div className="rj-warmup"><b>워밍 스트레칭</b> 운동 전 스트레칭을 해주세요!</div>
   <div className="rj-exercise-list">{exercises.map(([id,name,detail])=><div className="rj-exercise-row" key={id}><span className="rj-exercise-icon"><Art id={id}/></span><div><b>{name}</b><small>{detail}</small></div><span className="rj-feedback"><Art id="like"/><Art id="dislike"/></span></div>)}</div>
  </motion.div>
  {ready&&!reduced&&<div className="rj-magic" aria-hidden="true"><motion.i initial={{y:-180,opacity:0}} animate={{y:750,opacity:[0,.8,.5,0]}} transition={{duration:1.9,delay:.45,ease:[.4,0,.3,1]}}/>{Array.from({length:10},(_,i)=><motion.span key={i} style={{left:32+(i*47)%310,top:150+(i*83)%430}} initial={{scale:0,opacity:0}} animate={{scale:[0,1.8,1.2,0],opacity:[0,1,.8,0],y:-42}} transition={{duration:1.65,delay:.55+i*.065}}>✦</motion.span>)}</div>}
  <div className="rj-bottom"><Primary onClick={()=>go(ready?2:1)}>{ready?'시작하기':'추천 운동 확인하기'}</Primary></div>
 </div>;
}
export function Battle({stage,go,reduced,adjustment}){
 const adjusted=stage>=5,hit=stage===6,done=stage===7,muted=stage===2;
 return <div className={`rj-battle ${muted?'rj-focus-mic':''}`} data-battle-stage={stage}>
  <div className="rj-battle-base" inert={stage===3}>
   <div className="rj-battle-toolbar"><b>◷ {stage>=6?'45:52':'12:08'}</b><button onClick={()=>go(4)}>운동 수정</button></div>
   <div className="rj-arena">
    {!done&&<><Art id="battle-bg" className="rj-battle-background"/><Art id="platform" className="rj-platform monster"/><Art id="platform" className="rj-platform hero"/><div className="rj-hp"><b>슬라임 <small>Lv.1</small></b><span><motion.i initial={false} animate={{scaleX:hit?0:adjusted?.35:.75}} transition={{duration:reduced?0:.6}}/></span></div><motion.div className="rj-enemy" initial={false} animate={hit?{x:reduced?0:[0,9,-6,0],y:reduced?0:18,rotate:reduced?0:12,opacity:.15}:{x:0,y:0,rotate:0,opacity:1}} transition={{duration:reduced?0:.8}}><Art id={hit?'monster-hit':'monster'} alt="슬라임"/></motion.div></>}
    <motion.div className={`rj-hero ${done?'complete':''}`} initial={false} animate={{x:hit&&!reduced?[0,20,0]:0}} transition={{duration:reduced?0:.35}}><Art id={done?'fighter-complete':hit?'fighter-hit':'fighter'} alt="운동 파트너 레미"/></motion.div>
    <div className="rj-battle-message">{done?'모든 운동 세트를 완료했다!':hit?<>레미의 마지막 공격!<br/>몬스터를 처치했다!</>:adjusted?'중량을 조정했다. 다시 힘내보자!':'레미가 당신을 기다리고 있다'}</div>
   </div>
   <div className="rj-set-grid">{exercises.slice(0,4).map(([id,name,detail],i)=>{
    const current=i===(adjusted?1:0),finished=done||(adjusted&&!current);
    const remaining=hit?0:adjusted?1:4;
    return <button key={id} data-exercise={id} className={finished?'finished':current?'active':''} disabled={finished&&!done} onClick={()=>go(done?8:6)}><b>{name}</b><small>{adjusted&&id==='chest'?`4세트 × ${adjustment.weight}kg × ${adjustment.reps}회`:detail}</small><strong>{finished?'✓':`${remaining}/4`}</strong></button>;
   })}</div>
   <div className="rj-battle-actions"><Primary onClick={()=>go(8)}>운동 종료</Primary><button className="rj-help" onClick={()=>go(3)}>HELP!</button></div>
  </div>
  <div className="rj-chatbar" inert={stage===3}><button className="rj-chat-label" onClick={()=>go(3)}><Art id="ai-mark"/>레미에게 물어보세요</button><button className="rj-mic" aria-label="레미에게 음성으로 중량 조정 요청하기" onClick={()=>go(3)}><Art id="voice"/>{muted&&!reduced&&<motion.span aria-hidden="true" initial={{scale:1,opacity:.6}} animate={{scale:1.8,opacity:0}} transition={{duration:1,repeat:1}}/>}</button></div>
  {stage===3&&<div className="rj-overlay"><div className="rj-voice-dialog" role="group" aria-label="음성 요청 예시"><b>파트너가 음성을 듣는 중</b><Art id="listening"/><p>“체스트 프레스, 15kg으로 낮춰줘”</p><button onClick={()=>go(4)}>요청 결과 보기 →</button></div></div>}
 </div>;
}
function SetEditor({go,adjustment}){
 const [weight,setWeight]=useState(adjustment.weight),[reps,setReps]=useState(adjustment.reps);
 return <div className="rj-editor"><div className="rj-editor-underlay" aria-hidden="true"><span>‹</span><div className="rj-exercise-row"><span className="rj-exercise-icon"><Art id="chest"/></span><div><b>체스트 프레스 머신</b><small>4세트 × 20kg × 14회</small></div></div><div className="rj-set-count">−　 세트　 ＋</div>{[1,2,3,4].map(n=><div className="rj-editor-row" key={n}><b>{n}</b><span>20kg</span><span>14회</span></div>)}</div>
  <div className="rj-overlay"><div className="rj-sheet" role="group" aria-label="세트 중량 조정"><i className="rj-handle"/><header><span>삭제</span><b>체스트 프레스 머신</b><Art id="voice"/></header><div className="rj-adjust-columns">{[['중량',weight,setWeight,.5,5,'kg'],['횟수',reps,setReps,1,5,'회']].map(([label,value,set,small,big,unit])=><div key={label}><small>{label}</small><strong>{value}</strong>{[small,big].map((amount,i)=><div className="rj-adjust" key={i}><button aria-label={`${label} ${amount}${unit} 줄이기`} onClick={()=>set(v=>Math.max(label==='횟수'?1:0,v-amount))}>−</button><span>{amount}{unit}</span><button aria-label={`${label} ${amount}${unit} 늘리기`} onClick={()=>set(v=>v+amount)}>＋</button></div>)}</div>)}</div><Primary onClick={()=>go(5,{weight,reps})}>남은 세트 통일</Primary></div></div>
 </div>;
}
function Results({go}){return <div className="rj-results"><h3>2026.08.08</h3><div className="rj-result-tabs"><b>요약</b><span>8월</span></div><div className="rj-result-chips"><span>◷ 46분</span><span>▮ 20세트</span></div><div className="rj-photo"><span>▧</span>사진 추가</div><div className="rj-fatigue"><div>{['chest','back','shoulder'].map(id=><span key={id}><Art id={'part-'+id}/></span>)}</div><p>다음 운동은 <em>가슴, 등, 어깨를 제외</em>한 부위로<br/>운동해보세요.</p></div><div className="rj-exercise-row"><span className="rj-exercise-icon"><Art id="pushup"/></span><div><b>푸쉬업</b><small>4세트 완료</small></div></div><div className="rj-bottom"><Primary onClick={()=>go(0)}>처음부터 다시 보기</Primary></div></div>;}

export default function RemiJourney({useSequence}){
 const ref=useRef(null),frame=useRef(null),[stage,select]=useSequence(ref,journeyStages.length),reduced=useReducedMotion(),[scale,setScale]=useState(.8);
 const phoneVisible=useInView(frame,{amount:.12});
 const [adjustment,setAdjustment]=useState({weight:15,reps:14});
 const cancelScroll=useRef(()=>{});
 useEffect(()=>{
  const cancel=()=>cancelScroll.current();
  const events=['wheel','touchstart','pointerdown','keydown','resize'];
  events.forEach(event=>window.addEventListener(event,cancel,{passive:true}));
  return()=>{cancel();events.forEach(event=>window.removeEventListener(event,cancel));};
 },[]);
 const group=journeyStages[stage][2];
 const go=(next,value)=>{
  cancelScroll.current();
  if(value)setAdjustment(value);if(next===0)setAdjustment({weight:15,reps:14});select(next);
  // Desktop select() already scrolls to the selected point in the long sequence.
  // Short/mobile layouts and reduced motion still reveal the phone after the CTA.
  if(stage===0&&next===1&&(reduced||!window.matchMedia('(min-width:901px) and (min-height:701px)').matches)){
   cancelScroll.current=scrollJourneyTo(frame.current.getBoundingClientRect().top+window.scrollY-32,{reduced});
  }
 };
 useEffect(()=>{const element=frame.current;let active=true;const update=()=>{if(active&&element.isConnected)setScale(element.clientWidth/393);};update();const observer=new ResizeObserver(update);observer.observe(element);return()=>{active=false;observer.disconnect();};},[]);
 const isBattle=stage>=2&&stage<=7&&stage!==4;
 return <section className="xp-remi rj" id="remi-sequence" aria-labelledby="xp-remi-title" onKeyDown={event=>{if(event.key==='Escape'&&(stage===3||stage===4))go(2);}}><div hidden aria-hidden="true">{['voice','listening','fighter-hit','fighter-complete','monster-hit','battle-bg','platform'].map(id=><Art key={id} id={id} loading="eager"/>)}</div><div className="xp-wrap xp-remi-heading"><p className="xp-eyebrow">계획부터 운동하는 순간까지</p><h2 id="xp-remi-title">혼자 고민하던 운동,<br/>이제 레미와 함께.</h2></div>
  <div className="rj-scroll" ref={ref}><div className="rj-sticky"><div className="xp-wrap rj-layout">
   <div className="rj-visual"><CheesePop active={stage===7} visible={phoneVisible} reduced={reduced}/><div className="rj-device-wrap" style={{'--rj-scale':scale}}><div className="rj-device" ref={frame}><div className="rj-canvas" style={{transform:`scale(${scale})`}} data-stage={stage} data-reference="393x852"><Status/>
    <motion.div className="rj-screen" key={stage<=1?'routine':isBattle?'battle':stage===4?'editor':'results'} initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={{duration:reduced?0:.3}}>
     {stage<=1?<Routine stage={stage} go={go} reduced={reduced}/>:stage===4?<SetEditor go={go} adjustment={adjustment}/>:stage===8?<Results go={go}/>:<Battle stage={stage} go={go} reduced={reduced} adjustment={adjustment}/>}
    </motion.div><div className="rj-home-indicator"/>
   </div></div>{stage===0&&<div className="rj-routine-cue" data-playing={phoneVisible&&!reduced} aria-hidden="true"><svg viewBox="0 0 72 28">{[0,1,2].map(i=><path key={i} d={`M${20+i*23} 3 L${8+i*23} 14 L${20+i*23} 25`} style={{'--cue-delay':`${(2-i)*.13}s`}}/>)}</svg><span>클릭!</span></div>}</div></div>
   <div className="rj-story"><div className="rj-checkpoints">{checkpoints.map((item,i)=><div className={`rj-checkpoint ${group===i?'selected':''}`} key={item.title}><button onClick={()=>go([0,2,6][i])} aria-current={group===i?'step':undefined}><small>0{i+1}</small><h3>{item.title}</h3></button><div hidden={group!==i}><p>{item.description}</p><div className="rj-steps">{journeyStages.map(([label,,g],n)=>g===i?<button key={label} onClick={()=>go(n)} aria-current={stage===n?'step':undefined}>{label}</button>:null)}</div></div></div>)}</div>
    <div className="rj-current" aria-live="polite"><span>0{stage+1} / 09</span><p>{journeyStages[stage][1]}</p></div><div className="rj-paging"><button disabled={stage===0} onClick={()=>go(stage-1)} aria-label="레미 시퀀스 이전 화면">← 이전</button><button disabled={stage===8} onClick={()=>go(stage+1)} aria-label="레미 시퀀스 다음 화면">다음 →</button></div>
    
   </div>
  </div></div></div>
 </section>;
}
