import {chromium} from 'playwright';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1920,height:1080}});
await page.goto('http://127.0.0.1:4184/');await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
await page.screenshot({path:'reports/asset-audit/home-top.png'});
for(const id of ['139:50','120:964'])await page.locator(`[data-source-node-id="${id}"]`).screenshot({path:`reports/asset-audit/phone-${id.replace(':','-')}.png`});
await browser.close();
