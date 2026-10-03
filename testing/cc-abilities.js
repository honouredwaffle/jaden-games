const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await sleep(500);
  await p.keyboard.press('Enter'); await sleep(300);

  const shots=[];
  for(let idx=0; idx<5; idx++){
    await p.evaluate(i=>window.CLASH.setSel(i), idx); await sleep(120);
    await p.keyboard.press('Enter'); await sleep(1500);
    // clear existing attack, fire the special, capture mid-flight
    await p.evaluate(()=>{ window.CLASH.p1.meter=100; window.CLASH.p1.atk=null; });
    await p.keyboard.down('KeyI'); await sleep(90); await p.keyboard.up('KeyI');
    await sleep(330);              // let the projectile get out in front
    const nm=await p.evaluate(()=>window.CLASH.p1.name);
    const info=await p.evaluate(()=>({proj:window.CLASH.projCount?window.CLASH.projCount():-1, superT:+window.CLASH.p1.superT.toFixed(2)}));
    await p.screenshot({path:`testing/ab-${idx}-${nm}.png`});
    shots.push(`${nm} proj=${info.proj} superT=${info.superT}`);
    await sleep(1600);
    await p.keyboard.press('Escape'); await sleep(400);
  }
  console.log(JSON.stringify({errs, shots},null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
