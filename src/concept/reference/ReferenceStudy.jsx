'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,MotionConfig,useScroll,useMotionValueEvent,useReducedMotion,useInView} from 'motion/react';
import './reference.css';
import './spotme-palette.css';

// Public artwork remains on its original host. This is an attributed local study,
// not SPOT ME production content or a copy of Toss's application bundle.
const root='https://static.toss.im/assets/toss-im/asset/';
const asset=name=>root+name;
const ease=[.6,0,0,.6];
const features=[
 ['내 자산 모아보기','입출금계좌와 예적금은 물론 주식 투자금까지.\n여러 금융사에 흩어진 모든 자산을 모아서 보여드려요.','내 자산','phone_screen02.png'],
 ['내 자산 관리하기','카드값이나 대출금이 나가기 전에,\n계좌 잔액이 부족하면 알려줘서 연체되지 않게 막아드려요.','내 자산','phone_screen04.png'],
 ['매일 이자 받기','이자 받는 날까지 기다릴 필요 없어요.\n토스뱅크는 이자를 언제 받을지 내가 선택할 수 있어요.','토스뱅크','phone_screen03.png'],
 ['외화 환전하기','토스뱅크는 살 때도, 팔 때도 환전 수수료 평생 무료.\n24시간 내내 무료니까 필요할 때 마음 놓고 환전하세요.','토스뱅크','phone_screen05.png'],
];
function useProgress(ref){
 const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
 const [progress,setProgress]=useState(0);
 useMotionValueEvent(scrollYProgress,'change',setProgress);
 return progress;
}
function goTo(ref,progress,reduced){
 const e=ref.current;if(!e)return;
 window.scrollTo({top:e.getBoundingClientRect().top+window.scrollY+(e.offsetHeight-window.innerHeight)*progress,behavior:reduced?'instant':'smooth'});
}
function Arrow(){return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 15L33 24L24 33M33 24H14" fill="none" stroke="currentColor" strokeWidth="2.4"/></svg>;}
function AssetSection(){
 const ref=useRef(null),stage=useRef(null),p=useProgress(ref),reduced=useReducedMotion();
 const [fit,setFit]=useState({scale:1,x:0,y:0});
 const active=p<.1?-1:Math.min(3,Math.floor((p-.1)/.225));
 useEffect(()=>{const el=stage.current;const update=()=>{const {width,height}=el.getBoundingClientRect(),scale=Math.max(width/1920,height/1080);setFit({scale,x:(width-1920*scale)*(width<=1440?.65:.5),y:(height-1080*scale)/2});};update();const ro=new ResizeObserver(update);ro.observe(el);return()=>ro.disconnect();},[]);
 return <section id="reference-assets" className="ref-assets" ref={ref} aria-label="자산 관리 레퍼런스">
  <div className="ref-sticky" ref={stage}>
   <div className="ref-assets-glow" aria-hidden="true"/>
   <div className="ref-asset-art" aria-hidden="true" style={{transform:`translate(${fit.x}px,${fit.y}px) scale(${fit.scale})`}}>
    <div className="ref-tilted-phone">
     <img className="ref-phone-frame" src={asset('hero-phone-frame4.png')} alt=""/>
     <div className="ref-phone-interior"><div className="ref-phone-glass"/>
      <div className="ref-card-mask"><motion.div className="ref-phone-cards" animate={{y:`${[0,0,-20,-25,-30][active+1]}%`}} transition={{duration:reduced?0:.4,ease}}>
       <img className="ref-phone-nav" src={asset('hero-phone-navigation.png')} alt=""/>
       {features.map((f,i)=><motion.div className="ref-phone-card" key={f[0]} animate={{x:active===i?-30:0,scale:active===i?(i===0?1.05:1.1):1}} transition={{duration:reduced?0:.4,ease}}><img src={asset(f[3])} alt="" style={{opacity:active<0||active===i?1:.2}} draggable="false"/></motion.div>)}
      </motion.div></div>
     </div>
    </div>
   </div>
   <div className="ref-assets-layout"><div className="ref-assets-copy"><h1>자산을 관리하는 일은<br/>한껏 단순하게</h1><div className="ref-feature-list">
    {features.map((f,i)=><div className={`ref-feature ${active===i?'selected':''}`} key={f[0]}><button aria-expanded={active===i} aria-controls={`ref-feature-body-${i}`} onClick={()=>goTo(ref,.1+.225*i+.08,reduced)}>{f[0]}</button><motion.div id={`ref-feature-body-${i}`} className="ref-feature-body" inert={active!==i} animate={{height:active===i?'auto':0,opacity:active===i?1:0}} initial={false} transition={{duration:reduced?0:.5,ease:[.25,.46,.45,.94]}}><p>{f[1]}</p><a href={`https://toss.im/service/${i<2?'asset-management':'create-an-account'}#${i%2+1}`} target="_blank" rel="noreferrer">{f[2]} <span>↗</span></a></motion.div></div>)}
   </div></div><div className="ref-assets-spacer"/></div>
  </div>
 </section>;
}
const financeCopy=[['지금 바로 받을 수 있는\n대출 금리와 한도만 보여드려요','내게 맞는 대출 찾기','loan'],['내가 자주 쓰는 카드보다\n더 혜택 좋은 카드가 있는지 찾아드려요','카드 혜택 비교하기','card'],['전문가가 내 보험을 분석하고\n나에게 필요 없는 보장을 알려드려요','내 보험 점검 받기','insurance']];
const backgrounds=['n7pky7Ga0axJGWNIOIt8Qlx6TDo.png','RgoQMvlXO09MqYjNwNDHWDTjtA.png','3uno5ksiZ2dOLRkQqpA6WoJwI.png'];
function Rate({active,running}){
 const [index,setIndex]=useState(0);const rates=['6.15','5.52','7.48','6.54','8.08'];
 useEffect(()=>{if(active||!running)return;const id=setInterval(()=>setIndex(i=>(i+1)%rates.length),650);return()=>clearInterval(id);},[active,running]);
 return <span className="ref-rate">{active&&'최저 '}{(active?'4.60':rates[index]).split('').map((c,i)=><span className="ref-digit" key={i}><motion.span key={c} initial={{y:'100%'}} animate={{y:0}} transition={{duration:.32,ease:[.22,1,.36,1]}}>{c}</motion.span></span>)}%{active&&<span className="ref-check">✓</span>}</span>;
}
function Loan({active,running}){return <div className="ref-loan-panel"><small>{active?'금리 분석 완료':'금리 분석 중...'}</small><Rate active={active} running={running}/><ul>{['4.60','8.04','7.30','6.48','5.10'].map((rate,i)=><li key={rate}><motion.span className="ref-skeleton" animate={{width:active?'90%':running?['0%',`${90-i*10}%`,`${90-i*10}%`,'0%']:`${90-i*10}%`}} transition={active?{duration:.24}:{duration:2.6,delay:i*.08,repeat:running?Infinity:0,times:[0,.25,.88,1]}}/><motion.div animate={{opacity:active?1:0,x:active?0:24}} transition={{type:'spring',stiffness:560,damping:42,delay:i*.04}}><img src={asset(`card-section/loan-bank-0${i+1}.png`)} alt=""/><span>{String.fromCharCode(65+i)} 은행</span><b>{rate}%</b></motion.div></li>)}</ul></div>;}
function Credit({active,running}){return <div className="ref-credit-perspective"><motion.div className="ref-credit-pair" animate={{rotateY:active?-180:0,y:active?-3:0}} transition={{duration:.72,ease:[.22,1,.36,1]}}>{[0,1].map(i=><motion.div key={i} className="ref-credit-card" animate={{x:active?(i?15:-12):(i?14:-8),y:i?18:-10,z:active?(i?4:52):(i?0:18)}} transition={{duration:.72,ease:[.22,1,.36,1]}}><div className={`ref-credit-face ${i?'blank':''}`}>{!i&&<><img src={asset('card-section/card-before.png')} alt=""/><div><small>A은행 카드</small><strong>포인트 2% 적립</strong></div></>}</div><div className="ref-credit-face back">{i===1&&<><img src={asset('card-section/card-after.png')} alt=""/><div><small>B은행 카드</small><strong>포인트 3% 적립</strong></div></>}</div></motion.div>)}</motion.div></div>;}
function Insurance({active,running}){const icons=['heart','stethoscope','syringe','brain','hospital'];return <div className="ref-insurance-panel"><small>{active?'보험 분석 완료':'보험 분석 중...'}</small><strong>내 보험 리포트</strong><ul>{['수술비','실손 의료비','입원비','질병','응급'].map((label,i)=><li key={label} className={active&&i===2?'over':''}><img src={asset(`card-section/insurance-icon-${icons[i]}-${active?'color':'grey'}.png`)} alt=""/><b>{label}</b>{active?<motion.span initial={{opacity:0,x:32}} animate={{opacity:1,x:0}} transition={{delay:.3+.08*i}} className={`ref-insurance-status ${i===2?'over':'normal'}`}>{i===2?'과다':'적정'}</motion.span>:<span className="ref-spinner" style={{animationPlayState:running?'running':'paused'}}/>}</li>)}</ul></div>;}
function FinanceCard({index,active,onSelect}){
 const ref=useRef(null),visible=useInView(ref,{margin:'100px'}),reduced=useReducedMotion(),[scale,setScale]=useState(1);
 useEffect(()=>{const e=ref.current;const ro=new ResizeObserver(()=>setScale(e.clientWidth/500));ro.observe(e);return()=>ro.disconnect();},[]);
 return <motion.article className="ref-finance-card" initial={false} whileInView={reduced?undefined:{y:[120,0],opacity:[0,1]}} viewport={{once:true,amount:.15}} transition={{duration:.8,delay:index*.1,ease:[.22,1,.36,1]}} onPointerEnter={()=>onSelect(index)} onPointerLeave={()=>onSelect(null)} onFocus={()=>onSelect(index)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))onSelect(null);}}>
  <div className="ref-finance-art" ref={ref}><img className="ref-finance-bg" src={`https://framerusercontent.com/images/${backgrounds[index]}`} alt=""/><div className="ref-finance-scene" style={{transform:`translate(-50%,-50%) scale(${scale})`}}>{index===0?<Loan active={active} running={visible&&!reduced}/>:index===1?<Credit active={active} running={visible&&!reduced}/>:<Insurance active={active} running={visible&&!reduced}/>}</div><button className="ref-round-arrow" aria-label={`${financeCopy[index][1]} 미리보기`} aria-pressed={active} onClick={()=>onSelect(index)}><Arrow/></button></div>
  <a className="ref-finance-caption" href={`https://toss.im/service/${financeCopy[index][2]}`} target="_blank" rel="noreferrer"><h3>{financeCopy[index][0]}</h3><p>{financeCopy[index][1]}</p></a>
 </motion.article>;
}
function FinanceSection(){const[active,setActive]=useState(null);return <section id="reference-finance" className="ref-finance"><h2>수많은 <span className="ref-pills">{['대출','카드','보험'].map((s,i)=><motion.button key={s} onPointerEnter={()=>setActive(i)} onPointerLeave={()=>setActive(null)} onFocus={()=>setActive(i)} onClick={()=>setActive(active===i?null:i)} animate={{y:active===i?[-14,-22,-10][i]:0,rotate:active===i?[-8,3,8][i]:0}} transition={{type:'spring',stiffness:800,damping:55}}>{s}</motion.button>)}</span> 앞에서 망설임은 사라지고</h2><div className="ref-finance-grid">{financeCopy.map((_,i)=><FinanceCard key={i} index={i} active={active===i} onSelect={setActive}/>)}</div></section>;}
const clamp=v=>Math.max(0,Math.min(1,v));
function ShoppingSection(){
 const ref=useRef(null),phoneRef=useRef(null),copyRef=useRef(null),p=useProgress(ref),reduced=useReducedMotion(),[manual,setManual]=useState(0),[drag,setDrag]=useState(0),dragStart=useRef(null),[geometry,setGeometry]=useState({phone:-100,text:-220});
 useEffect(()=>{const measure=()=>{const phone=phoneRef.current,copy=copyRef.current;if(!phone||!copy)return;const second=copy.querySelector('.second');setGeometry({phone:(window.innerHeight-phone.offsetHeight)/2-phone.offsetTop,text:window.innerHeight/2-copy.offsetTop-second.offsetTop-second.offsetHeight/2});};measure();window.addEventListener('resize',measure);document.fonts.ready.then(measure);return()=>window.removeEventListener('resize',measure);},[]);
 const phase=clamp((p-.23)/.68)*2.9;
 useEffect(()=>setManual(0),[p]);
 const t=Math.max(phase,manual),checkout=clamp(t/.4),coupon=t>=.4,points=t>=.8,paid=t>=2.4;
 const shift=clamp(t),transition={duration:reduced?0:.45,ease};
 function move(e){if(dragStart.current===null)return;setDrag(clamp((e.clientX-dragStart.current)/180));}
 function release(){if(drag>=.65)setManual(2.9);setDrag(0);dragStart.current=null;}
 return <section id="reference-shopping" className="ref-shopping" ref={ref}><div className="ref-sticky ref-shopping-sticky">
  <motion.div ref={phoneRef} className="ref-shop-phone" animate={{y:shift*geometry.phone,scale:1-shift*.15}} transition={transition}>
   <motion.img className="ref-product-float one" src={asset('shopping/tomato-1.png')} alt="" animate={{y:t>0?-600:0,opacity:t>0?0:1}} transition={transition}/><motion.img className="ref-product-float two" src={asset('shopping/tomato-2.png')} alt="" animate={{y:t>0?-600:0,opacity:t>0?0:1}} transition={transition}/>
   <img className="ref-shop-frame" src={asset('shopping/phone-frame.png')} alt=""/>
   <div className="ref-shop-screen"><img className="ref-shop-product" src={asset('shopping-phone/phone-screen.png')} alt="토마토 파스타 소스 상품 화면"/>
    <motion.div className="ref-shop-checkout" animate={{opacity:checkout}} transition={transition} style={{pointerEvents:checkout>.5?'auto':'none'}} inert={checkout<.5||paid}>
     <div className="ref-shop-blur"/><div className="ref-sheet"><div className="ref-sheet-handle"/><div className="ref-price">7,460원</div><p className="ref-product-name">토마토 파스타 소스 340g</p><div className="ref-discounts"><div><span className="ref-coupon-icon">%</span><p><small>자동 쿠폰 할인</small><b>1,000원 할인</b></p><span style={{color:coupon?'var(--spot-ink)':'var(--spot-muted-light)'}}>✓</span></div><div><span className="ref-coupon-icon">P</span><p><small>토스포인트 사용</small><b>2,340원</b></p><button aria-label="토스포인트 사용 미리보기" aria-pressed={points} className={`ref-toggle ${points?'on':''}`} onClick={()=>setManual(points?.4:.8)}><i/></button></div></div>
      <button className="ref-swipe" aria-label="밀어서 결제하기 시연" onPointerDown={e=>{dragStart.current=e.clientX;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={move} onPointerUp={release} onPointerCancel={()=>{dragStart.current=null;setDrag(0);}} onKeyDown={e=>{if(e.key==='Escape'){dragStart.current=null;setDrag(0);}if(e.key==='Enter'||e.key===' '){e.preventDefault();setManual(2.9);}}} onClick={e=>{if(e.detail===0)setManual(2.9);}}><span>{t>=1.5?'•••':'밀어서 결제하기'}</span><motion.i animate={{left:`${5+Math.max(drag,clamp((t-1.2)/.3))*72}%`,opacity:t>=1.5?0:1}} transition={{duration:dragStart.current===null?.4:0}}>›</motion.i></button>
     </div>
    </motion.div>
    <motion.div className="ref-shop-complete" inert={!paid} animate={{opacity:paid?1:0}} transition={transition}><span className="ref-complete-check">✓</span><h3>주문이 완료됐어요</h3><p>배송이 시작되면 알려드릴게요</p><div><img src={asset('shopping/tomato.png')} alt="토마토 파스타 소스"/><strong>토마토 파스타 소스 340g</strong><small>무료배송</small></div></motion.div>
   </div>
  </motion.div>
  <motion.div ref={copyRef} className="ref-shop-copy" animate={{y:shift*geometry.text}} transition={transition}><motion.div className="ref-progress-line" animate={{y:shift*330,scaleY:1+shift*.5}} transition={transition}/><button className="ref-checkpoint" style={{opacity:1-shift*.5}} onClick={()=>goTo(ref,.12,reduced)}><h2>최저가는 알아서 찾아주고</h2><p>가장 저렴한 상품을 제일 먼저 보여줘서<br/>수많은 사이트를 오가며 가격 비교하지 않아도 돼요.</p></button><button className="ref-checkpoint second" style={{opacity:.3+shift*.7}} onClick={()=>goTo(ref,.55,reduced)}><h2>할인 쿠폰・적립도 알아서 척척</h2><p>쓸 수 있는 할인 쿠폰은 자동으로 적용되고,<br/>결제가 끝나면 현금처럼 쓸 수 있는 포인트가 쌓여요.</p></button><a className="ref-shop-cta" style={{opacity:clamp((t-.3)/.5)}} href="https://toss.im/service/shopping" target="_blank" rel="noreferrer">토스에서 쇼핑하기 <span>➜</span></a></motion.div>
 </div></section>;
}
export default function ReferenceStudy(){return <MotionConfig reducedMotion="user"><main className="reference-study"><nav className="ref-study-nav" aria-label="레퍼런스 비교 구간" onClick={e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();document.querySelector(a.hash)?.scrollIntoView({behavior:'instant'});history.replaceState(null,'',a.hash);}}><a href="#reference-assets" aria-label="01 자산 관리" title="01 자산 관리"/><a href="#reference-finance" aria-label="02 금융 카드" title="02 금융 카드"/><a href="#reference-shopping" aria-label="03 쇼핑 흐름" title="03 쇼핑 흐름"/></nav><AssetSection/><FinanceSection/><ShoppingSection/><footer className="ref-attribution">Toss 레퍼런스 재현 연구 · 로컬 비교 전용 · 원본 디자인·문구·이미지: <a href="https://toss.im/" target="_blank" rel="noreferrer">toss.im</a> · <a href="/concept/">SPOT ME 이전 초안</a></footer></main></MotionConfig>;}
