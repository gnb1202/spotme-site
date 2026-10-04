// Keep the complete 1840 x 1036 design/player composition, uniformly scaled.
export function fitVideo({canvasWidth,canvasTop,viewportHeight,headerHeight,titleBottom}){
  const scale=canvasWidth/1920;
  const gap=canvasWidth<700?24:40;
  const start=Math.max(headerHeight,titleBottom,canvasTop);
  const availableHeight=Math.max(1,viewportHeight-start-2*gap);
  const width=Math.max(1,Math.min(1280,1840*scale,canvasWidth-2*gap,availableHeight*1840/1036));
  const height=width*1036/1840;
  // Balance the clear space below the title and below the player, including
  // tall screens where the width cap leaves extra vertical room.
  const top=start+(viewportHeight-start-height)/2;
  return {left:(canvasWidth-width)/2/scale,top:(top-canvasTop)/scale,
    scale:width/(1840*scale),width,height,screenTop:top};
}
