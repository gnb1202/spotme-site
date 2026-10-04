// Short introductory hold; each animated demo keeps its original one-screen runway.
export function overviewPhase(progress,{first,step,total}){
 const distance=Math.max(0,Math.min(1,progress))*total;
 const phase=Math.max(0,Math.min(4,distance<first?distance/first:1+(distance-first)/step));
 // Normalized scroll values can round just below an exact section boundary.
 return Math.abs(phase-Math.round(phase))<1e-9?Math.round(phase):phase;
}
