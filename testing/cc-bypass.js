// Cursed Clash — bypass (sweep) and guard-break (slam) moves
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
    // land one attack of `kind` on a BLOCKING p2, report dmg taken + meter + stagger + result
    function vsBlock(kind){
      C.goSelect(); C.setSel(0); C.startFight();
      const p1=C.p1,p2=C.p2;
      p1.x=400; p1.y=C.GROUND_Y(); p1.dir=1; p1.cooldown=0; p1.atk=null; p1.hitStun=0; p1.parryWindow=0;
      p2.x=470; p2.y=C.GROUND_Y(); p2.dir=-1; p2.hp=p2.maxhp; p2.blockMeter=20; p2.staggerT=0;
      p1.doAttack(kind);
      const before=p2.hp, dmg=p1.atk.dmg;
      for(let i=0;i<40;i++){ p2.state=C.POSE.BLOCK; p2.onGround=true; p2.dir=-1;
        p1.update(1/60,p2);
        if(p2.hp<before) break; }
      return {dmg, hpDrop:Math.round(before-p2.hp), meter:+p2.blockMeter.toFixed(1),
        stagger:+p2.staggerT.toFixed(2), state:p2.state, staggered:p2.state===C.POSE.STAGGER};
    }
    R.punch_blocked = vsBlock('punch');   // normal: 25% + small meter tax
    R.kick_blocked  = vsBlock('kick');
    R.sweep_bypass  = vsBlock('sweep');   // bypass: full dmg, meter->max, 0.6s stagger
    R.slam_break    = vsBlock('slam');    // guardBreak: full dmg, meter->max, 1.4s stagger

    R.cfg = {bypassStagger:C.STAGGER_BYPASS, breakStagger:C.STAGGER_BREAK, fullBreakStagger:C.STAGGER_TIME};

    // A staggered fighter can't act
    (()=>{ C.goSelect(); C.setSel(0); C.startFight(); const p2=C.p2;
      p2.breakGuard(C.STAGGER_BYPASS);
      p2.cooldown=0; const before=p2.atk;
      // simulate holding block + trying to attack during stagger
      p2.doAttack('punch');
      R.staggerLocksOut = !p2.atk && p2.state===C.POSE.STAGGER;
    })();

    // bypass and guardbreak take full damage (not the 25%)
    R.bypassFullDamage = R.sweep_bypass.hpDrop===Math.round(R.sweep_bypass.dmg) || R.sweep_bypass.hpDrop>=R.sweep_bypass.dmg-1;
    R.breakFullDamage  = R.slam_break.hpDrop===Math.round(R.slam_break.dmg);

    return R;
  });

  out.errs=errs;
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
