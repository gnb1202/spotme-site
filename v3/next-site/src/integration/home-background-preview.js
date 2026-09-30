// Approved top-aligned background: reuse frozen 20:197 artwork/crop/gradient.
// Only the background changes; the 1920 x 1080 foreground/opening stays intact.
export function backgroundLayout(width,height){
  const heroScale=Math.min(1,width/1920,height/1080);
  const stageLeft=(width-1920*heroScale)/2;
  const stageTop=(height-1080*heroScale)/2;
  // Cover the viewport with a two-pixel bleed to avoid fractional transform seams.
  const top=0,scale=Math.max((width+4)/1920,height/1180);
  return {heroScale,scale,top,left:(width-1920*scale)/2,
    stageLeft,stageTop,width:1920*scale,height:1180*scale};
}

export function setupBackgroundPreview(scope){
  const hero=scope.querySelector('#hero-scroll'),stage=scope.querySelector('#stage');
  const viewport=scope.querySelector('#home .viewport');
  const gym=scope.querySelector('#home [data-source-node-id="20:197"]');
  const base=scope.querySelector('#home [data-source-node-id="20:128"]');
  const black=scope.querySelector('#black');
  const lower=scope.querySelector('#next-content [data-source-node-id="254:30"]');
  const lowerFill=lower?.querySelector('.fill-layer'),lowerImage=lower?.querySelector('img'),lowerFrame=lowerImage?.parentElement;
  const lowerCanvas=scope.querySelector('#next-content .canvas');
  const saved=[stage,viewport,gym,base,black,lower,lowerFill,lowerFrame,lowerImage].filter(Boolean).map(el=>[el,el.getAttribute('style')]);
  stage.style.overflow='visible';viewport.style.overflow='visible';
  scope.dataset.backgroundLayout='top';
  const fit=()=>{
    const width=scope.clientWidth,height=hero.clientHeight;
    const l=backgroundLayout(width,height),s=l.heroScale;
    Object.assign(gym.style,{left:`${(l.left-l.stageLeft)/s}px`,top:`${(l.top-l.stageTop)/s}px`,
      transform:`scale(${l.scale/s})`,transformOrigin:'0 0'});
    // Extend the original mint base and opening's black plate along with the
    // artwork, so neither intro playback nor replay exposes side strips.
    for(const el of [base,black])Object.assign(el.style,{
      left:`${-l.stageLeft/s}px`,top:`${-l.stageTop/s}px`,
      width:`${width/s}px`,height:`${height/s}px`});
    // Keep the foreground canvas capped at its source size; extend only its background.
    // The interactive home overview has its own layout, with no frozen lower canvas.
    if(!lower)return;
    const pageScale=Math.min(1,width/1920),canvasLeft=Math.max(0,(width-1920)/2);
    Object.assign(lower.style,{left:`${(-canvasLeft-2)/pageScale}px`,width:`${(width+4)/pageScale}px`,overflow:'visible',backgroundColor:'#5eefd3',isolation:'isolate'});
    Object.assign(lowerFill.style,{width:'100%',height:'100%'});
    Object.assign(lowerFrame.style,{left:'0px',top:'0px',width:'100%',height:'100%'});
    Object.assign(lowerImage.style,{left:'0px',top:'0px',width:'100%',height:'100%',transform:'none',objectFit:'cover'});
  };
  fit();
  const observer=new ResizeObserver(fit);observer.observe(hero);if(lowerCanvas)observer.observe(lowerCanvas);
  return ()=>{observer.disconnect();delete scope.dataset.backgroundLayout;
    for(const [el,style] of saved){if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);}};
}
