const key='spotme:home-opening:v1';
let seenInMemory=false;
export function hasSeenOpening(){
 try{return seenInMemory||sessionStorage.getItem(key)==='seen';}catch{return seenInMemory;}
}
export function markOpeningSeen(){
 seenInMemory=true;try{sessionStorage.setItem(key,'seen');}catch{}
}
