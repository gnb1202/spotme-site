/* Finite, deterministic opening. Live input is deliberately outside this file. */
(()=>{
  const {remi,outline}=window.STUDY, ns='http://www.w3.org/2000/svg';
  const make=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs||{}))el.setAttribute(k,v);return el;};
  const stage=document.getElementById('remi-mask');stage.id='mirror-stage';document.getElementById('poster-remi').remove();
  const svg=make('svg',{viewBox:'0 0 1920 1080',width:1920,height:1080,'aria-hidden':'true'});
  const camera=make('g',{id:'mirror-camera'}),strain=make('g',{id:'mirror-strain'});
  const unit=480/1080,left=remi.x-1.2222222222-12*unit,top=remi.y-12*unit,cx=remi.x+remi.width/2,cy=remi.y+remi.height/2;
  const pose=(scale,x=0,y=0,rotation=0)=>`translate(${cx+x} ${cy+y}) rotate(${rotation}) scale(${scale}) translate(${-cx} ${-cy})`;
  // Exact source geometry at depth 0. The repetitions alone produce the tunnel.
  for(let depth=0;depth<12;depth++){
    const ring=make('g',{id:`mirror-ring-${depth}`,class:'mirror-ring',transform:pose(1/(1+depth*.42))});
    const shape=make('g',{transform:`translate(${left} ${top}) scale(${unit})`});
    for(const d of depth?[outline.paths[0]]:outline.paths)shape.append(make('path',{d,pathLength:1,fill:'none',stroke:'#5eefd3','stroke-width':depth?1.8:2.8,'vector-effect':'non-scaling-stroke',class:depth?'echo-outline':'hero-outline'}));
    ring.append(shape);strain.append(ring);
  }
  camera.setAttribute('transform',pose(1));strain.setAttribute('transform',pose(1));camera.append(strain);svg.append(camera);stage.append(svg);
  const tl=gsap.timeline({paused:true,defaults:{ease:'none',immediateRender:false}});
  for(const [name,time] of Object.entries({black:0,type:.18,remi:1.3,tension:2.05,rush:2.25,resolve:4.15,home:4.4,end:5}))tl.addLabel(name,time);
  // Hide whole title before the first ink, preventing tiny closed-path seams at t=0.
  tl.fromTo('#poster-title',{opacity:0},{opacity:1,duration:.06,immediateRender:false},.18);
  document.querySelectorAll('#poster-title path').forEach(p=>{
    const start=.18+Number(p.dataset.row)*.12;
    tl.fromTo(p,{strokeDashoffset:1},{strokeDashoffset:0,duration:1.3-start,ease:p=>p**4,autoRound:false},start);
  });
  tl.fromTo('#mirror-stage',{opacity:0},{opacity:1,duration:.04,immediateRender:false},1.3);
  tl.fromTo('.hero-outline',{strokeDashoffset:1},{strokeDashoffset:0,duration:.75,ease:'power2.inOut',autoRound:false},1.3);
  for(let depth=1;depth<12;depth++){
    const start=1.95+depth*.032;
    tl.fromTo(`#mirror-ring-${depth}`,{opacity:0},{opacity:Math.max(.12,.62-depth*.039),duration:.18},start);
    tl.fromTo(`#mirror-ring-${depth} path`,{strokeDashoffset:1},{strokeDashoffset:0,duration:.28,ease:'power1.in',autoRound:false},start);
  }
  tl.fromTo('#poster-title',{opacity:1},{opacity:0,duration:.48,ease:'power1.inOut',immediateRender:false},2.25);
  // Accelerated inward passage, never transform the real home beneath it.
  tl.fromTo(camera,{attr:{transform:pose(1)}},{attr:{transform:pose(8.2)},duration:1.9,ease:'power3.in'},2.25);
  tl.fromTo('#black',{opacity:1},{opacity:0,duration:1.9,ease:p=>p**1.15},2.25);
  const count=44,length=2.1,step=length/count;let previous=pose(1);
  for(let i=0;i<count;i++){
    const p=(i+1)/count,amplitude=3.6*Math.sin(Math.PI*p),release=p>.82?(1-p)/.18:1;
    const next=pose(1,Math.sin(i*2.47)*amplitude*release,Math.cos(i*3.71)*amplitude*.65*release,Math.sin(i*1.73)*.13*Math.sin(Math.PI*p));
    tl.fromTo(strain,{attr:{transform:previous}},{attr:{transform:next},duration:step},2.05+i*step);previous=next;
  }
  tl.fromTo('#mirror-stage',{opacity:1},{opacity:0,duration:.55,ease:'power2.out',immediateRender:false},3.85);
  // Real visible final state is explicitly held through 5.00s, not a dummy tween.
  tl.fromTo('#home',{opacity:1},{opacity:1,duration:.6},4.4);
  tl.totalTime(5,true).totalTime(0,true).pause();
  window.__timelines=window.__timelines||{};window.__timelines['spotme-brag']=tl;window.STUDY_READY=true;
})();
