// Home geometry is the contract: opacity-only entrance and dissolve.
(()=>{
 const mode=new URLSearchParams(location.search).get('opening'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 for(const a of document.querySelectorAll('.opening-picker a'))if(new URL(a.href).searchParams.get('opening')===mode)a.setAttribute('aria-current','true');
 if(location.pathname!=='/'||mode!=='type'||motion.matches)return;
 const title=document.querySelector('[data-source-node-id="205:3"]'),remi=document.querySelector('[data-source-node-id="254:244"]'),main=document.querySelector('main');
 if(!title||!remi||!window.SPOTME_GLYPHS)return;
 const animations=[],{upm,glyphs}=window.SPOTME_GLYPHS,root=document.documentElement,overflow=root.style.overflow,gutter=root.style.scrollbarGutter;
 let finished=false,timer;
 const overlay=document.createElement('div');overlay.className='opening';
 const skip=document.createElement('button');skip.className='opening-skip';skip.textContent='건너뛰기';overlay.append(skip);document.body.append(overlay);
 main.inert=true;document.body.dataset.openingState='running';root.style.overflow='hidden';scrollTo(0,0);
 function cleanup(){if(finished)return;finished=true;clearTimeout(timer);animations.forEach(a=>a.cancel());overlay.remove();main.inert=false;root.style.overflow=overflow;root.style.scrollbarGutter=gutter;document.body.dataset.openingState='done';document.removeEventListener('keydown',key);window.removeEventListener('resize',cleanup);motion.removeEventListener('change',cleanup);}
 function key(e){if(e.key==='Escape'){e.preventDefault();cleanup();}}
 skip.addEventListener('click',cleanup);document.addEventListener('keydown',key);window.addEventListener('resize',cleanup);motion.addEventListener('change',cleanup);timer=setTimeout(cleanup,9000);
 function animate(el,frames,options){const a=el.animate(frames,{fill:'both',...options});animations.push(a);return a;}
 Promise.all([document.fonts.ready,new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src='/opening-remi.svg';})]).then(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))).then(()=>{
  if(finished)return;
  const ns='http://www.w3.org/2000/svg',box=title.getBoundingClientRect(),style=getComputedStyle(title),scale=box.width/parseFloat(style.width),unit=parseFloat(style.fontSize)/upm;
  const svg=document.createElementNS(ns,'svg');svg.classList.add('opening-type');svg.setAttribute('aria-hidden','true');svg.setAttribute('viewBox',`0 0 ${parseFloat(style.width)} ${parseFloat(style.height)}`);
  Object.assign(svg.style,{left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px'});
  // Per-character browser rectangles preserve the actual title's shaping.
  const ink=title.querySelector('.ink'),walker=document.createTreeWalker(ink,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  const ascent=Math.max(...[...title.textContent.split('\n')[0]].map(c=>(glyphs[c]?.bounds?.[3]??0)*unit)),baseline=Number(title.dataset.inkTop)+ascent,leading=parseFloat(getComputedStyle(ink).lineHeight);let row=0,index=0;
  for(const text of nodes)for(let i=0;i<text.length;i++){
   const c=text.data[i];if(c==='\n'){row++;continue;}const g=glyphs[c];if(!g?.d)continue;
   const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);const r=range.getBoundingClientRect();
   const p=document.createElementNS(ns,'path');p.setAttribute('d',g.d);p.setAttribute('transform',`translate(${(r.x-box.x)/scale} ${baseline+row*leading}) scale(${unit} ${-unit})`);p.setAttribute('fill','none');p.setAttribute('stroke',style.webkitTextStrokeColor);p.setAttribute('stroke-width',String(parseFloat(style.webkitTextStrokeWidth)/unit));p.setAttribute('pathLength','1');p.style.strokeDasharray='1';svg.append(p);
   animate(p,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1100,delay:160+index++*30,easing:'cubic-bezier(.35,0,.2,1)'});
  }
  const rb=remi.getBoundingClientRect(),rs=getComputedStyle(remi),character=remi.cloneNode(true);
  character.removeAttribute('data-source-node-id');character.removeAttribute('data-node-id');character.className='opening-remi';character.setAttribute('aria-hidden','true');
  Object.assign(character.style,{position:'absolute',left:rb.x+'px',top:rb.y+'px',width:rs.width,height:rs.height,transform:`scale(${rb.width/parseFloat(rs.width)})`,transformOrigin:'0 0',filter:'none',boxShadow:'none',opacity:0});
  const image=character.querySelector('img');image.src='/opening-remi.svg';image.removeAttribute('data-image-ref');overlay.prepend(svg,character);
  animate(character,[{opacity:0},{opacity:1}],{duration:900,delay:2150,easing:'ease-in-out'});
  const exit=animate(overlay,[{opacity:1},{opacity:0}],{duration:1150,delay:3650,easing:'ease-in-out'});exit.finished.then(cleanup).catch(()=>{});clearTimeout(timer);timer=setTimeout(cleanup,6000);
 }).catch(cleanup);
})();
