'use client';
import {useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {remiChoices} from '../concept/experience/ActualOverview';
import {art} from '../concept/experience/data';
import './remi-studio.css';

const explanations=[
 {title:'오늘의 운동을 함께 준비해요.',body:'운동 순서부터 세트와 휴식 시간까지. 레미가 정리한 루틴을 확인해 보세요.'},
 {title:'무슨 운동을 할지 고민될 때.',body:'운동하고 싶은 부위에 맞춰, 어떤 종목을 할 수 있는지 알아보세요.'},
 {title:'쌓인 기록에서 다음 힌트를.',body:'내가 수행한 무게와 횟수를 돌아보고, 다음 운동에서 확인할 점을 짚어봐요.'},
 {title:'운동하는 날의 식사도 함께.',body:'아침부터 저녁까지, 일상에서 참고할 수 있는 식사 예시를 살펴보세요.'},
];
export default function RemiStudio(){
 const [selected,setSelected]=useState(null),reduced=useReducedMotion(),screen=useRef(null);
 const choice=selected===null?null:remiChoices[selected];
 useEffect(()=>{
  screen.current?.scrollTo({top:0,behavior:'instant'});
  // Keep keyboard focus in the phone when its selected button leaves the DOM.
  if(screen.current?.contains(document.activeElement))screen.current.focus({preventScroll:true});
 },[selected]);
 return <main className="remi-studio" id="remi-studio">
  <div className="remi-studio-layout">
   <section className="remi-studio-copy" aria-labelledby="remi-studio-title">
    <p className="remi-studio-eyebrow">나의 AI 운동 파트너</p>
    <h1 id="remi-studio-title">혼자 고민하던 운동,<br/><span>레미와 이야기해요.</span></h1>
    <p className="remi-studio-intro">휴대폰 안의 버튼을 눌러보세요.<br/>레미가 어떤 도움을 주는지 직접 확인할 수 있어요.</p>
    <div className="remi-studio-menu" aria-label="레미 AI 데모 기능">
     {remiChoices.map((item,i)=><button key={item.name} onClick={()=>setSelected(i)} aria-pressed={selected===i} aria-controls="remi-demo-screen"><span className="remi-menu-number">0{i+1}</span><span>{item.name}</span><span className="remi-menu-arrow" aria-hidden="true">↗</span></button>)}
    </div>
    <div className="remi-studio-caption" aria-live="polite">
     <h2>{selected===null?'궁금한 것부터, 가볍게.':explanations[selected].title}</h2>
     <p>{selected===null?'루틴, 운동, 기록, 식사. 네 가지 예시로 레미를 만나보세요.':explanations[selected].body}</p>
    </div>
    <small className="remi-demo-notice">준비된 예시를 체험하는 데모입니다. 실제 AI 요청이나 개인정보 입력은 없어요.</small>
   </section>
   <section className="remi-studio-stage" aria-label="레미 AI 휴대폰 체험">
    <div className="remi-stage-aura" aria-hidden="true"/>
    <div className="remi-demo-phone">
     <div className="remi-phone-status" aria-hidden="true"><span>9:41</span><span className="remi-phone-island"/><span>▮▮▮ ◒ ▰</span></div>
     <header className="remi-phone-header"><button onClick={()=>setSelected(null)} disabled={selected===null} aria-label="레미 AI 처음 화면으로">‹</button><span>레미 AI</span><span className="remi-ready-dot" aria-hidden="true"/></header>
     <div className="remi-demo-screen" id="remi-demo-screen" ref={screen} tabIndex={0} aria-label="레미 AI 예시 대화">
      <AnimatePresence initial={false} mode="wait">
       <motion.div key={selected===null?'welcome':selected} initial={reduced?false:{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-8}} transition={{duration:reduced?0:.22,ease:[.22,1,.36,1]}}>
        {choice?<>
         <div className="remi-demo-question"><span>@{choice.name}</span><p>{choice.question}</p></div>
         <div className="remi-answer-author"><img src={art('remi-thinking')} alt=""/><b>레미</b><span>AI</span></div>
         <article className="remi-demo-answer" aria-label={choice.title}>
          <p>{choice.answer}</p>
          {choice.items&&<ol>{choice.items.map((item,i)=><motion.li key={item.title} initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.28,delay:reduced?0:i*.08}}><span className="remi-answer-index">{String(i+1).padStart(2,'0')}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></motion.li>)}</ol>}
          {choice.paragraphs?.map(text=><p key={text}>{text}</p>)}
          {choice.closing&&<p className="remi-answer-note">{choice.closing}</p>}
         </article>
         <button className="remi-reset" onClick={()=>setSelected(null)}>다른 질문 해보기 <span aria-hidden="true">↗</span></button>
        </>:<div className="remi-demo-welcome">
         <h2>안녕하세요, 스팟미!<br/>무엇이 궁금한가요?</h2>
         <div className="remi-welcome-art"><img src={art('remi-thinking')} alt="생각을 도와주는 레미"/></div>
         <div className="remi-phone-choices">{remiChoices.map((item,i)=><button key={item.name} onClick={()=>setSelected(i)}><img src={art(item.icon)} alt=""/><span>{item.name}</span><span aria-hidden="true">↗</span></button>)}</div>
         <p>어떤 질문이든, 여기서 시작해요.</p>
        </div>}
       </motion.div>
      </AnimatePresence>
     </div>
     <div className="remi-phone-home" aria-hidden="true"/>
    </div>
   </section>
  </div>
 </main>;
}
