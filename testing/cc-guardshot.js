const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500);
  // A: guard meter built + parry on cooldown
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.setArenaOverride(0); C.startFight(); C.p2.ai=false;
    C.p1.x=360; C.p2.x=780; C.p2.dir=-1; C.p1.parryCool=17; });
  await p.waitForTimeout(1400);
  await p.evaluate(()=>{ window.CLASH.p2.blockMeter=62; window.CLASH.p1.parryCool=17; });
  await p.waitForTimeout(120);
  await p.screenshot({path:'testing/cc-guardmeter.png'});
  // B: guard break stagger
  await p.evaluate(()=>{ const C=window.CLASH; C.p2.breakGuard(); });
  await p.waitForTimeout(120);
  await p.screenshot({path:'testing/cc-stagger.png'});
  // C: crouch pose
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.staggerT=0; C.p2.blockMeter=0; C.p2.staggerT=0;
    C.p1.state=C.POSE.CROUCH; C.held.crouch=true; });
  await p.waitForTimeout(200);
  await p.screenshot({path:'testing/cc-crouch.png'});
  // D: mobile pad
  await p.evaluate(()=>{ window.CLASH.setCtrlMode(1); window.CLASH.held.crouch=false; });
  await p.waitForTimeout(200);
  await p.screenshot({path:'testing/cc-pad-new.png'});
  console.log(JSON.stringify({errs}));
  await b.close();
})();
