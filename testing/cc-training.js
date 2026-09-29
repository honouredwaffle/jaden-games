const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await sleep(600);
  const R={};
  // enter training via keyboard T from menu
  await p.keyboard.press('KeyT'); await sleep(500);
  R.screen1=await p.evaluate(()=>window.CLASH.screen);
  await p.screenshot({path:'testing/tr-1-enter.png'});
  // switch dummy with E
  await p.keyboard.press('KeyE'); await sleep(200);
  R.dummy=await p.evaluate(()=>window.CLASH.train.dummy);
  // punch the dummy repeatedly
  for(let i=0;i<6;i++){ await p.keyboard.press('KeyJ'); await sleep(260); }
  for(let i=0;i<5;i++){ await p.keyboard.press('KeyK'); await sleep(300); }
  R.afterAttacks=await p.evaluate(()=>({screen:window.CLASH.screen, hits:window.CLASH.train.hits, dmg:Math.round(window.CLASH.train.dmg), dummyHp:Math.round(window.CLASH.p2.hp), p1Hp:Math.round(window.CLASH.p1.hp), p2ko:window.CLASH.p2.ko, p1ko:window.CLASH.p1.ko}));
  await p.screenshot({path:'testing/tr-2-hits.png'});
  // test special
  await p.evaluate(()=>{ window.CLASH.p1.meter=100; window.CLASH.p1.atk=null; });
  await p.keyboard.press('KeyI'); await sleep(400);
  R.super=await p.evaluate(()=>({proj:window.CLASH.projCount(), state:window.CLASH.p1.state, dummyHp:Math.round(window.CLASH.p2.hp)}));
  await p.screenshot({path:'testing/tr-3-super.png'});
  await sleep(600);
  // ensure dummy never dies: hammer it
  await p.evaluate(()=>{ window.CLASH.p2.hp=5; });
  for(let i=0;i<4;i++){ await p.keyboard.press('KeyK'); await sleep(260); }
  R.dummyImmortal=await p.evaluate(()=>({dummyHp:Math.round(window.CLASH.p2.hp), ko:window.CLASH.p2.ko, p1Hp:Math.round(window.CLASH.p1.hp)}));
  // open menu
  await p.keyboard.press('KeyT'); await sleep(300);
  R.menuOpen=await p.evaluate(()=>window.CLASH.train.menu);
  await p.screenshot({path:'testing/tr-4-menu.png'});
  // reset via R (menu should still be open? R only when not menu) -> close then reset
  await p.keyboard.press('KeyT'); await sleep(200);
  await p.keyboard.press('KeyR'); await sleep(300);
  R.afterReset=await p.evaluate(()=>({dmg:Math.round(window.CLASH.train.dmg), dummyHp:Math.round(window.CLASH.p2.hp), p1Hp:Math.round(window.CLASH.p1.hp)}));
  // back to menu
  await p.keyboard.press('Escape'); await sleep(400);
  R.afterEsc=await p.evaluate(()=>window.CLASH.screen);
  R.errs=errs;
  console.log(JSON.stringify(R,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
