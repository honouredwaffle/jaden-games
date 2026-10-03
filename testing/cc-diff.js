const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500);

  // menu: difficulty selector + click
  await p.screenshot({path:'testing/cc-diff-menu.png'});
  await p.click('body');            // -> select
  await p.waitForTimeout(300);
  await p.screenshot({path:'testing/cc-diff-select.png'});

  // pick HARD and verify AI parries a telegraphed attack
  const aiTest = await p.evaluate(async()=>{
    const C=window.CLASH;
    C.setDiffIndex(2);              // HARD
    C.goSelect(); C.setSel(0); C.setArenaOverride(0); C.startFight();
    C.p1.x=400; C.p2.x=520; // close, P2 is AI
    C.p2.hp=C.p2.maxhp; C.p2.parryCool=0; C.p2.parryWindow=0;
    let parried=0, tookHit=0, aiParryFrames=0;
    // simulate 6 seconds; P1 throws punches into the AI
    for(let i=0;i<360;i++){
      const dt=1/60;
      if(i%24===0){ C.p1.x=Math.max(200,C.p1.x-0); C.p1.parryWindow=0; C.p1.doAttack('punch'); }
      const hb=C.p2.hp;
      C.p1.update(dt,C.p2); C.p2.update(dt,C.p1);
      if(C.p2.state===10) aiParryFrames++;
      if(C.p2.hp>hb) parried++;
      if(C.p2.hp<hb) tookHit++;
    }
    return {diff:C.diff, aiParryFrames, aiParried:parried, tookHit, aiHp:C.p2.hp, aiAtkKind:C.p2.atk&&C.p2.atk.kind};
  });

  // verify difficulty actually changes dmg
  const dmgByDiff = await p.evaluate(()=>{
    const C=window.CLASH, out=[];
    for(let d=0;d<3;d++){
      C.setDiffIndex(d); C.goSelect(); C.setSel(0); C.startFight();
      C.p2.hp=C.p2.maxhp; C.p1.x=400; C.p1.dir=1; C.p2.x=470; C.p2.invuln=0;
      C.p1.cooldown=0; C.p1.parryWindow=0; C.p1.doAttack('punch');
      const before=C.p2.hp;
      for(let i=0;i<10;i++) C.p1.update(1/60,C.p2);
      out.push({d, dmg:before-C.p2.hp});
    }
    return out;
  });

  console.log(JSON.stringify({aiTest, dmgByDiff, errs},null,1));
  await b.close();
})();
