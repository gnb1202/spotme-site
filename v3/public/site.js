// No added effects: only font-baseline alignment and the existing source links.
document.fonts.ready.then(()=>{
 for(const el of document.querySelectorAll('.text')){
  const content=el.querySelector('.ink'),style=getComputedStyle(el),size=parseFloat(style.fontSize),scale=innerWidth/1920;
  const metrics=window.FONT_METRICS?.[el.dataset.font];if(!metrics)continue;
  const range=document.createRange();range.selectNodeContents(content);
  const lines=[...range.getClientRects()].filter(r=>r.width>0).map(r=>r.y/scale);
  // Empty authored lines still occupy leading; counting only nonempty rects
  // incorrectly stretches paragraphs containing a blank line.
  const count=Math.max(el.textContent.split(/\n|\u2028|\u2029/).length,Math.round((Math.max(...lines)-Math.min(...lines))/parseFloat(style.lineHeight))+1);
  if(count){const derived=Number(el.dataset.sourceHeight)/count,declared=parseFloat(style.lineHeight);content.style.setProperty('--ink-leading',`${Math.abs(derived-declared)<=4?declared:derived}px`);}
  const marker=document.createElement('i');marker.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';content.prepend(marker);
  const baseline=(marker.getBoundingClientRect().top-el.getBoundingClientRect().top)/scale;marker.remove();
  const ascent=Math.max(...[...el.textContent.split('\n')[0]].map(c=>(metrics[c]?.[3]??0)*size));
  content.style.setProperty('--ink-offset',`${Number(el.dataset.inkTop)-(baseline-ascent)}px`);
 }
 const previous=sessionStorage.getItem('spotme-v3-scroll');
 if(previous){sessionStorage.removeItem('spotme-v3-scroll');const state=JSON.parse(previous);if(state.path===location.pathname)scrollTo(0,state.y)}
});
document.addEventListener('click',event=>{const link=event.target.closest('a[data-keep-scroll]');if(link&&!event.ctrlKey&&!event.metaKey&&event.button===0)sessionStorage.setItem('spotme-v3-scroll',JSON.stringify({path:new URL(link.href).pathname,y:scrollY}))});
