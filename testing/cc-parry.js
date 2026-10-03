const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500);

  // ---- PARRY logic ----
  const parry = await p.evaluate(()=>{
    const C=window.CLASH, p1=C.p1, p2=C.p2;
    C.goSelect(); C.setSel(0);
    C.startFight();
    p1.x=400; p1.y=C.GROUND_Y(); p1.dir=1;
    p2.x=470; p2.y=C.GROUND_Y(); p2.dir=-1;
    // 1) NO parry -> takes damage + stun
    p1.parryWindow=0; p1.hp=p1.maxhp; p1.hitStun=0;
    const before=p1.hp;
    p1.takeHit(p2,{dmg:20,kb:200,stun:.3});
    const noParry={hpDrop:p1.hp<before, stun:p1.hitStun>0};
    // 2) PARRY facing attacker -> negated + counter started
    p1.hp=p1.maxhp; p1.hitStun=0; p1.atk=null; p1.cooldown=0;
    p1.doParry();
    const hadWindow=p1.parryWindow>0;
    const before2=p1.hp;
    const res=p1.takeHit(p2,{dmg:20,kb:200,stun:.3});
    const parryRes={hadWindow, res, hpKept:p1.hp>=before2, counterStarted:!!(p1.atk&&p1.atk.kind==='counter'), stun:p1.hitStun};
    // 3) PARRY but attacker BEHIND -> no parry (takes damage)
    p1.dir=1; p2.x=p1.x-80; p1.hp=p1.maxhp; p1.hitStun=0; p1.atk=null; p1.cooldown=0; p1.parryWindow=0;
    p1.doParry(); const before3=p1.hp;
    p1.takeHit(p2,{dmg:20,kb:200,stun:.3});
    const behind={hpDrop:p1.hp<before3};
    // 4) counter actually deals damage to the foe
    p1.dir=1; p2.x=p1.x+70; p2.hp=p2.maxhp; p1.hp=p1.maxhp; p1.cooldown=0; p1.atk=null; p1.parryWindow=0; p1.parryCool=0;
    const p2before=p2.hp;
    p1.doParry(); p1.takeHit(p2,{dmg:20,kb:200,stun:.3}); // triggers doCounter
    // advance the counter through its startup/active
    for(let i=0;i<20;i++){ p1.update(1/60, p2); }
    const counterDmg=p2.hp<p2before;
    return {noParry, parryRes, behind, counterDmg};
  });

  // ---- ARENAS ----
  const arenas = await p.evaluate(()=>{
    const C=window.CLASH; const out=[];
    for(let i=0;i<C.ARENAS.length;i++){ C.setArena(i); out.push({i, name:C.arena.name}); }
    return {count:C.ARENAS.length, list:out};
  });

  // screenshots of each arena in a live fight
  await p.evaluate(()=>{ const C=window.CLASH; C.goSelect(); C.setSel(2); C.startFight(); });
  await p.waitForTimeout(1400);
  for(let i=0;i<4;i++){
    await p.evaluate((i)=>{ const C=window.CLASH; C.setArenaOverride(i); C.startFight(); window.CLASH.p1.x=300; window.CLASH.p2.x=700; }, i);
    await p.waitForTimeout(1300);
    await p.screenshot({path:`testing/cc-arena-${i}.png`});
  }
  // parry showcase: force a parry + counter against the AI
  await p.evaluate(()=>{ const C=window.CLASH; C.setArenaOverride(0); C.setSel(0); C.startFight(); });
  await p.waitForTimeout(1300);
  await p.evaluate(()=>{ const C=window.CLASH, p1=C.p1, p2=C.p2;
    p2.x=p1.x+95; p2.y=C.GROUND_Y(); p1.dir=1;
    p1.doParry();
  });
  await p.waitForTimeout(60);
  await p.screenshot({path:'testing/cc-parry-stance.png'});
  await p.evaluate(()=>{ const C=window.CLASH, p1=C.p1, p2=C.p2;
    p1.parryWindow=0.3; p1.takeHit(p2,{dmg:16,kb:200,stun:.3});
  });
  await p.waitForTimeout(120);
  await p.screenshot({path:'testing/cc-parry-hit.png'});

  console.log(JSON.stringify({parry, arenas, errs},null,1));
  await b.close();
})();
