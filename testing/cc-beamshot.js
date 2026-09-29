const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await sleep(500);
  await p.keyboard.press('Enter'); await sleep(300);
  const shots=[];
  for(const idx of [0,3,1]){
    await p.evaluate(i=>window.CLASH.setSel(i), idx); await sleep(120);
    await p.keyboard.press('Enter'); await sleep(1600);
    // bracket the fighters at a fixed distance, freeze the AI, face right
    await p.evaluate(()=>{ const C=window.CLASH; C.p1.ai=false; C.p2.ai=false; C.p1.x=260; C.p2.x=980; C.p2.y=C.GROUND_Y(); C.p1.dir=1; C.p2.char=window.CLASH.CHARS[2]; C.p2.applyChar(C.p2.char); C.p2.hp=C.p2.maxhp; C.p1.meter=100; C.p1.atk=null; C.p2.state=0; });
    await sleep(120);
    await p.keyboard.down('KeyI'); await sleep(70); await p.keyboard.up('KeyI');
    const nm=await p.evaluate(()=>window.CLASH.p1.name);
    await sleep(300);
    await p.screenshot({path:`testing/beams-${idx}-${nm}.png`}); shots.push(`${idx}-${nm}`);
    await sleep(1500); await p.keyboard.press('Escape'); await sleep(400);
  }
  console.log(JSON.stringify({errs, shots}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
