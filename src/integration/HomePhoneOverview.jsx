'use client';
import {useState} from 'react';
import Link from 'next/link';
import {overviewAsset,overviewFeatures} from './home-overview-data';
import {routePalette} from './palette';
import './home-phone-overview.css';

function Arrow(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>;}

export default function HomePhoneOverview(){
  const [selected,setSelected]=useState(0);
  const active=overviewFeatures[selected];
  return <section id="home-overview" className="home-phone-overview" style={{'--overview-mint':routePalette['/'].background}} aria-labelledby="home-overview-title">
    <div className="hpo-wrap">
      <div className="hpo-layout">
        <div className="hpo-intro">
          <p className="hpo-eyebrow">나의 AI 운동 파트너</p>
          <h2 id="home-overview-title">내 운동의<br/>{' '}모든 순간,<br/><em>이 화면 안에.</em></h2>
        </div>
        <div className="hpo-phone-column" id="hpo-screen" role="group" aria-label={`${active.name} 앱 화면`}>
          <div className="hpo-device">
            <span className="hpo-side-button hpo-side-button-left" aria-hidden="true"/>
            <span className="hpo-side-button hpo-side-button-right" aria-hidden="true"/>
            <div className="hpo-display">
              {overviewFeatures.map(item=><img key={item.id} data-screen={item.id} src={overviewAsset(item.id)} alt={`SPOT ME ${item.name} 화면`} width={item.id==='gym'?1660:1572} height={item.id==='gym'?3452:3408} hidden={item.id!==active.id} draggable={false}/>)}
              <span className="hpo-island" aria-hidden="true"/>
            </div>
          </div>
        </div>
        <div className="hpo-explore">
          <div className="hpo-features" role="group" aria-label="앱 화면 둘러보기">
            {overviewFeatures.map((item,index)=><button key={item.id} onClick={()=>setSelected(index)} aria-pressed={index===selected} aria-controls="hpo-screen hpo-summary">
              <span className="hpo-feature-number">0{index+1}</span><span>{item.name}</span><Arrow/>
            </button>)}
          </div>
          <div className="hpo-summary" id="hpo-summary" aria-live="polite" aria-atomic="true">
            <p>{active.description}</p>
            <Link href={active.href}>{active.link}<Arrow/></Link>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
