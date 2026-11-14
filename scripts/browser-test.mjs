import {chromium} from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1'))errors.push(`${r.status()} ${r.url()}`);});
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
const check=(x,msg)=>{if(!x)throw Error(msg);};
for(let attempt=0;;attempt++){try{await page.goto(base,{waitUntil:'networkidle'});break;}catch(e){if(attempt>=9)throw e;await new Promise(r=>setTimeout(r,500));}}
check(await page.locator('.chapter-card').count()===14,'14 chapter cards');
await page.screenshot({path:'.work/home-desktop.png',fullPage:true});
await page.locator('#search').fill('Sinkhorn');check(await page.locator('.chapter-card').count()>0,'search');await page.locator('#search').fill('no-match-xyz');check(await page.locator('.empty').count()===1,'empty search');
const lessons=await page.evaluate(()=>window.LESSONS);
for(const l of lessons){await page.goto(base+'#chapter/'+l.slug);await page.getByRole('heading',{name:l.title,exact:true}).waitFor(); await page.locator('.formula .katex').first().waitFor(); console.log('chapter',l.id);check(await page.locator('.katex-error').count()===0,`KaTeX error in ${l.id}`);check(await page.locator('.concept-figure').count()===1,`figure ${l.id}`);check(await page.locator('#chapter-lab svg').count()===1,`lab ${l.id}`);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${l.id}`);const r=await page.request.get(base+`downloads/${l.id}-${l.slug}.ipynb`);check(r.ok(),`download ${l.id}`);const nb=await r.json();check(nb.cells.some(c=>c.cell_type==='code'),'notebook code');}
await page.goto(base+'#chapter/sinkhorn');await page.locator('#chapter-lab').scrollIntoViewIfNeeded();await page.screenshot({path:'.work/sinkhorn-desktop.png'});
await page.locator('[data-answer="1"]').click();check((await page.locator('.quiz-result').textContent()).includes('答对了'),'quiz feedback');await page.locator('#complete').click();await page.reload();check((await page.locator('#complete').textContent()).includes('已标记'),'persistent progress');
for(const lab of ['transport','sinkhorn','interpolation','sliced','structure']){await page.goto(base+'#lab/'+lab);const slider=lab==='structure'?page.locator('[data-warp]'):page.locator('input[type="range"]').first();const before=await page.locator('.lab-metrics').textContent();await slider.fill(await slider.getAttribute('max'));await slider.dispatchEvent('input');const after=await page.locator('.lab-metrics').textContent();check(before!==after,`slider metrics change ${lab}`);}
await page.goto(base+'#lab/sinkhorn');await page.locator('[data-a]').fill('60');await page.locator('[data-a]').dispatchEvent('input');await page.locator('[data-e]').fill('-2.7');await page.locator('[data-e]').dispatchEvent('input');check((await page.locator('[data-message]').textContent()).includes('尚未满足'),'iteration limit clearly reported');check(await page.locator('[data-message]').getAttribute('data-converged')==='false','warning state');
await page.setViewportSize({width:390,height:844});await page.goto(base+'#home');await page.screenshot({path:'.work/home-mobile.png',fullPage:true});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile home overflow');
for(const l of lessons){await page.goto(base+'#chapter/'+l.slug);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`mobile overflow ${l.id}`);}
await page.goto(base+'#chapter/intuition');await page.screenshot({path:'.work/chapter-mobile.png',fullPage:true});
await page.locator('.concept-figure .expand-figure').click();check(await page.locator('dialog').isVisible(),'enlarged mobile figure');await page.getByRole('button',{name:'关闭图示'}).click();await page.locator('dialog').waitFor({state:'detached'});
await page.goto(base+'#resources');for(const path of ['downloads/pot-zh-notebooks.zip','downloads/handbook.md','downloads/PLAN.md','downloads/AUDIT.md'])check((await page.request.get(base+path)).ok(),`resource ${path}`);
await page.screenshot({path:'.work/resources-mobile.png',fullPage:true});check(errors.length===0,errors.join('\n'));
console.log('PASS: 14 desktop/mobile chapters, math rendering, concept figures, 5 interactive labs, notebook/resource downloads, search, quiz and persistent progress; no page errors.');
await browser.close();
