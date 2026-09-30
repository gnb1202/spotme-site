'use client';
import {useEffect,useRef,useState} from 'react';
import './overview-cheese-rain.css';
import {createRainBenchmark} from './rain-benchmark';

const SOURCE='/assets/delivery-260925/ebbe81070fd9b030aaf877b385f7b4f9199e70d96c23fa74aa30d1a4a56117b1.png';
// Isolated pieces of the delivered 배경_게이미피케이션_02 artwork, in original pixels.
const SPRITES=[[354,74,91,100],[222,184,82,85],[347,206,55,52],[42,237,84,73],[385,291,132,135],[130,359,82,76],[524,400,61,60],[258,442,79,65],[394,471,69,70],[39,493,100,95],[311,543,79,90],[404,633,90,88]];
const noise=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};

export default function OverviewCheeseRain({section,reduced}){
 const canvas=useRef(null),benchControl=useRef(null),[enabled,setEnabled]=useState(false),[bench,setBench]=useState(false);
 useEffect(()=>{const q=new URLSearchParams(location.search);setEnabled(true);setBench(process.env.NODE_ENV==='development'&&q.get('rainBench')==='1');},[]);
 useEffect(()=>{
  if(!enabled||reduced)return;
  const el=canvas.current,root=section.current,sticky=el.parentElement,ctx=el.getContext('2d');
  if(!ctx||!root)return;
  const image=new Image();let loaded=false,disposed=false,w=0,h=0,dpr=1,startY=0,endY=0;
  // Old renderer remains available only for controlled, opt-in before/after QA.
  const cached=bench&&new URLSearchParams(location.search).get('rainRenderer')==='cached';
  const bitmaps=new Map();
  let particles=[],raf=0,lastTime=null,lastScroll=window.scrollY,credit=0,serial=0;
  const clear=()=>{cancelAnimationFrame(raf);raf=0;lastTime=null;particles=[];credit=0;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,el.width,el.height);el.dataset.running='false';el.dataset.phase='idle';el.dataset.particles='0';};
  const benchmark=bench?createRainBenchmark({root,el,reset:()=>{clear();serial=0;lastScroll=window.scrollY;}}):null;
  benchControl.current=benchmark;
  // Rasterize each chosen artwork/size once, not from the large PNG every frame.
  const bitmap=(index,size)=>{
   const key=`${index}:${size}`;
   if(bitmaps.has(key))return bitmaps.get(key);
   const [sx,sy,sw,sh]=SPRITES[index],height=size*sh/sw;
   const tile=document.createElement('canvas');tile.width=Math.ceil(size*dpr);tile.height=Math.ceil(height*dpr);
   tile.getContext('2d').drawImage(image,sx,sy,sw,sh,0,0,tile.width,tile.height);
   const result={tile,height};bitmaps.set(key,result);return result;
  };
  const measure=()=>{
   clear();lastScroll=window.scrollY;
   const box=sticky.getBoundingClientRect();w=box.width;h=box.height;
   dpr=Math.min(window.devicePixelRatio||1,cached?1.5:2);el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);bitmaps.clear();
   el.dataset.renderer=cached?'cached':'direct';el.dataset.dpr=String(dpr);
   const bounds=root.getBoundingClientRect();startY=bounds.top+window.scrollY-2;endY=bounds.bottom+window.scrollY-h;
  };
  const draw=now=>{
   if(disposed)return;
   const measuredStart=benchmark?performance.now():0;let draws=0,clearArea=0;
   const dt=lastTime===null?0:Math.min((now-lastTime)/1000,.04);lastTime=now;
   // Clear only last frame's sprite rectangles, before drawing any new ones.
   ctx.setTransform(dpr,0,0,dpr,0,0);
   for(const p of particles){if(p.painted){ctx.clearRect(p.x-p.radius,p.y-p.radius,p.radius*2,p.radius*2);if(benchmark)clearArea+=p.radius*p.radius*4;}}
   let kept=0,falling=false;
   for(const p of particles){
    p.age+=dt;p.vy+=46*dt;p.y+=p.vy*dt;p.x+=p.vx*dt;p.angle+=p.spin*dt;
    if(p.y>=h+p.radius||p.age>=6)continue;
    particles[kept++]=p;falling ||= p.age>1.2;
    p.painted=p.y+p.radius>0&&p.x+p.radius>0&&p.x-p.radius<w;
    if(!p.painted)continue;
    const cos=Math.cos(p.angle)*dpr,sin=Math.sin(p.angle)*dpr;
    ctx.setTransform(cos,sin,-sin,cos,p.x*dpr,p.y*dpr);
    ctx.globalAlpha=.68*Math.min(1,p.age/.2,Math.max(0,(h+20-p.y)/90));
    if(cached)ctx.drawImage(p.tile,-p.size/2,-p.height/2,p.size,p.height);
    else ctx.drawImage(image,...p.source,-p.size/2,-p.height/2,p.size,p.height);
    draws++;
   }
   if(kept!==particles.length)el.dataset.particles=String(kept);
   particles.length=kept;
   if(falling&&el.dataset.phase!=='falling')el.dataset.phase='falling';
   if(kept){raf=requestAnimationFrame(draw);}else{raf=0;lastTime=null;el.dataset.running='false';el.dataset.phase='idle';}
   benchmark?.record(now,performance.now()-measuredStart,draws,clearArea);
  };
  const onScroll=()=>{
   const y=window.scrollY,delta=y-lastScroll;lastScroll=y;
   const pinned=y>=startY&&y<=endY;
   if(!pinned||document.hidden){clear();return;}
   if(delta<=0||!loaded){credit=0;return;}
   // Large anchor jumps cannot create an overwhelming one-frame shower.
   credit+=Math.min(delta,120);
   // 35 → 20px per piece: 75% more rain, with only a runaway safety cap.
   const count=Math.min(8,Math.floor(credit/20),64-particles.length);
   credit%=20;
   for(let i=0;i<count;i++){
    const n=++serial;
    // Preserve the approved random sizes and trajectories in both renderers.
    const size=28+Math.floor(noise(n+41)*8)*4,source=SPRITES[n%SPRITES.length];
    const {tile,height}=cached?bitmap(n%SPRITES.length,size):{tile:null,height:size*source[3]/source[2]};
    // Spread births across the entire backdrop, not a fixed pair of side lanes.
    particles.push({source,tile,height,size,radius:Math.hypot(size,height)/2+3,painted:false,x:16+Math.max(0,w-32)*noise(n),y:-35-noise(n+21)*45,
     vy:58+noise(n+61)*45,
     vx:(noise(n+81)-.5)*12,angle:noise(n+101)*6.28,spin:(noise(n+121)-.5)*1.8,age:0});
   }
   if(count)el.dataset.particles=String(particles.length);
   if(particles.length&&!raf){el.dataset.running='true';el.dataset.phase='entering';raf=requestAnimationFrame(draw);}
  };
  image.onload=()=>{if(!disposed){loaded=true;el.dataset.ready='true';}};image.src=SOURCE;
  measure();const observer=new ResizeObserver(measure);observer.observe(sticky);observer.observe(root);
  const hide=()=>{if(document.hidden)clear();lastScroll=window.scrollY;};
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',measure);
  document.addEventListener('visibilitychange',hide);
  return()=>{disposed=true;benchmark?.cancel();benchControl.current=null;clear();bitmaps.clear();image.onload=null;observer.disconnect();window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure);document.removeEventListener('visibilitychange',hide);};
 },[enabled,reduced,section,bench]);
 return enabled&&!reduced?<><canvas ref={canvas} className="ov-cheese-rain" aria-hidden="true"/>{bench&&<button style={{position:'fixed',right:12,top:12,zIndex:1000,padding:8}} onClick={e=>{e.currentTarget.disabled=true;benchControl.current?.run();}}>치즈 성능 측정</button>}</>:null;
}
