export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export const wrap=(index,count)=>(index%count+count)%count;
export const horizontalIntent=(dx,dy)=>Math.abs(dx)>=8&&Math.abs(dx)>Math.abs(dy)*1.2;
export const slideDestination=(current,dx,width,count)=>Math.abs(dx)>width*.18?clamp(current+(dx<0?1:-1),0,count-1):current;
export const dragOffset=(current,dx,width,count)=>{
  const limited=clamp(dx,-width,width);
  return (current===0&&limited>0)||(current===count-1&&limited<0)?limited*.2:limited;
};
export const chapterAt=(tops,viewportHeight,atBottom)=>atBottom?tops.length-1:Math.max(0,tops.findLastIndex(top=>top<=viewportHeight*.35));
export const anchorTarget=(contentTop,contentHeight,viewportHeight,maxScroll)=>{
  const inset=clamp(viewportHeight*.06,24,64);
  const offset=contentHeight<=viewportHeight-inset*2?(viewportHeight-contentHeight)/2:inset;
  return clamp(contentTop-offset,0,Math.max(0,maxScroll));
};
export const fontSettings=mobile=>({min:24,max:mobile?48:72,defaultValue:mobile?32:48});
export const elasticLimit=(kind,width,height)=>kind==='icon'?16:Math.min(width*.2,height*.2,24);
