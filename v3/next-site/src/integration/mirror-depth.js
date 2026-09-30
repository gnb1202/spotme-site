// Finite camera travel through separate planes; never recycle a passed plane.
export const mirrorFlight={count:18,focal:1.8,spacing:1.35,travel:15,duration:1.75};
const clamp=n=>Math.max(0,Math.min(1,n));
export function projectMirror(index,progress){
  const {focal,spacing,travel}=mirrorFlight;
  const p=clamp(progress),distance=focal+index*spacing-travel*p*p*(2-p);
  if(distance<=.24)return {scale:7.5,opacity:0,distance};
  const scale=focal/distance;
  const nearFade=clamp((distance-.24)/.41);
  const farFade=clamp((26-distance)/20);
  return {scale,opacity:nearFade*(.12+.78*farFade),distance};
}
