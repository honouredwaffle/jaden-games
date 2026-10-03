const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>{ const C=window.CLASH; C.goSelect(); C.setSel(0); C.setArenaOverride(2); C.startFight(); C.p1.x=320; C.p2.x=680; });
  await p.waitForTimeout(1400);
  await p.screenshot({path:'testing/cc-arena-void-hud.png'});
  console.log(JSON.stringify({errs}));
  await b.close();
})();
