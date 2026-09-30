import React,{useLayoutEffect,useRef,useState,useId} from 'react';
import glyphData from './generated/outline-glyphs';

// Figma OUTSIDE is not CSS's centered text stroke. Preserve the delivered font
// contours, then subtract the original glyph fill from a double-width stroke.
export function FigmaOutline({spec,epoch}){
 const ref=useRef(null),[shape,setShape]=useState(null),maskId=useId().replaceAll(':','');
 useLayoutEffect(()=>{
  const el=ref.current.parentElement,ink=el.querySelector('.ink'),box=el.getBoundingClientRect(),scale=box.width/parseFloat(el.style.width),fontSize=parseFloat(getComputedStyle(el).fontSize),unit=fontSize/glyphData.upm;
  const marker=document.createElement('i');marker.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';ink.prepend(marker);const baseline=(marker.getBoundingClientRect().top-box.top)/scale;marker.remove();
  const walker=document.createTreeWalker(ink,NodeFilter.SHOW_TEXT),paths=[],bounds=[];let firstY;
  while(walker.nextNode()){const text=walker.currentNode;
   for(let i=0;i<text.length;i++){
    const glyph=glyphData.glyphs[text.data[i]];if(!glyph?.d)continue;
    const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);const r=range.getBoundingClientRect();firstY??=r.y;
    const x=(r.x-box.x)/scale,y=baseline+(r.y-firstY)/scale,[x0,y0,x1,y1]=glyph.bounds;
    paths.push({d:glyph.d,transform:`translate(${x} ${y}) scale(${unit} ${-unit})`});bounds.push([x+x0*unit,y-y1*unit,x+x1*unit,y-y0*unit]);
   }
  }
  const left=Math.min(...bounds.map(b=>b[0])),top=Math.min(...bounds.map(b=>b[1])),width=Math.max(...bounds.map(b=>b[2]))-left,height=Math.max(...bounds.map(b=>b[3]))-top;
  const target=spec.bounds,sx=(target.width-2*spec.stroke)/width,sy=(target.height-2*spec.stroke)/height;
  setShape({paths,transform:`translate(${target.x+spec.stroke} ${target.y+spec.stroke}) scale(${sx} ${sy}) translate(${-left} ${-top})`,unit,sx});
  const original=ink.style.opacity;ink.style.opacity='0';el.dataset.outlineReady='true';
  return()=>{ink.style.opacity=original;delete el.dataset.outlineReady;};
 },[spec,epoch]);
 const paths=fill=>shape.paths.map((p,i)=><path key={i} d={p.d} transform={p.transform} fill={fill}/>);
 return <svg ref={ref} aria-hidden="true" data-figma-outside-stroke="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none'}}>
  {shape&&<><defs><mask id={maskId} maskUnits="userSpaceOnUse" x="-50" y="-50" width="2100" height="1200"><rect x="-50" y="-50" width="2100" height="1200" fill="white"/><g transform={shape.transform}>{paths('black')}</g></mask></defs><g mask={`url(#${maskId})`}><g transform={shape.transform} stroke={spec.color} strokeWidth={spec.stroke*2/shape.unit/shape.sx} strokeLinejoin="round">{paths('none')}</g></g></>}
 </svg>;
}
