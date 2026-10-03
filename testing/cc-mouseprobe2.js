const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>{ const C=window.CLASH; C.goSelect(); C.setSel(0); C.startFight(); C.p1.x=400; C.p2.x=470; });
  await p.waitForTimeout(1400);
  const direct = await p.evaluate(()=>{ const C=window.CLASH; C.p1.cooldown=0; C.p1.doAttack('kick'); return C.p1.atk && C.p1.atk.kind; });
  await p.waitForTimeout(500);
  // synth dispatch of a real pointerdown with button 2
  const synth = await p.evaluate(()=>{ const C=window.CLASH; C.p1.cooldown=0; C.p1.atk=null; C.p1.hitStun=0;
    const cv=document.getElementById('c'); const r=cv.getBoundingClientRect();
    cv.dispatchEvent(new PointerEvent('pointerdown',{button:2,buttons:2,clientX:r.left+600,clientY:r.top+400,bubbles:true}));
    return {screen:C.screen, atk:C.p1.atk && C.p1.atk.kind}; });
  await p.waitForTimeout(120);
  const after = await p.evaluate(()=>window.CLASH.p1.atk && window.CLASH.p1.atk.kind);
  console.log(JSON.stringify({direct, synth, after, errs},null,1));
  await b.close();
})();
