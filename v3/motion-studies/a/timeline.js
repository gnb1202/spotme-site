/* One finite paused timeline; all input-dependent states are deterministic and seekable. */
(async()=>{
  const {variant,remi,outline}=window.STUDY,ns='http://www.w3.org/2000/svg';
  const query=new URLSearchParams(location.search);
  const option=(name,fallback,min,max)=>{const n=Number(query.get(name));return query.has(name)&&Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;};
  const settings={drawStart:option('drawStart',variant==='a'?1.32:1.02,.8,1.6),drawDuration:option('drawDuration',.62,.3,.9),rushGap:option('rushGap',variant==='a'?.1:.14,0,.4),zoom:option('zoom',6.4,3,9),shake:option('shake',4.2,0,8),rings:Math.round(option('rings',10,4,14)),stroke:option('stroke',2.8,1,5),fade:option('fade',.43,.25,.85)};
  window.STUDY_SETTINGS=settings;
  settings.typePower=option('typePower',3,1,5);
  settings.revealPower=option('revealPower',1.1,.6,2);
  const make=(name,attrs={})=>{const node=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);return node;};
  const stage=document.getElementById('remi-mask');stage.id='mirror-stage';document.getElementById('poster-remi').remove();
  const camera=make('g',{id:'mirror-camera'});
  const strain=make('g',{id:'mirror-strain'});
  const svg=make('svg',{viewBox:'0 0 1920 1080',width:1920,height:1080,'aria-hidden':'true'});
  const unit=480/1080,left=remi.x-1.2222222222-12*unit,top=remi.y-12*unit,center={x:remi.x+remi.width/2,y:remi.y+remi.height/2};
  const base=make('image',{id:'silhouette',href:'assets/remi-black-mint-v1.png',x:left,y:top,width:outline.width*unit,height:outline.height*unit});
  base.style.filter='brightness(0)';strain.append(base);
  for(let depth=0;depth<settings.rings;depth++){
    const scale=Math.pow(.77,depth),ring=make('g',{id:`mirror-ring-${depth}`,class:'mirror-ring',transform:`translate(${center.x} ${center.y}) scale(${scale}) translate(${-center.x} ${-center.y})`});
    const shape=make('g',{transform:`translate(${left} ${top}) scale(${unit})`});
    const contours=depth?[outline.paths[0]]:outline.paths;
    for(const d of contours)shape.append(make('path',{d,pathLength:1,fill:'none',stroke:'#5eefd3','stroke-width':depth?settings.stroke*1.7/2.8:settings.stroke,'vector-effect':'non-scaling-stroke',class:depth?'echo-outline':'hero-outline'}));
    ring.append(shape);strain.append(ring);
  }
  const streaks=make('g',{id:'speed-streaks',stroke:'#5eefd3','stroke-width':1.2});
  for(let i=0;i<16;i++){const a=(i*22.5+7)*Math.PI/180,r=350+(i%3)*50;streaks.append(make('line',{x1:center.x+Math.cos(a)*r,y1:center.y+Math.sin(a)*r*.7,x2:center.x+Math.cos(a)*(r+120+(i%4)*30),y2:center.y+Math.sin(a)*(r+120+(i%4)*30)*.7}));}
  strain.append(streaks);camera.append(strain);svg.append(camera);stage.append(svg);
  await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));
  await new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src='assets/remi-black-mint-v1.png';});
  const cameraTransform=scale=>`translate(${center.x} ${center.y}) scale(${scale}) translate(${-center.x} ${-center.y})`;
  const strainTransform=({x,y,rotation})=>`translate(${x} ${y}) rotate(${rotation} ${center.x} ${center.y})`;
  camera.setAttribute('transform',cameraTransform(1));strain.setAttribute('transform',strainTransform({x:0,y:0,rotation:0}));
  const tl=gsap.timeline({paused:true,defaults:{ease:'none'}}),paths=[...document.querySelectorAll('#poster-title path')];
  paths.forEach(p=>{
    const start=.2+Number(p.dataset.row)*.18,duration=1.25-start;
    // Ease-in curve: hold visual tension early, then accelerate into the finished lettering.
    const drawEase=progress=>Math.pow(progress,settings.typePower);
    tl.fromTo(p,{strokeDashoffset:1},{strokeDashoffset:0,duration,ease:drawEase,autoRound:false,immediateRender:false},start);
  });
  const drawStart=settings.drawStart,drawEnd=drawStart+settings.drawDuration,rushStart=drawEnd+settings.rushGap,rushEnd=3.42;
  // The full-frame black plate supplies all black fill. Keep the duplicate black
  // silhouette transparent so its interior does not double-darken the home reveal.
  tl.fromTo('.hero-outline',{strokeDashoffset:1},{strokeDashoffset:0,duration:settings.drawDuration,ease:'power1.inOut',autoRound:false,immediateRender:false},drawStart);
  for(let depth=1;depth<settings.rings;depth++){
    const ring=`#mirror-ring-${depth}`,start=drawEnd-.18+depth*.035;
    tl.fromTo(ring,{opacity:0},{opacity:Math.max(.15,.64-depth*.043),duration:.18,immediateRender:false},start);
    tl.fromTo(`${ring} path`,{strokeDashoffset:1},{strokeDashoffset:0,duration:.32,autoRound:false,immediateRender:false},start);
  }
  tl.fromTo('#poster-title',{opacity:1},{opacity:0,duration:.4,immediateRender:false},rushStart-.08);
  tl.fromTo('#mirror-camera',{attr:{transform:cameraTransform(1)}},{attr:{transform:cameraTransform(settings.zoom)},duration:rushEnd-rushStart,ease:'power2.in',immediateRender:false},rushStart);
  // Reveal the stationary real home THROUGH black while the mint outlines keep moving.
  tl.fromTo('#black',{opacity:1},{opacity:0,duration:rushEnd-rushStart,ease:p=>Math.pow(p,settings.revealPower),immediateRender:false},rushStart);
  tl.fromTo('#speed-streaks',{opacity:0},{opacity:.22,duration:.25,immediateRender:false},rushStart+.15);
  // Short strain reversals with a fixed envelope. No random clock or permanent shake loop.
  const count=33,length=rushEnd-rushStart,step=length/count;let previous={x:0,y:0,rotation:0};
  for(let i=0;i<count;i++){
    const envelope=Math.sin(Math.PI*(i+1)/count),amplitude=settings.shake*envelope;
    const next={x:Math.sin(i*2.47)*amplitude,y:Math.cos(i*3.71)*amplitude*.65,rotation:Math.sin(i*1.73)*.18*envelope*settings.shake/4.2};
    tl.fromTo('#mirror-strain',{attr:{transform:strainTransform(previous)}},{attr:{transform:strainTransform(next)},duration:step,immediateRender:false},rushStart+i*step);previous=next;
  }
  tl.fromTo('#mirror-stage',{opacity:1},{opacity:0,duration:settings.fade,ease:'power1.inOut',immediateRender:false},3.65-settings.fade);
  tl.to({hold:0},{hold:1,duration:.85},3.65);
  // Initialize every tween before the first captured frame, including SVG transform parsing.
  tl.totalTime(4.5,true).totalTime(0,true).pause();window.__timelines=window.__timelines||{};window.__timelines['spotme-a']=tl;window.STUDY_READY=true;
})().catch(error=>{window.STUDY_ERROR=String(error);console.error(error);});
