import {chromium} from 'playwright';import fs from 'node:fs/promises';
const base=process.argv[2]??'http://127.0.0.1:4184',browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'}),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
for(const [letter,mode] of [['A','type']]){
 await page.goto(base+'/');
 await page.locator('.opening-picker a').filter({hasText:letter}).click();await page.waitForURL('**/?opening='+mode);
 await page.waitForFunction(()=>document.body.dataset.openingState==='running');
 await page.waitForFunction(()=>document.body.dataset.openingState==='done');
 const visible=await page.locator('.opening-picker').isVisible(),selected=await page.locator('.opening-picker a[aria-current="true"]').textContent();
 if(!visible||selected!==letter)throw new Error('Picker recovery '+letter);results.push({letter,mode,passed:true});
}
await page.goto(base+'/');await page.screenshot({path:'reports/opening/picker-desktop.png'});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'reports/opening/picker-mobile.png'});
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push('Mobile overflow');
await browser.close();const report={base,results,errors};await fs.writeFile('reports/opening/picker-'+(base.startsWith('https')?'production':'local')+'.json',JSON.stringify(report,null,2));console.log(report);process.exitCode=errors.length?1:0;
