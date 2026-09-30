import {useLayoutEffect,useState} from 'react';
import metrics from './generated/font-metrics.js';

export function useFontAlignment(ref,key,{markReady=true}={}){
  const [epoch,setEpoch]=useState(0);
  useLayoutEffect(()=>{
    let cancelled=false;
    document.fonts.ready.then(()=>{
      if(cancelled||!ref.current)return;
      for(const el of ref.current.querySelectorAll('.text')){
        const content=el.querySelector('.ink'),style=getComputedStyle(el),scale=el.getBoundingClientRect().width/parseFloat(style.width);
        if(!Number.isFinite(scale)||scale<=0)continue;
        if(!content)continue;
        // Rich text can override every glyph's family/weight (Lv.1: Futura metadata,
        // delivered Pretendard Light + Bold runs). Read the actual run typography.
        const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT),firstLine=[];let ended=false;
        while(walker.nextNode()&&!ended){const text=walker.currentNode,run=getComputedStyle(text.parentElement),family=run.fontFamily.split(',')[0].replace(/["']/g,'').trim(),glyphs=metrics[family+':'+run.fontWeight];
          for(const char of text.textContent){if(char==='\n'){ended=true;break;}if(glyphs?.[char])firstLine.push(glyphs[char][3]*parseFloat(run.fontSize));}
        }
        if(!firstLine.length)continue;
        content.style.removeProperty('--ink-offset');content.style.removeProperty('--ink-leading');
        const range=document.createRange();range.selectNodeContents(content);
        const lines=[...range.getClientRects()].filter(r=>r.width>0).map(r=>r.y/scale);
        const count=Math.max(el.textContent.split(/\n|\u2028|\u2029/).length,Math.round((Math.max(...lines)-Math.min(...lines))/parseFloat(style.lineHeight))+1);
        if(count){const derived=Number(el.dataset.sourceHeight)/count,declared=parseFloat(style.lineHeight);content.style.setProperty('--ink-leading',`${Math.abs(derived-declared)<=4?declared:derived}px`);}
        const marker=document.createElement('i');marker.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';content.prepend(marker);
        const baseline=(marker.getBoundingClientRect().top-el.getBoundingClientRect().top)/scale;marker.remove();
        const ascent=Math.max(...firstLine);
        content.style.setProperty('--ink-offset',`${Number(el.dataset.inkTop)-(baseline-ascent)}px`);
        // CSS counts trailing letter spacing in centered/right-aligned line width;
        // Figma aligns the glyph run without that final spacing.
        const spacing=parseFloat(style.letterSpacing)||0,shift=style.textAlign==='center'?spacing/2:style.textAlign==='right'?spacing:0;
        content.style.transform=shift?`translateX(${shift}px)`:'';
      }
      if(markReady)ref.current.dataset.ready='true';
      setEpoch(value=>value+1);
    });
    return()=>{cancelled=true;};
  },[ref,key,markReady]);
  return epoch;
}
