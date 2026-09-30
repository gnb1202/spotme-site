import pages from './generated/route-loaders';

const pending=new Map(),images=new Map();
let allPages;
// Run once after the first page is visible. Shared assets reuse the same promise.
export function prepareAllPages(){
  return allPages??=Promise.allSettled(Object.keys(pages).map(preparePage));
}
function prepareImage(src){
  if(!images.has(src))images.set(src,new Promise(resolve=>{
    const image=new Image();
    const timer=setTimeout(resolve,8000);
    const done=()=>{clearTimeout(timer);resolve();};
    image.src=src;
    image.decode().then(done,done);
  }));
  return images.get(src);
}
export function preparePage(route){
  if(!pages[route])return Promise.resolve();
  if(!pending.has(route)){
    const request=pages[route]().then(async module=>{
      const assets=new Set();
      function visit(node){
        if(typeof node==='string')return;
        if(node.tag==='img'&&node.props?.src)assets.add(node.props.src);
        node.children?.forEach(visit);
      }
      visit(module.default.tree);
      await Promise.all([...assets].map(prepareImage));
      return module;
    }).catch(error=>{pending.delete(route);throw error;});
    pending.set(route,request);
  }
  return pending.get(route);
}
