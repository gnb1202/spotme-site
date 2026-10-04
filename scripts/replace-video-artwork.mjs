// User-approved replacement, scoped to the two current generated route inputs.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const replacements=[
 ['6dd16663e9306da54fd9626d45ab2ec27a3a1a2e67602cd421b9833a4e29c0f3.png','4cf0f12a46b3fb5c3d1bd318badba66052ea75f700707a49dd4ffb0dcb0cd35a.jpg'],
 ['4a174cfd179cda4beee42dc261086b6eab6d4f4c96a0cca6d434f6e390318083.png','6577c33130d122ea997e6c3a82fde6f896ae2ed4cfae626614938277644283f9.png'],
];
for(const relative of ['src/generated/pages/video.json','src/generated/pages.json']){
 const file=path.join(root,relative);let text=fs.readFileSync(file,'utf8');
 for(const [before,after] of replacements){
  if(!text.includes(before)&&!text.includes(after))throw Error('Missing expected reference '+before);
  text=text.replaceAll(before,after);
 }
 fs.writeFileSync(file,text);
}
console.log('Updated active video artwork references');
