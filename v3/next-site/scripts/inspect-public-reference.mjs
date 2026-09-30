import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,basename} from 'node:path';
const out=resolve(import.meta.dirname,'../reports/toss-reference');
const {scripts,styles}=JSON.parse(readFileSync(resolve(out,'urls.json')));
mkdirSync(resolve(out,'public-source'),{recursive:true});
const lazy=['182-ce09338ca5150b3d.js','1458.f827f7fd14d50ea8.js','8542.a15722b14fc8ca7a.js','8539.5eea688c162aff57.js','6172.e9de240f0f55b183.js','4532.2e78c6a66e4a84c6.js','9679.e223760506ae801e.js','3356.9b0b96d477b6a517.js','2380.11313cadbfddbe43.js'].map(file=>'https://static.toss.im/frontend/new.toss.im/toss-im-new/_next/static/chunks/'+file);
await Promise.all([...scripts,...styles,...lazy].map(async url=>{
 const res=await fetch(url); if(!res.ok)throw Error(`${res.status} ${url}`);
 writeFileSync(resolve(out,'public-source',basename(new URL(url).pathname)),await res.text());
}));
console.log('Saved public browser-delivered source for local inspection only.');
