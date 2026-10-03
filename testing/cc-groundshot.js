const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(500);
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.setArenaOverride(0); C.startFight(); C.p2.ai=false; C.p1.x=360; C.p2.x=640; });
  await p.waitForTimeout(1400);
  // A: opponent tripped on the ground
  await p.evaluate(()=>{ const C=window.CLASH; C.p2.dir=-1; C.p2.trip(1.1); });
  await p.waitForTimeout(200); await p.screenshot({path:'testing/cc-g-trip.png'});
  // B: getup mid-way
  await p.evaluate(()=>{ const C=window.CLASH; C.p2.tripped=false; C.p2.getupT=C.GETUP_TIME*0.45; C.p2.state=C.POSE.GETUP; });
  await p.waitForTimeout(120); await p.screenshot({path:'testing/cc-g-getup.png'});
  // C: roll
  await p.evaluate(()=>{ const C=window.CLASH; C.p2.getupT=0; C.p2.state=C.POSE.IDLE; C.p1.tryRoll(1); for(let i=0;i<9;i++) C.p1.update(1/60,C.p2); });
  await p.waitForTimeout(30); await p.screenshot({path:'testing/cc-g-roll.png'});
  // D: hop apex
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.rolling=false; C.p1.rollT=0; C.p1.tryHop(); for(let i=0;i<20;i++) C.p1.update(1/60,C.p2); });
  await p.waitForTimeout(30); await p.screenshot({path:'testing/cc-g-hop.png'});
  console.log(JSON.stringify({errs}));
  await b.close();
})();
