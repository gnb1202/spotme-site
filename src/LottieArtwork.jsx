'use client';
import {useEffect,useRef} from 'react';
// Ready for approved SPOT ME animation data; no third-party artwork is bundled.
export function LottieArtwork({animationData,label,className}){
  const ref=useRef(null);
  useEffect(()=>{
    let cancelled=false,animation;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const apply=()=>{if(reduced.matches)animation?.goToAndStop(0,true);else animation?.play();};
    import('lottie-web').then(({default:lottie})=>{
      if(cancelled)return;
      animation=lottie.loadAnimation({container:ref.current,renderer:'svg',loop:false,autoplay:!reduced.matches,animationData:structuredClone(animationData)});
      reduced.addEventListener('change',apply);
    });
    return()=>{cancelled=true;reduced.removeEventListener('change',apply);animation?.destroy();};
  },[animationData]);
  return <div ref={ref} role="img" aria-label={label} className={className}/>;
}
