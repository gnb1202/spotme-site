'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import HomePhoneOverview from './HomePhoneOverview';
import {exerciseMotives,remiSupportModes} from './home-story-data';
import {routePalette} from './palette';
import useHomeStops from './useHomeStops';
import './home-story.css';

function MotivationSurvey(){
  return <figure className="hs-survey" aria-labelledby="hs-survey-title">
    <div className="hs-survey-heading"><div><p className="hs-kicker">헬스장 이용자 대상 설문</p><h3 id="hs-survey-title">어떤 이유로 운동하나요?</h3></div><span className="hs-unit">응답 비율 (%)</span></div>
    <div className="hs-bars" id="hs-motive-bars">
      {exerciseMotives.slice(0,4).map((item,index)=><div key={item.label} className={`hs-bar-row${index===1?' is-featured':''}`}>
        <div className="hs-bar-label"><span title={item.sourceLabel}>{item.label}</span><strong>{item.value}<small>%</small></strong></div>
        <div className="hs-bar-space" aria-hidden="true"><span style={{width:`${item.value}%`}}/></div>
      </div>)}
    </div>
  </figure>;
}

// Illustrative stages from the panel PDF, not longitudinal measurements.
function PlateauGraph(){
  return <figure className="hs-graph" aria-labelledby="hs-graph-caption">
    <div className="hs-graph-heading"><h3>성장이 멈춘 듯한 구간, 정체기.</h3><span>성장 흐름</span></div>
    <svg viewBox="0 0 1000 360" preserveAspectRatio="none" role="img" aria-labelledby="hs-graph-title hs-graph-desc">
      <title id="hs-graph-title">입문부터 정체기, 이후 성장으로 이어지는 운동의 흐름</title>
      <desc id="hs-graph-desc">초기 상승 이후 정체기에서 오르내리고 다시 성장하는 개념도입니다. 실제 측정값이나 SPOT ME의 효과를 나타내는 그래프가 아닙니다.</desc>
      <rect className="hs-plateau-band" x="395" y="30" width="270" height="270" rx="12"/>
      <g className="hs-graph-grid"><path d="M20 80H980M20 150H980M20 220H980M20 290H980"/></g>
      <path className="hs-graph-ghost" d="M30 278L125 261L250 188L395 144L440 179L530 160L600 194L665 173L790 111L960 66"/>
      <g className="hs-graph-draw">
        <path className="hs-growth-area" d="M30 278L125 261L250 188L395 144L440 179L530 160L600 194L665 173L790 111L960 66V300H30Z"/>
        <path className="hs-growth-line" d="M30 278L125 261L250 188L395 144L440 179L530 160L600 194L665 173L790 111L960 66"/>
        <circle className="hs-graph-dot" cx="395" cy="144" r="11"/><circle className="hs-graph-dot" cx="665" cy="173" r="11"/>
      </g>
    </svg>
    <div className="hs-graph-stages" aria-hidden="true"><span>입문기</span><span>1차 성장기</span><strong>정체기</strong><span>2차 성장기</span><span>유지기</span></div>
    <p className="hs-graph-explanation">반복되는 운동 자극에 적응하면서, 처음처럼 빠른 성장을 느끼기 어려워지는 시기예요.</p>
    <figcaption id="hs-graph-caption">프로젝트 패널의 성장 흐름을 재구성한 개념도</figcaption>
  </figure>;
}

function RemiIntroduction(){
  const [selected,setSelected]=useState(0);
  const active=remiSupportModes[selected];
  return <section className="hs-solution" aria-labelledby="home-solution-title">
    <div className="hs-wrap hs-solution-layout">
      <div className="hs-solution-copy">
        <p className="hs-kicker">나의 AI 운동 파트너</p>
        <h2 id="home-solution-title">다시 나아갈 수 있도록,<br/><em>레미가 함께.</em></h2>
        <p className="hs-project-copy">SPOT ME는 운동 정체기를 겪는 사람을 위한<br className="hs-desktop-break"/> AI 운동 파트너입니다.</p>
        <div className="hs-support-menu" role="group" aria-label="레미의 운동 지원 방식">
          {remiSupportModes.map((item,index)=><button key={item.id} type="button" onClick={()=>setSelected(index)} aria-pressed={selected===index} aria-controls="hs-support-preview"><span>{item.name}</span><span aria-hidden="true">↗</span></button>)}
        </div>
        <div className="hs-support-description" aria-live="polite" aria-atomic="true"><h3>{active.title}</h3><p>{active.description}</p><Link href={active.href}>{active.link} <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="hs-support-preview" id="hs-support-preview" role="group" aria-label={active.name}>
        <div className="hs-remi-art">{remiSupportModes.map(item=><img key={item.id} src={`/home-story/${item.image}.webp`} width={item.width} height={item.height} alt={item.alt} hidden={item.id!==active.id} decoding="async"/>)}</div>
        <ol className="hs-support-flow" aria-label={active.name}>{active.steps.map(step=><li key={step}>{step}</li>)}</ol>
      </div>
    </div>
  </section>;
}

export default function HomeStory(){
  const ref=useRef(null);
  useHomeStops(ref);
  return <div ref={ref} id="next-content" className="home-story" style={{'--hs-mint':routePalette['/'].background,'--hs-light-mint':routePalette['/features/'].background}} tabIndex={-1} aria-labelledby="home-pain-title">
    <section className="hs-pain" aria-labelledby="home-pain-title">
      <div className="hs-wrap">
        <div className="hs-research-layout">
          <div className="hs-research-intro">
            <p className="hs-kicker">우리가 운동을 계속하는 이유</p>
            <h2 id="home-pain-title">달라질 내 모습을<br/><em>기대하니까.</em></h2>
            <p className="hs-pain-copy">건강을 위해, 달라지는 몸을 보기 위해.<br/>운동을 이어가는 이유에는 <strong>변화에 대한 기대</strong>가 있어요.</p>
            <figure className="hs-survey-highlight" aria-label="설문 응답자의 57.5%가 달라지는 몸에 대한 만족감을 선택">
              <div className="hs-ring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle className="hs-ring-track" cx="60" cy="60" r="51"/><circle className="hs-ring-value" cx="60" cy="60" r="51" pathLength="100" strokeDasharray="57.5 100"/></svg><strong>57.5<small>%</small></strong></div>
              <figcaption>설문 응답자의 절반 이상이 선택한<br/><strong>달라지는 몸의 만족감</strong></figcaption>
            </figure>
            <p className="hs-stat-meaning">몸과 기록의 변화는 목표에 가까워지고 있다는 신호.<br/>그 변화가 멈추면, 운동을 이어갈 동기도 흔들릴 수 있어요.</p>
          </div>
          <MotivationSurvey/>
        </div>
        <div className="hs-plateau-layout">
          <PlateauGraph/>
          <div className="hs-plateau-copy">
            <p className="hs-kicker">정체기가 힘든 이유</p>
            <h2>멈춘 건 기록인데,<br/><em>의욕까지 흔들려요.</em></h2>
            <div className="hs-pain-details">
              <div><h3>노력은 쌓이는데, 변화는 제자리.</h3><p>처음에는 보이던 변화가 더뎌지고, 같은 무게와 횟수에 머무는 시간이 길어져요. 꾸준히 해도 나아가고 있다는 느낌을 받기 어려워요.</p></div>
              <div><h3>목표는 있지만, 다음 방향은 막막해요.</h3><p>원하는 몸과 기록에 가까워지고 싶은데, 지금 운동을 계속해도 될지 무엇을 바꿔야 할지 혼자 판단하기 어려워요.</p></div>
              <div><h3>성취감이 줄면, 의욕도 함께.</h3><p>노력한 만큼 변화를 느끼지 못하면, 운동을 계속할 이유까지 흐려질 수 있어요.</p></div>
            </div>
            <p className="hs-bridge">그래서 필요한 건,<br/><strong>다음 운동의 방향과 다시 해볼 동기.</strong></p>
          </div>
        </div>
      </div>
    </section>
    <RemiIntroduction/>
    <HomePhoneOverview/>
  </div>;
}
