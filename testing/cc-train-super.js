const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await sleep(600);
  await p.keyboard.press('KeyT'); await sleep(500);
  // wait for full recovery, then special for each char
  const out=[];
  for(let i=0;i<5;i++){
    await p.evaluate(()=>{ const C=window.CLASH; C.p1.meter=100; C.p1.atk=null; C.p1.cooldown=0; C.p1.hitStun=0; C.p1.superT=0; C.p1.state=0; C.p2.hp=C.p2.maxhp; });
    await p.keyboard.press('KeyI'); await sleep(260);
    const s1=await p.evaluate(()=>({proj:window.CLASH.projCount(), superT:+window.CLASH.p1.superT.toFixed(2), state:window.CLASH.p1.state, dummyHp:Math.round(window.CLASH.p2.hp)}));
    out.push(s1);
    await p.screenshot({path:`testing/tr-super-${i}-${await p.evaluate(()=>window.CLASH.p1.name)}.png`});
    await sleep(1800);
  }
  console.log(JSON.stringify({errs, out},null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
