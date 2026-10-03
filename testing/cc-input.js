// Cursed Clash — new input scheme tests
// LMB punch · RMB kick · LMB+RMB slam · Space+LMB uppercut · Ctrl+RMB sweep · Q dash · Space jump · F block
const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false; });
  await p.waitForTimeout(1500);   // let the ROUND 1 intro finish so the fight is live

  async function reset(){
    await p.evaluate(()=>{ const C=window.CLASH;
      C.resetInput();
      C.p1.cooldown=0; C.p1.atk=null; C.p1.hitStun=0; C.p1.parryWindow=0; C.p1.superT=0;
      C.p1.vx=0; C.p1.vy=0; C.p1.onGround=true; C.p1.x=360; C.p1.hp=C.p1.maxhp;
      C.p2.x=760; C.p2.atk=null; C.p2.cooldown=0; C.p2.hitStun=0;
    });
    await p.waitForTimeout(60);
  }
  async function capture(ms=420){
    const kinds=new Set(); const t0=Date.now();
    while(Date.now()-t0<ms){
      const k=await p.evaluate(()=>window.CLASH.p1.atk&&window.CLASH.p1.atk.kind);
      if(k)kinds.add(k);
      await p.waitForTimeout(20);
    }
    return [...kinds];
  }
  const out={};

  // 1. lone LMB -> punch
  await reset();
  await p.evaluate(()=>{ const C=window.CLASH; C.held.punch=true; C.pressInput('punch'); });
  out.punch = await capture();

  // 2. lone RMB -> kick
  await reset();
  await p.evaluate(()=>{ const C=window.CLASH; C.held.kick=true; C.pressInput('kick'); });
  out.kick = await capture();

  // 3. LMB+RMB together -> slam
  await reset();
  await p.evaluate(()=>{ const C=window.CLASH; C.held.kick=true; C.pressInput('kick'); C.held.punch=true; C.pressInput('punch'); });
  out.slam = await capture();

  // 3b. RMB then LMB (reverse order) -> slam
  await reset();
  await p.evaluate(()=>{ const C=window.CLASH; C.held.punch=true; C.pressInput('punch'); C.held.kick=true; C.pressInput('kick'); });
  out.slamReverse = await capture();

  // 4. Space+LMB together -> uppercut, and NO jump
  await reset();
  await p.evaluate(()=>{ const C=window.CLASH; C.held.jump=true; C.pressInput('jump'); C.held.punch=true; C.pressInput('punch'); });
  out.upper = await capture();
  out.upperAirborne = await p.evaluate(()=>!window.CLASH.p1.onGround);
  out.upperPendingJump = await p.evaluate(()=>window.CLASH.pending.jump);

  // 5. crouch (Ctrl) + RMB -> sweep (no window)
  await reset();
  await p.evaluate(()=>{ const C=window.CLASH; C.held.crouch=true; C.held.kick=true; C.pressInput('kick'); });
  out.sweep = await capture();
  out.sweepImmediate = await p.evaluate(()=>window.CLASH.p1.atk&&window.CLASH.p1.atk.kind);

  // 6. Q -> dash
  await reset();
  await p.evaluate(()=>{ window.CLASH.pressInput('dash'); });
  out.dash = await capture();

  // 7. Space alone -> jump
  await reset();
  await p.evaluate(()=>{ const C=window.CLASH; C.held.jump=true; C.pressInput('jump'); });
  await p.waitForTimeout(250);
  out.jumpAirborne = await p.evaluate(()=>!window.CLASH.p1.onGround);
  out.jumpAtk = await p.evaluate(()=>window.CLASH.p1.atk&&window.CLASH.p1.atk.kind);

  // 8. crouch held -> player state becomes CROUCH
  await reset();
  await p.evaluate(()=>{ window.CLASH.held.crouch=true; });
  await p.waitForTimeout(80);
  out.crouchState = await p.evaluate(()=>{ const C=window.CLASH; return C.p1.state===C.POSE.CROUCH; });

  out.errs=errs;
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
