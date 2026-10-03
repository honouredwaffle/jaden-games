// Cursed Clash — bypass/guard-break vs a blocking foe (post trip-rework)
const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);

  const out = await p.evaluate(()=>{
    const C=window.CLASH, R={};
    function fresh(){ C.goSelect(); C.setSel(0); C.startFight(); const p1=C.p1,p2=C.p2; p1.ai=false; p2.ai=false;
      p1.x=400; p2.x=470; p1.dir=1; p2.dir=-1; p1.cooldown=0; p1.atk=null;
      p2.hp=p2.maxhp; p2.blockMeter=20; p2.staggerT=0; p2.tripped=false; p2.getupT=0; p2.state=C.POSE.BLOCK; p2.onGround=true; return {p1,p2}; }
    const A=k=>({kind:k, dmg:{punch:6,kick:10,sweep:9,slam:18}[k], kb:{punch:130,kick:260,sweep:150,slam:470}[k],
      stun:.3, reach:80, yoff:-60, award:12, bypass:k==='sweep', guardBreak:k==='slam'});
    // normal moves are only reduced 75%
    { const {p1,p2}=fresh(); const before=p2.hp; const res=p2.takeHit(p1, A('punch'));
      R.punchBlocked={ res, hpDrop:before-p2.hp, meter:+p2.blockMeter.toFixed(0) }; }
    { const {p1,p2}=fresh(); const before=p2.hp; const res=p2.takeHit(p1, A('kick'));
      R.kickBlocked={ res, hpDrop:before-p2.hp }; }
    // sweep bypasses the guard -> TRIP, full dmg, meter to max
    { const {p1,p2}=fresh(); const before=p2.hp; const res=p2.takeHit(p1, A('sweep'));
      R.sweepTrip={ res, hpDrop:before-p2.hp, meter:+p2.blockMeter.toFixed(0), tripped:p2.tripped, isTrip:p2.state===C.POSE.TRIP }; }
    // slam breaks the guard -> full dmg, meter to max, 1.4s stagger
    { const {p1,p2}=fresh(); const before=p2.hp; const res=p2.takeHit(p1, A('slam'));
      R.slamBreak={ res, hpDrop:before-p2.hp, meter:+p2.blockMeter.toFixed(0), stagger:+p2.staggerT.toFixed(2), isStagger:p2.state===C.POSE.STAGGER }; }
    return R;
  });
  out.errs=errs;
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
