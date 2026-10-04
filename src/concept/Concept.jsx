'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {motion,useReducedMotion,useScroll,useMotionValueEvent} from 'motion/react';
import {asset,capabilities,benefits,journey} from './content';
import './concept.css';

const nav=[['홈','/concept/'],['AI 운동 서포트','/ai/'],['게임처럼 즐기는 운동','/game/'],['파트너 레미','/characters/'],['홍보 영상','/video/']];

export function ConceptHeader(){return <header className="concept-header"><Link href="/concept/" aria-label="SPOT ME 홈"><img className="concept-logo" src={asset('logo')} alt="SPOT ME" width="190" height="40"/></Link><nav aria-label="주요 메뉴">{nav.map(([label,href])=><Link key={href} href={href} aria-current={href==='/concept/'?'page':undefined}>{label}</Link>)}</nav></header>;}

function Phone({items,active,className='',focus=false}){
  const reduced=useReducedMotion();
  return <div className={`concept-phone ${className}`}>
    {items.map((item,index)=><motion.img key={item.id} src={asset(item.id)} alt={`${item.title.replaceAll('\n',' ')} 앱 시안 화면`} aria-hidden={active!==index}
      initial={false} animate={{opacity:active===index?1:0}} transition={{duration:reduced?0:.3}}
      className={active===index?'phone-screen active':'phone-screen'} width="1572" height="3408" draggable="false"/>)}{focus&&<div className={`screen-focus focus-${items[active].id}`} aria-hidden="true"/>}</div>;
}

function Reveal({children,className=''}){
  const reduced=useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced?undefined:{y:[16,0]}} viewport={{once:true,amount:.15}} transition={{duration:.6,ease:[.22,1,.36,1]}}>{children}</motion.div>;
}

export default function Concept(){
  const [feature,setFeature]=useState(0),[step,setStep]=useState(0),[detail,setDetail]=useState(null);
  const dialog=useRef(null),journeyRef=useRef(null),stepValue=useRef(0);
  function selectStep(index){stepValue.current=index;setStep(index);}
  const {scrollYProgress}=useScroll({target:journeyRef,offset:['start start','end end']});
  useMotionValueEvent(scrollYProgress,'change',value=>{
    const next=Math.min(2,Math.max(0,Math.floor(value*3)));
    if(window.matchMedia('(min-width: 761px)').matches&&stepValue.current!==next)selectStep(next);
  });
  useEffect(()=>{
    if(detail)dialog.current?.showModal();
    else if(dialog.current?.open)dialog.current.close();
  },[detail]);
  function featureKeys(event,index){
    const keys={ArrowDown:(index+1)%3,ArrowRight:(index+1)%3,ArrowUp:(index+2)%3,ArrowLeft:(index+2)%3,Home:0,End:2};
    if(!(event.key in keys))return;
    event.preventDefault();const next=keys[event.key];setFeature(next);document.getElementById(`feature-${next}`)?.focus();
  }
  return <div className="concept">
    <a className="concept-skip" href="#capabilities">본문으로 건너뛰기</a>
    <ConceptHeader/>
    <main>
      <section id="capabilities" className="concept-capabilities concept-wrap" aria-labelledby="capabilities-title">
        <div className="capability-copy">
          <p className="concept-eyebrow">나의 AI 운동 파트너, SPOT ME</p>
          <h1 id="capabilities-title">운동의 고민은 덜고,<br/>내 운동에 집중하세요.</h1>
          <div className="capability-list" role="tablist" aria-label="운동 지원 기능" aria-orientation="vertical">
            {capabilities.map((item,index)=><div key={item.id} className={`capability-item ${feature===index?'selected':''}`}>
              <button id={`feature-${index}`} role="tab" aria-selected={feature===index} aria-controls="capability-panel" tabIndex={feature===index?0:-1} onClick={()=>setFeature(index)} onKeyDown={event=>featureKeys(event,index)}>{item.title}<span aria-hidden="true">↗</span></button>
              <p>{item.description}</p>
            </div>)}
          </div>
          <a className="concept-text-link" href="#benefits">운동을 계속할 이유 <span aria-hidden="true">↓</span></a>
        </div>
        <div className="capability-visual" id="capability-panel" role="tabpanel" aria-labelledby={`feature-${feature}`} tabIndex={0}>
          <Phone items={capabilities} active={feature} focus/>
          <p className="visual-caption">{capabilities[feature].focus}</p>
          <img className="capability-remi" src={asset('remi')} alt="" width="1450" height="1080" draggable="false"/>
        </div>
      </section>

      <section id="benefits" className="concept-benefits" aria-labelledby="benefits-title">
        <div className="concept-wrap">
          <Reveal className="benefits-heading"><h2 id="benefits-title">다시 운동하고 싶어지는<br/><span>작은 이유들.</span></h2><p>운동하고, 모으고, 키우고.<br/>오늘의 노력이 또 다른 즐거움으로 이어져요.</p></Reveal>
          <div className="benefit-grid">{benefits.map((item,index)=><Reveal className="benefit-item" key={item.id}>
            <button className={`benefit-art benefit-art-${index}`} onClick={()=>setDetail(item)} aria-label={item.link}>
              <img src="/concept/generated/benefit-objects.png" alt="" loading="lazy" style={{left:`-${index*100}%`}}/>
              <span className="art-open" aria-hidden="true">↗</span>
            </button>
            <h3>{item.title.split('\n').map((line,i)=><span key={line}>{i>0&&<br/>}{line}</span>)}</h3>
            <p>{item.description}</p>
            <button className="concept-text-link" onClick={()=>setDetail(item)}>{item.link} <span aria-hidden="true">↗</span></button>
          </Reveal>)}</div>
          <p className="concept-disclosure">위 그래픽은 기능을 설명하는 이미지예요. 각 항목에서 전달된 앱 시안 화면을 볼 수 있어요.</p>
        </div>
      </section>

      <section id="journey" className="concept-journey concept-wrap" aria-labelledby="journey-title">
        <Reveal className="journey-heading"><h2 id="journey-title">시작은 간단하게.<br/><span>운동은 나답게.</span></h2><p>나를 알려주면, 운동할 준비가 시작돼요.</p></Reveal>
        <div className="journey-layout" ref={journeyRef}>
          <div className="journey-sticky"><div className="journey-stage"><Phone items={journey} active={step}/></div><p className="journey-caption">{journey[step].title}</p></div>
          <div className="journey-steps">{journey.map((item,index)=><article key={item.id} id={`step-${index}`} data-step={index} className={`journey-step ${step===index?'selected':''}`}>
            <div className="step-copy"><button onClick={()=>selectStep(index)} aria-current={step===index?'step':undefined}><span className="step-check" aria-hidden="true">✓</span>{item.title}</button><p>{item.description}</p></div>
            <img className="journey-mobile-screen" src={asset(item.id)} alt={`${item.title} 앱 시안 화면`} loading="lazy" width="1572" height="3408"/>
          </article>)}</div>
        </div>
        <p className="concept-disclosure">전달된 시안으로 구성한 사용 흐름 예시이며, 일부 중간 단계는 생략했어요.</p>
      </section>
    </main>
    <footer className="concept-footer concept-wrap"><img src={asset('logo')} alt="SPOT ME" width="160" height="34"/><p>나의 운동을 보조해주는 AI 운동 파트너</p><Link href="/concept/review/">문구·화면 근거 검토 ↗</Link></footer>
    <dialog ref={dialog} className="concept-dialog" aria-labelledby="screen-dialog-title" onClose={()=>setDetail(null)} onClick={event=>{if(event.target===event.currentTarget)dialog.current.close();}}>
      {detail&&<><div className="dialog-heading"><h2 id="screen-dialog-title">{detail.link.replace(' 보기','')}</h2><button onClick={()=>dialog.current.close()} aria-label="닫기">닫기 ×</button></div><p>전달된 디자인 원본 · 실제 실행 검증 전</p><img src={asset(detail.id)} alt={detail.link} width="1572" height="3408"/><p>{detail.note}</p></>}
    </dialog>
  </div>;
}
