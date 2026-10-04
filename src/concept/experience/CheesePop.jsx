'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import './cheese-pop.css';

// Exact transparent components from delivered 배경_게이미피케이션_02.png.
// Canvas source rectangles isolate the real artwork; no generated replacement sprites.
const SOURCE='/assets/delivery-260925/ebbe81070fd9b030aaf877b385f7b4f9199e70d96c23fa74aa30d1a4a56117b1.png';
const SPRITES=[
 [354,74,91,100],[222,184,82,85],[347,206,55,52],[42,237,84,73],
 [385,291,132,135],[130,359,82,76],[524,400,61,60],[258,442,79,65],
 [394,471,69,70],[39,493,100,95],[311,543,79,90],[404,633,90,88],
];
const DURATION=2.45;
const noise=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};

export default function CheesePop({active,visible,reduced}){
 const canvas=useRef(null),anchor=useRef(null),sprite=useRef(null),fired=useRef(false);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  const image=new Image();let alive=true;
  image.onload=()=>{if(alive){sprite.current=image;setReady(true);}};
  image.src=SOURCE;
  return()=>{alive=false;image.onload=null;};
 },[]);
 useEffect(()=>{
  if(!active){fired.current=false;return;}
  if(reduced||!visible||!ready||fired.current)return;
  const el=canvas.current,ctx=el?.getContext('2d');
  if(!ctx)return;
  fired.current=true;
  const {width:w,height:h}=el.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);ctx.scale(dpr,dpr);
  // Portal escapes the phone/section clipping and transformed ancestors.
  // Launch still originates at Remi, not at the centre of the viewport.
  const visual=anchor.current?.parentElement;
  const target=visual?.querySelector('.rj-hero')||visual;
  const bounds=target?.getBoundingClientRect();
  if(!bounds)return;
  const spread=Math.min(w/650,1.15),origin={x:bounds.left+bounds.width*.5,y:bounds.top+bounds.height*.5};
  const particles=Array.from({length:34},(_,i)=>({
   source:SPRITES[i%SPRITES.length],delay:noise(i+1)*.18,
   vx:(noise(i+7)-.5)*660*spread,vy:-(330+noise(i+23)*300),
   size:(23+noise(i+49)*30)*Math.min(1,w/500),
   angle:noise(i+79)*Math.PI*2,spin:(noise(i+101)-.5)*12,
   x:(noise(i+131)-.5)*38,y:noise(i+151)*24,
  }));
  // A rotation-independent radius safely contains each tumbling piece.
  for(const p of particles){p.height=p.size*p.source[3]/p.source[2];p.radius=Math.hypot(p.size,p.height)/2+2;}
  let raf=0,start=null,stopped=false,dirty=null;
  el.dataset.playing='true';
  el.dataset.phase='launch';
  const clear=()=>{if(dirty){ctx.clearRect(dirty.left,dirty.top,dirty.right-dirty.left,dirty.bottom-dirty.top);dirty=null;}};
  const stop=()=>{stopped=true;cancelAnimationFrame(raf);clear();el.dataset.playing='false';el.dataset.phase='idle';};
  const draw=now=>{
   if(stopped)return;
   if(start===null)start=now;
   const elapsed=(now-start)/1000;
   if(elapsed>.85&&el.dataset.phase==='launch')el.dataset.phase='flight';
   clear();
   if(elapsed>DURATION){stop();return;}
   for(const p of particles){
    const t=elapsed-p.delay;if(t<0)continue;
    const [sx,sy,sw,sh]=p.source;
    const x=origin.x+p.x+p.vx*t,y=origin.y+p.y+p.vy*t+490*t*t;
    const r=p.radius;
    if(x+r<0||x-r>w||y+r<0||y-r>h)continue;
    const left=Math.max(0,Math.floor(x-r)),top=Math.max(0,Math.floor(y-r));
    const right=Math.min(w,Math.ceil(x+r)),bottom=Math.min(h,Math.ceil(y+r));
    if(dirty){dirty.left=Math.min(dirty.left,left);dirty.top=Math.min(dirty.top,top);dirty.right=Math.max(dirty.right,right);dirty.bottom=Math.max(dirty.bottom,bottom);}
    else dirty={left,top,right,bottom};
    const pop=Math.min(1,t/.09),alpha=Math.min(1,(DURATION-elapsed)/.48);
    ctx.save();ctx.translate(x,y);ctx.rotate(p.angle+p.spin*t);
    // A slight individual tumble, not rotation of the entire sprite sheet.
    ctx.scale(pop*(.72+.28*Math.cos(t*7+p.angle)),pop);
    ctx.globalAlpha=Math.max(0,alpha);
    ctx.drawImage(sprite.current,sx,sy,sw,sh,-p.size/2,-p.height/2,p.size,p.height);
    ctx.restore();
   }
   raf=requestAnimationFrame(draw);
  };
  raf=requestAnimationFrame(draw);
  const hide=()=>{if(document.hidden)stop();};
  window.addEventListener('resize',stop);document.addEventListener('visibilitychange',hide);
  return()=>{stop();window.removeEventListener('resize',stop);document.removeEventListener('visibilitychange',hide);};
 },[active,visible,reduced,ready]);
 return <><span ref={anchor} hidden aria-hidden="true"/>{ready&&createPortal(<canvas ref={canvas} className="rj-cheese-pop" aria-hidden="true" data-active={active&&!reduced} data-particle-count="34"/>,document.body)}</>;
}
