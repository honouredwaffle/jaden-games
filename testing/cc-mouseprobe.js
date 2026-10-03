const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>{ const C=window.CLASH; C.goSelect(); C.setSel(0); C.startFight(); C.p1.x=400; C.p2.x=470; });
  await p.waitForTimeout(1400);
  // instrument
  await p.evaluate(()=>{ window.__logs=[]; document.getElementById('c').addEventListener('pointerdown',e=>window.__logs.push({btn:e.button,x:Math.round(e.clientX),y:Math.round(e.clientY),screen:window.CLASH.screen}),true); });
  await p.mouse.click(640,400,{button:'right'});
  await p.waitForTimeout(150);
  const logs = await p.evaluate(()=>window.__logs);
  const atk = await p.evaluate(()=>window.CLASH.p1.atk && window.CLASH.p1.atk.kind);
  console.log(JSON.stringify({logs, atk, errs},null,1));
  await b.close();
})();
