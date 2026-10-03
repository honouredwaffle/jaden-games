const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await sleep(500);
  await p.keyboard.press('Enter'); await sleep(300);
  await p.evaluate(()=>window.CLASH.setSel(0)); await sleep(120);
  await p.keyboard.press('Enter'); await sleep(2000);
  const pre = await p.evaluate(()=>({screen:window.CLASH.screen, hp:window.CLASH.p1.hp, ko:window.CLASH.p1.ko, st:window.CLASH.p1.superT}));
  await p.evaluate(()=>{ window.CLASH.p1.meter=100; });
  await p.keyboard.down('KeyI'); await sleep(80); await p.keyboard.up('KeyI');
  const seq=[];
  for(let i=0;i<10;i++){ const s=await p.evaluate(()=>({st:+window.CLASH.p1.superT.toFixed(2), proj:window.CLASH.projCount(), state:window.CLASH.p1.state, meter:window.CLASH.p1.meter})); seq.push(s); await sleep(70); }
  console.log(JSON.stringify({errs, pre, seq}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
