import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const raw=JSON.parse(await fs.readFile('designs/figma-data.json'));
const manifest=JSON.parse(await fs.readFile('designs/assets.json'));
const assets=new Map(manifest.assets.filter(a=>!manifest.deliveryNodeOverrides?.includes(a.id)&&!manifest.composedPhones?.includes(a.id)).map(a=>[a.id,a]));
const imageFills=new Map(manifest.fills.map(a=>[a.imageRef,{...a,path:a.deliveryPath??a.path}]));
const routes=[['20:127','home','/'],['254:343','home-02','/home-02/'],['112:577','ai','/ai/'],['112:753','game','/game/'],['255:1085','game-02','/game-02/'],['255:1162','game-03','/game-03/'],['254:182','characters','/characters/'],['255:786','characters-b','/characters-b/'],['255:859','characters-c','/characters-c/'],['255:939','characters-d','/characters-d/'],['255:1012','characters-e','/characters-e/'],['145:215','video','/video/']];
const tabs={'홈':'/','AI 운동 서포트':'/ai/','게임처럼 즐기는 운동':'/game/','파트너 레미':'/characters/','홍보 영상':'/video/'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const css=s=>Object.entries(s).map(([k,v])=>`${k}:${v}`).join(';');
const px=x=>`${x}px`;
function color(c,opacity=1){const v=['r','g','b'].map(k=>Math.round(c[k]*255));return `rgba(${v.join(',')},${(c.a??1)*opacity})`}
function paint(n){return (n.fills??[]).filter(f=>f.visible!==false&&f.type!=='IMAGE').reverse().map(f=>{
 if(f.type==='SOLID'){const c=color(f.color,f.opacity??1);return `linear-gradient(${c},${c})`}
 if(f.type==='GRADIENT_LINEAR'){
  const [a,b]=f.gradientHandlePositions,{width:w,height:h}=n.absoluteBoundingBox;
  const dx=(b.x-a.x)*w,dy=(b.y-a.y)*h,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,L=Math.abs(w*ux)+Math.abs(h*uy),start=(a.x*w-w/2)*ux+(a.y*h-h/2)*uy+L/2;
  return `linear-gradient(${Math.atan2(dx,-dy)*180/Math.PI}deg,${f.gradientStops.map(s=>`${color(s.color,f.opacity??1)} ${(start+s.position*len)/L*100}%`).join(',')})`;
 }
 throw new Error(`Unsupported CSS paint ${n.id}: ${f.type}`);
}).join(',')}
function typography(s){const out={};for(const [key,prop] of [['fontFamily','font-family'],['fontWeight','font-weight'],['fontSize','font-size'],['lineHeightPx','line-height'],['letterSpacing','letter-spacing']])if(s[key]!==undefined)out[prop]=['fontSize','lineHeightPx','letterSpacing'].includes(key)?px(s[key]):key==='fontFamily'?`'${s[key]}',sans-serif`:s[key];if(s.textAlignHorizontal)out['text-align']=s.textAlignHorizontal.toLowerCase();const f=s.fills?.find(f=>f.type==='SOLID'&&f.visible!==false);if(f)out.color=color(f.color,f.opacity??1);return out}
function rich(n){if(!n.characterStyleOverrides?.length)return esc(n.characters);let start=0,out='';for(let end=1;end<=n.characters.length;end++){if(end<n.characters.length&&n.characterStyleOverrides[end]===n.characterStyleOverrides[start])continue;const s=typography(n.styleOverrideTable[n.characterStyleOverrides[start]]??{});out+=`<span class="run" style="${esc(css(s))}">${esc(n.characters.slice(start,end))}</span>`;start=end;}return out}
function effects(n,s){const shadow=[];for(const e of n.effects??[]){if(e.visible===false)continue;if(e.type==='LAYER_BLUR')s.filter=`blur(${e.radius/2}px)`;if(['DROP_SHADOW','INNER_SHADOW'].includes(e.type))shadow.push(`${e.type==='INNER_SHADOW'?'inset ':''}${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread??0}px ${color(e.color)}`)}if(shadow.length)s['box-shadow']=shadow.join(',')}
function fillLayers(n){
 const b=n.absoluteBoundingBox,angle=(n.rotation??0)*180/Math.PI,c=Math.abs(Math.cos(n.rotation??0)),sn=Math.abs(Math.sin(n.rotation??0)),det=c*c-sn*sn;
 // absoluteBoundingBox includes rotation; recover the original local rectangle.
 const w=(b.width*c-b.height*sn)/det,h=(b.height*c-b.width*sn)/det;
 return (n.fills??[]).filter(f=>f.visible!==false).map(f=>{
  if(f.type!=='IMAGE')return `<div class="fill-layer" aria-hidden="true" style="background:${esc(paint({...n,fills:[f]}))}"></div>`;
  const a=imageFills.get(f.imageRef);if(!a)throw new Error('Missing original fill '+n.id);
  const s={position:'absolute',width:'100%',height:'100%','object-fit':f.scaleMode==='FIT'?'contain':'cover',left:0,top:0};
  if(a.deliveryPath&&f.scaleMode==='FILL'&&!f.imageTransform){
   // Re-exported artwork can have a different canvas ratio. Preserve the
   // frozen fill's original cover rectangle, not the replacement PNG ratio.
   const ratio=a.pixelWidth/a.pixelHeight,iw=Math.max(w,h*ratio),ih=iw/ratio;
   Object.assign(s,{width:px(iw),height:px(ih),left:px((w-iw)/2),top:px((h-ih)/2),'object-fit':'fill'});
  }
  if(f.imageTransform){const [[sx,kx,tx],[ky,sy,ty]]=f.imageTransform;if(Math.abs(kx)+Math.abs(ky)>1e-5)throw new Error('Unsupported skew '+n.id);Object.assign(s,{width:100/sx+'%',height:100/sy+'%',left:-tx/sx*100+'%',top:-ty/sy*100+'%','object-fit':'fill'});}
  if(f.filters?.saturation===-1)s.filter='grayscale(1)';
  // Figma MCP explicitly reports rotate-180 + scaleY(-1) for these mirrored Remi nodes.
  const mirror=f.imageRef==='605656591189b8e57f81e5e8f1ea5d233ff75913'&&Math.abs(Math.abs(angle)-180)<.01?' scaleY(-1)':'';
  const layer={width:px(w),height:px(h),left:'50%',top:'50%',transform:`translate(-50%,-50%) rotate(${angle}deg)${mirror}`,opacity:f.opacity??1,'mix-blend-mode':f.blendMode==='MULTIPLY'?'multiply':'normal'};
  let imageStyle=s,wrapper='';
  if(a.deliveryRegistration||a.deliveryRotation){
   const dimension=(value,base)=>String(value).endsWith('%')?parseFloat(value)/100*base:parseFloat(value),iw=dimension(s.width,w),ih=dimension(s.height,h);
   imageStyle={position:'absolute',width:'100%',height:'100%','object-fit':'fill',left:0,top:0};
   if(a.deliveryRegistration){const [a1,b1,c1,d1,tx,ty]=a.deliveryRegistration;imageStyle.transform=`translate(${tx*100}%,${ty*100}%) matrix(${a1},${b1*ih/iw},${c1*iw/ih},${d1},0,0)`;imageStyle['transform-origin']='0 0';}
   if(a.deliveryRotation)Object.assign(imageStyle,{width:px(ih),height:px(iw),left:px((iw-ih)/2),top:px((ih-iw)/2),transform:`rotate(${a.deliveryRotation}deg)`});
   wrapper=`<div style="${esc(css(s))}">`;
  }
  return `<div class="fill-layer" style="${esc(css(layer))}">${wrapper}<img src="/${a.path}" data-image-ref="${f.imageRef}" alt="" draggable="false" style="${esc(css(imageStyle))}">${wrapper?'</div>':''}</div>`;
 }).join('');
}
const pages=[];
for(const [frameId,slug,url] of routes){
 const frame=raw.nodes[frameId].document,origin=frame.absoluteBoundingBox,render=frame.absoluteRenderBounds;
 const height=Math.ceil(render.y+render.height-origin.y),inventory=[],artwork=[];
 function node(n,parent,header=false,phone=false){
  if(n.visible===false||n.absoluteRenderBounds===null)return '';
  if(!phone&&manifest.composedPhones?.includes(n.id)&&Math.abs(n.rotation??0)>.00001){
   // Undo the parent's rotation in all descendant AABBs, then rotate the
   // assembled device once. Its screen remains a direct local <img>.
   const angle=n.rotation,b=n.absoluteBoundingBox,c=Math.cos(angle),sn=Math.sin(angle),ac=Math.abs(c),as=Math.abs(sn),det=ac*ac-as*as;
   const w=(b.width*ac-b.height*as)/det,h=(b.height*ac-b.width*as)/det,cx=b.x+b.width/2,cy=b.y+b.height/2;
   function unrotate(source){const copy=structuredClone(source);for(const key of ['absoluteBoundingBox','absoluteRenderBounds']){const r=source[key];if(!r)continue;const dx=r.x+r.width/2-cx,dy=r.y+r.height/2-cy,rw=(r.width*ac-r.height*as)/det,rh=(r.height*ac-r.width*as)/det;copy[key]={x:w/2+dx*c+dy*sn-rw/2,y:h/2-dx*sn+dy*c-rh/2,width:rw,height:rh};}copy.rotation=0;copy.children=source.children?.map(unrotate);return copy;}
   const copy=unrotate(n);copy.absoluteBoundingBox={x:0,y:0,width:w,height:h};
   return `<div style="position:absolute;left:${cx-parent.x-w/2}px;top:${cy-parent.y-h/2}px;width:${w}px;height:${h}px;transform:rotate(${angle*180/Math.PI}deg)">${node(copy,{x:0,y:0},header,true)}</div>`;
  }
  phone=phone||manifest.composedPhones?.includes(n.id);
  if(phone&&n.isMask)return '';
  if(phone&&n.name==='Buttons'){
   const b=n.absoluteBoundingBox;artwork.push(n.id);
   return `<img class="node art" data-source-node-id="${n.id}" data-node-id="${n.id}" src="/assets/figma-v3/112-723.svg" alt="" style="left:${b.x-parent.x}px;top:${b.y-parent.y}px;width:${b.width}px;height:${b.height}px">`;
  }
  const a=assets.get(n.id),b=a?a.render:n.absoluteBoundingBox;if(!b)return '';
  const s={left:px(b.x-parent.x),top:px(b.y-parent.y),width:px(a?a.pixelWidth:b.width),height:px(a?a.pixelHeight:b.height)};
  const isHeader=n.name==='Frame 1'&&n.children?.some(c=>c.type==='TEXT'&&tabs[c.characters]);
  let tag=isHeader?'nav':'div',attrs=`class="node ${a?'art':n.type==='TEXT'?'text':'shape'}" data-source-node-id="${n.id}" data-node-id="${n.id}"`,content='';
  if(isHeader)attrs+=' aria-label="주요 메뉴"';
  if(a){
   const blend=[n.blendMode,a.fillBlend].find(v=>v==='MULTIPLY');if(blend)s['mix-blend-mode']='multiply';
   tag='img';attrs+=` src="/${a.path}" width="${a.pixelWidth}" height="${a.pixelHeight}" alt="${/iphone/i.test(n.name)?'스팟미 앱 화면':''}" draggable="false"`;
   artwork.push(n.id);
  }else if(n.type==='TEXT'){
   tag=header?'a':n.style.fontSize>=45?'h1':n.style.fontSize>=28?'h2':'p';Object.assign(s,typography(n.style));
   const f=n.fills.find(f=>f.visible!==false&&f.type==='SOLID');s.color=f?color(f.color,f.opacity??1):'transparent';
   const stroke=n.strokes?.find(f=>f.visible!==false&&f.type==='SOLID');if(stroke){s['-webkit-text-stroke']=`${n.strokeWeight}px ${color(stroke.color)}`;}
   if(header){attrs+=` href="${tabs[n.characters]}"`;if(n.style.fontWeight===700)attrs+=' aria-current="page"';}
   const blur=(n.effects??[]).find(e=>e.visible!==false&&e.type==='LAYER_BLUR')?.radius??0;
   attrs+=` data-font="${n.style.fontFamily}:${n.style.fontWeight}" data-ink-top="${n.absoluteRenderBounds.y-b.y+blur+(stroke?n.strokeWeight:0)}" data-source-height="${b.height}"`;
   content=`<span class="ink">${rich(n)}</span>`;inventory.push({id:n.id,text:n.characters});effects(n,s);
  }else{
   const hasImage=(n.fills??[]).some(f=>f.visible!==false&&f.type==='IMAGE');
   const fill=hasImage?'':paint(n);if(fill)s.background=fill;
   if(n.type==='ELLIPSE')s['border-radius']='50%';else if(n.rectangleCornerRadii)s['border-radius']=n.rectangleCornerRadii.map(px).join(' ');else if(n.cornerRadius)s['border-radius']=px(n.cornerRadius);
   const stroke=n.strokes?.find(f=>f.visible!==false&&f.type==='SOLID');if(stroke)s['box-shadow']=`inset 0 0 0 ${n.strokeWeight}px ${color(stroke.color)}`;
   if(n.opacity!==undefined)s.opacity=n.opacity;if(n.clipsContent)s.overflow='hidden';effects(n,s);
   if(phone&&manifest.composedPhones.includes(n.id)){
    const shadows=(n.effects??[]).filter(e=>e.visible!==false&&e.type==='DROP_SHADOW');
    if(shadows.length){delete s['box-shadow'];s.filter=shadows.map(e=>`drop-shadow(${e.offset.x}px ${e.offset.y}px ${e.radius/2}px ${color(e.color)})`).join(' ');}
   }
   if(hasImage){
    s.overflow='hidden';content=fillLayers(n);artwork.push(n.id);
    // Image shadows follow alpha, not the rectangular node bounds.
    const shadows=(n.effects??[]).filter(e=>e.visible!==false&&e.type==='DROP_SHADOW');
    if(shadows.length){delete s['box-shadow'];s.filter=[s.filter,...shadows.map(e=>`drop-shadow(${e.offset.x}px ${e.offset.y}px ${e.radius/2}px ${color(e.color)})`)].filter(Boolean).join(' ');}
    if(n.id==='112:722'||(phone&&n.name==='Screen (Replace here)')){s['mask-image']='url(/assets/figma-v3/112-721.svg)';s['mask-size']='100% 100%';}
   }
   const children=[...(n.children??[])];if(isHeader)children.sort((a,b)=>a.absoluteBoundingBox.x-b.absoluteBoundingBox.x);
   content+=children.map(c=>node(c,b,header||isHeader,phone)).join('');
  }
  let result=a?`<img ${attrs} style="${esc(css(s))}">`:`<${tag} ${attrs} style="${esc(css(s))}">${content}</${tag}>`;
  if(header&&n.type!=='TEXT'&&(a||(n.fills??[]).some(f=>f.type==='IMAGE')))result=`<a href="/" aria-label="SPOT ME 홈">${result}</a>`;
  if(n.name.normalize('NFC').includes('이전_black')){
   const index=routes.filter(r=>r[1].startsWith('characters')).findIndex(r=>r[1]===slug),set=routes.filter(r=>r[1].startsWith('characters'));
   const step=n.name.endsWith('1')?-1:1,next=set[(index+step+set.length)%set.length][2];
   result=`<a class="state-link" data-keep-scroll href="${next}" aria-label="${step<0?'이전':'다음'} 몬스터">${result}</a>`;
  }
  if(n.type==='RECTANGLE'&&n.name==='Rectangle 15047'){
   const set=routes.filter(r=>r[1].startsWith('game')),index=set.findIndex(r=>r[1]===slug),next=set[(index+1)%set.length][2];
   result=`<a ${attrs} data-keep-scroll href="${next}" aria-label="운동으로 공격" style="${esc(css(s))}">${content}</a>`;
  }
  return result;
 }
 const picker=slug==='home'?'<aside class="opening-picker" aria-label="오프닝 시안"><span class="opening-picker-label">오프닝 시안</span><a href="/?opening=type" title="타이포 → 흑백 레미" aria-label="A 오프닝 시안: 타이포와 흑백 레미">A</a></aside>':'';
 const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(frame.name)} | SPOT ME</title><link rel="stylesheet" href="/style.css"><script src="/font-metrics.js" defer></script><script src="/site.js" defer></script>${slug==='home'?'<link rel="stylesheet" href="/opening.css"><script src="/opening-glyphs.js" defer></script><script src="/opening.js" defer></script>':''}</head><body data-frame="${frameId}"><main class="viewport" style="--source-height:${height}"><div class="canvas" style="height:${height}px;background:${paint(frame)||'white'}">${frame.children.map(n=>node(n,origin)).join('')}</div></main>${picker}</body></html>`;
 const dir='public'+url;await fs.mkdir(dir,{recursive:true});await fs.writeFile(dir+'index.html',html);
 pages.push({frameId,slug,url,width:origin.width,height,inventory,artwork});
}
await fs.writeFile('designs/pages.json',JSON.stringify(pages,null,2));
execFileSync('python',['tools/font-metrics.py']);
execFileSync('python',['tools/opening-glyphs.py']);
execFileSync(process.execPath,['tools/opening-remi.mjs']);
console.log(JSON.stringify({pages:pages.length,sourceVersion:manifest.source.version,artwork:assets.size,textSlots:pages.reduce((s,p)=>s+p.inventory.length,0)}));
