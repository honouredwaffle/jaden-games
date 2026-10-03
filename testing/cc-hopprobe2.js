const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  await p.goto('file://'+process.cwd()+'/final-riot.html'); await p.waitForTimeout(400);
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false;
    window.__codes=[]; window.addEventListener('keydown',e=>window.__codes.push(e.code+'/'+e.key),true); });
  await p.waitForTimeout(1400);
  await p.keyboard.down('f');
  const keysF = await p.evaluate(()=>({KeyF:!!window.__keysProbe}));
  const stateBefore = await p.evaluate(()=>({codes:window.__codes.slice(), keyF:window.__probeKeys}));
  await p.keyboard.down('Space');
  const r = await p.evaluate(()=>{ const C=window.CLASH; return {codes:window.__codes.slice(), hopT:+C.p1.hopT.toFixed(2), state:C.p1.state, onGround:C.p1.onGround}; });
  await p.keyboard.up('Space'); await p.keyboard.up('f');
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
