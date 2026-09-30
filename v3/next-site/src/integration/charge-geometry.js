// The fill references the calibrated outline geometry, not a second frozen copy.
// SVG <use> also follows any later font calibration without frame-by-frame syncing.
export function bindChargeGeometry(title,fill,signal){
  let observer;
  const connect=()=>{
    const outline=title.querySelector('[data-outline-geometry]');
    const id=outline?.dataset.outlineGeometry;
    if(!id)return false;
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href',`#${id}`);
    use.setAttribute('fill','#5eefd3');
    // Paint the charged interior AND its outside edge in one opaque pass.
    // Merely touching a separately antialiased masked outline leaves a seam.
    // Stroke width/joins live on the referenced geometry and track calibration.
    use.setAttribute('stroke','#5eefd3');
    fill.querySelector('g[clip-path]').replaceChildren(use);
    observer?.disconnect();
    return true;
  };
  const dispose=()=>observer?.disconnect();
  if(signal.aborted)return dispose;
  if(!connect()){
    observer=new MutationObserver(connect);
    observer.observe(title,{subtree:true,childList:true,attributes:true,attributeFilter:['data-outline-geometry']});
  }
  signal.addEventListener('abort',dispose,{once:true});
  return ()=>{dispose();signal.removeEventListener('abort',dispose);};
}
