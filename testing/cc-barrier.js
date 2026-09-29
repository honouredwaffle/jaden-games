const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'}); await sleep(600);
  await p.evaluate(()=>{ window.CLASH.setSel(0); window.CLASH.openTraining(); }); await sleep(300);
  const startX=await p.evaluate(()=>Math.round(window.CLASH.p1.x));
  await p.keyboard.down('KeyD'); await sleep(1200); await p.keyboard.up('KeyD'); await sleep(200);
  const endX=await p.evaluate(()=>Math.round(window.CLASH.p1.x));
  const W=1280;
  console.log(JSON.stringify({startX, endX, wall58:Math.round(W*0.58), passedBarrier: endX>W*0.58, reachedRight: endX>W*0.9, errs}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
