import {gsap} from 'gsap';
import {mirrorFlight,projectMirror} from './mirror-depth';
import outline from './remi-home-a-01b-outline.json';

export async function startDepthOpening(scope,study,signal){
  await document.fonts.ready;
  await Promise.all([...scope.querySelectorAll('img')].map(image=>image.decode()));
  if(signal.aborted)return null;
  const byId=id=>scope.querySelector(`[id="${id}"]`);
  const mask=byId('remi-mask'),originalRemi=byId('poster-remi');
  let timeline,svg;
  const context=gsap.context(()=>{
    const ns='http://www.w3.org/2000/svg';
    const make=(name,attrs)=>{
      const node=document.createElementNS(ns,name);
      for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
      return node;
    };
    const {remi}=study;
    const unit=remi.height/outline.height;
    const left=remi.x+(remi.width-outline.width*unit)/2,top=remi.y;
    const center={x:remi.x+remi.width/2,y:remi.y+remi.height/2};
    mask.id='mirror-stage';originalRemi.remove();
    svg=make('svg',{viewBox:'0 0 1920 1080',width:1920,height:1080,'aria-hidden':'true','data-mirror-version':'depth'});
    const strain=make('g',{id:'mirror-strain'});
    svg.append(strain);mask.append(svg);
    const planes=[];
    for(let index=0;index<mirrorFlight.count;index++){
      const ring=make('g',{id:`mirror-ring-${index}`,class:'mirror-ring'});
      const projection=make('g',{});
      const shape=make('g',{transform:`translate(${left} ${top}) scale(${unit})`});
      for(const d of index===0?outline.paths:[outline.paths[0]]){
        shape.append(make('path',{d,pathLength:1,fill:'none',stroke:'#5eefd3','stroke-width':index===0?2.8:1.8,'vector-effect':'non-scaling-stroke',class:index===0?'hero-outline':'echo-outline'}));
      }
      projection.append(shape);ring.append(projection);strain.append(ring);
      planes.push(projection);
    }
    const flight={progress:0};
    function renderFlight(){
      const p=flight.progress;
      planes.forEach((plane,index)=>{
        const {scale,opacity}=projectMirror(index,p);
        plane.setAttribute('transform',`translate(${center.x} ${center.y}) scale(${scale}) translate(${-center.x} ${-center.y})`);
        plane.setAttribute('opacity',index===0&&p===0?1:opacity);
      });
      // Screen-space strain stays small; unlike the old zoom group it is never magnified.
      const envelope=Math.sin(Math.PI*p),x=Math.sin(p*83)*1.2*envelope,y=Math.sin(p*107)*.7*envelope;
      strain.setAttribute('transform',`translate(${x} ${y})`);
      svg.setAttribute('data-flight-phase',p===0?'draw':p<.35?'enter':p<.8?'travel':'exit');
    }
    renderFlight();
    const tl=gsap.timeline({paused:true,defaults:{ease:'none'}});
    // Seeking/skipping suppresses update callbacks; explicitly restore projections on replay.
    tl.eventCallback('onStart',()=>{flight.progress=0;renderFlight();});
    for(const path of scope.querySelectorAll('#poster-title path')){
      const start=.2+Number(path.dataset.row)*.18;
      tl.fromTo(path,{strokeDashoffset:1},{strokeDashoffset:0,duration:1.25-start,ease:p=>p*p*p,autoRound:false,immediateRender:false},start);
    }
    // Overlap the final lettering stroke with a soft silhouette reveal, then hand
    // the same drawing motion inward. No fully drawn copies appear in one frame.
    const drawStart=study.variant==='b'?.98:1.1,drawEnd=drawStart+.85,rushStart=drawEnd+.3;
    tl.fromTo(byId('mirror-ring-0'),{opacity:0},{opacity:1,duration:.5,ease:'power1.inOut',immediateRender:false},drawStart-.12);
    tl.fromTo(scope.querySelectorAll('.hero-outline'),{strokeDashoffset:1},{strokeDashoffset:0,duration:.85,ease:'power1.inOut',autoRound:false,immediateRender:false},drawStart);
    for(let i=1;i<mirrorFlight.count;i++){
      const ring=byId(`mirror-ring-${i}`);
      const echoStart=drawEnd-.28+i*.025;
      tl.fromTo(ring.querySelectorAll('path'),{strokeDashoffset:1},{strokeDashoffset:0,duration:.36,ease:'power1.inOut',autoRound:false,immediateRender:false},echoStart);
      tl.fromTo(ring,{opacity:0},{opacity:1,duration:.38,ease:'power1.inOut',immediateRender:false},echoStart);
    }
    // Crossfade the completed title into the emerging silhouette before the rush.
    tl.fromTo(byId('poster-title'),{opacity:1},{opacity:0,duration:.48,ease:'power1.inOut',immediateRender:false},drawEnd-.26);
    tl.fromTo(flight,{progress:0},{progress:1,duration:mirrorFlight.duration,onUpdate:renderFlight,immediateRender:false},rushStart);
    // A continuous late dissolve reveals the unchanged home behind the black plate.
    tl.fromTo(byId('black'),{opacity:1},{opacity:0,duration:1.06,ease:'power2.inOut',immediateRender:false},rushStart+.76);
    tl.fromTo(mask,{opacity:1},{opacity:0,duration:.62,ease:'power1.inOut',immediateRender:false},rushStart+1.2);
    tl.to({hold:0},{hold:1,duration:.24},rushStart+1.82);
    tl.totalTime(tl.duration(),true).totalTime(0,true).pause();
    renderFlight();timeline=tl;
  },scope);
  return {timeline,dispose(){context.revert();svg?.remove();mask.id='remi-mask';mask.append(originalRemi);}};
}
