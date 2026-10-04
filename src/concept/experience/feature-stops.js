// Only the gaps between stories are stepped. The long demos keep native scrolling.
export function nextFeatureStop(y,direction,stops,tolerance=4){
  if(direction>0){
    for(let i=0;i<stops.length-1;i++){
      if(y>=stops[i]-tolerance&&y<stops[i+1]-tolerance)return stops[i+1];
    }
  }else{
    for(let i=stops.length-1;i>0;i--){
      if(y<=stops[i]+tolerance&&y>stops[i-1]+tolerance)return stops[i-1];
    }
  }
  return null;
}
