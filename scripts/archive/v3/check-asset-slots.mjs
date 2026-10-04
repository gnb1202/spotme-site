import fs from 'node:fs/promises';import {chromium} from 'playwright';
const m=JSON.parse(await fs.readFile('designs/assets.json')),raw=JSON.parse(await fs.readFile('designs/figma-data.json')),pages=JSON.parse(await fs.readFile('designs/pages.json')),inventory=JSON.parse(await fs.readFile('designs/delivery-audit.json'));
const exports=new Set(m.assets.filter(a=>!m.deliveryNodeOverrides.includes(a.id)&&!m.composedPhones.includes(a.id)).map(a=>a.id));
const browser=await chromium.launch(),slots=[],failures=[];
for(const p of pages){
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4184'+p.url);await page.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode())));
 const actual=await page.evaluate(()=>[...document.querySelectorAll('img')].map(i=>({node:i.closest('[data-source-node-id]')?.dataset.sourceNodeId,ref:i.dataset.imageRef,path:decodeURI(new URL(i.src).pathname).slice(1),width:i.naturalWidth,height:i.naturalHeight})));
 function visit(n){if(n.visible===false||n.absoluteRenderBounds===null)return;if(exports.has(n.id)||n.name==='Buttons')return;
  for(const f of n.fills??[]){if(f.visible===false||f.type!=='IMAGE')continue;const local=m.delivery.find(d=>d.imageRef===f.imageRef),found=actual.find(a=>a.node===n.id&&a.ref===f.imageRef),fill=m.fills.find(d=>d.imageRef===f.imageRef),expected=local?.path??fill?.path;
   slots.push({page:p.slug,node:n.id,name:n.name,imageRef:f.imageRef,source:local?.sourcePath??expected,rendered:found?.path??null,local:!!local,match:local?.match??'Figma fallback'});
   if(!found||found.path!==expected||!found.width||!found.height)failures.push(`${p.slug} ${n.id}: expected ${expected}, found ${found?.path}`);
  }n.children?.forEach(visit);
 }visit(raw.nodes[p.frameId].document);await page.close();
}
await browser.close();const used=new Set(slots.filter(s=>s.local).map(s=>s.source));
const unused=inventory.local.filter(l=>!m.delivery.some(d=>d.sha256===l.sha256&&used.has(d.sourcePath))).map(l=>l.path);
const report={checkedAt:new Date().toISOString(),sourceVersion:m.source.version,slots,unused,exceptions:m.deliveryExceptions,figmaExports:m.fallbacks.nodeExports,failures,summary:{imageSlots:slots.length,localSlots:slots.filter(s=>s.local).length,localFiles:used.size,unusedDeliveryFiles:unused.length,phoneCompositions:m.composedPhones.length}};
await fs.writeFile('reports/asset-audit/slots.json',JSON.stringify(report,null,2));
const safe=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;');
await fs.writeFile('reports/asset-audit/index.html',`<!doctype html><meta charset="utf-8"><title>SPOT ME — asset audit</title><style>body{font:14px system-ui;margin:32px;background:#fafafa}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:7px;text-align:left}tr.fallback{background:#fff0d6}code{overflow-wrap:anywhere}p{max-width:1000px}</style><h1>오늘자 에셋 연결 점검</h1><p>로컬 파일 ${used.size}개 / 직접 이미지 슬롯 ${slots.length}개 중 ${slots.filter(s=>s.local).length}개 연결. 휴대폰 ${m.composedPhones.length}개는 프레임과 화면 분리. 원본 PNG는 수정하지 않았습니다. 이 보고서는 픽셀 일치 인증이 아닙니다.</p><h2>Figma 유지 항목</h2><p>${safe(m.deliveryExceptions.map(e=>e.reason).join(' '))}</p><table><tr><th>페이지</th><th>Figma 노드</th><th>출처</th><th>연결 파일</th></tr>${slots.map(s=>`<tr class="${s.local?'':'fallback'}"><td>${safe(s.page)}</td><td>${safe(s.node)} · ${safe(s.name)}</td><td>${s.local?'오늘자 PNG':'Figma 유지'}</td><td><code>${safe(s.source)}</code></td></tr>`).join('')}</table><h2>별도 Figma 벡터·합성 이미지</h2><pre>${safe(JSON.stringify(m.fallbacks.nodeExports,null,2))}</pre><h2>현재 시안에 연결되지 않은 전달 파일</h2><pre>${safe(unused.join('\n'))}</pre>`);
console.log(JSON.stringify({summary:report.summary,failures},null,2));process.exitCode=failures.length?1:0;
