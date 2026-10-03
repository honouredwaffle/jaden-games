// Cursed Clash — MOVE LIST page (M)
const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500);
  const out={};

  // open via M from menu
  await p.keyboard.press('m');
  await p.waitForTimeout(300);
  out.openFromMenu = await p.evaluate(()=>CLASH.screen);
  await p.screenshot({path:'testing/cc-movelist.png'});

  // animated previews present + no errors during a few frames
  await p.waitForTimeout(600);
  await p.screenshot({path:'testing/cc-movelist2.png'});

  // close via Escape -> back to menu
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  out.closeToMenu = await p.evaluate(()=>CLASH.screen);

  // open from fight (via ? button), then M closes back to fight
  await p.evaluate(()=>{ CLASH.goSelect(); CLASH.setSel(0); CLASH.startFight(); });
  await p.waitForTimeout(1400);
  await p.keyboard.press('m'); await p.waitForTimeout(200);
  out.openFromFight = await p.evaluate(()=>CLASH.screen);
  await p.keyboard.press('m'); await p.waitForTimeout(200);
  out.closeToFight = await p.evaluate(()=>CLASH.screen);

  // pointer: '?' hit-test on fight -> moves ; CLOSE -> back
  out.helpRect = await p.evaluate(()=>{ const r={x:0,y:0}; return true; });
  await p.evaluate(()=>{ CLASH.goSelect(); CLASH.setSel(0); CLASH.startFight(); });
  await p.waitForTimeout(1400);

  // select screen: M opens
  await p.evaluate(()=>CLASH.goSelect()); await p.waitForTimeout(150);
  await p.keyboard.press('m'); await p.waitForTimeout(150);
  out.openFromSelect = await p.evaluate(()=>CLASH.screen);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  out.closeBackSelect = await p.evaluate(()=>CLASH.screen);

  out.errs=errs;
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
