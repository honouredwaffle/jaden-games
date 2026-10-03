// Cursed Clash — new input scheme via REAL keyboard/mouse events
const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>{ window.__dbg=[]; window.addEventListener('keydown',e=>{window.__dbg.push(e.code);},true); });
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false; });
  await p.waitForTimeout(1500);
  await p.mouse.move(640,400);

  async function reset(){
    await p.evaluate(()=>{ const C=window.CLASH; C.resetInput();
      C.p1.cooldown=0; C.p1.atk=null; C.p1.hitStun=0; C.p1.parryWindow=0; C.p1.superT=0;
      C.p1.vx=0; C.p1.vy=0; C.p1.onGround=true; C.p1.x=360; C.p1.hp=C.p1.maxhp; C.p2.x=760;
      C.p1.rolling=false; C.p1.rollT=0; C.p1.hopT=0; C.p1.tripped=false; C.p1.getupT=0; C.p1.staggerT=0; });
    await p.waitForTimeout(60);
  }
  async function capture(ms=400){
    const kinds=new Set(); const t0=Date.now();
    while(Date.now()-t0<ms){ const k=await p.evaluate(()=>window.CLASH.p1.atk&&window.CLASH.p1.atk.kind); if(k)kinds.add(k); await p.waitForTimeout(20); }
    return [...kinds];
  }
  async function keyUpAll(){ for(const k of ['Space','Control','q','f','p','i','j','k']) await p.keyboard.up(k).catch(()=>{}); }
  const out={};

  // mouse left -> punch
  await reset();
  await p.mouse.down({button:'left'}); await p.mouse.up({button:'left'});
  out.punch = await capture();

  // mouse right -> kick
  await reset();
  await p.mouse.down({button:'right'}); await p.mouse.up({button:'right'});
  out.kick = await capture();

  // left then right quickly -> slam
  await reset();
  await p.mouse.down({button:'left'}); await p.mouse.down({button:'right'});
  out.slam = await capture();
  await p.mouse.up({button:'left'}); await p.mouse.up({button:'right'});

  // Space + left click -> uppercut (no jump)
  await reset();
  await p.keyboard.down('Space'); await p.mouse.down({button:'left'}); await p.mouse.up({button:'left'}); await p.keyboard.up('Space');
  out.upper = await capture();
  out.upperAirborne = await p.evaluate(()=>!window.CLASH.p1.onGround);

  // Ctrl + right click -> sweep
  await reset();
  await p.keyboard.down('Control'); await p.mouse.down({button:'right'}); await p.mouse.up({button:'right'}); await p.keyboard.up('Control');
  out.sweep = await capture();

  // q -> dash
  await reset();
  await p.keyboard.down('q'); await p.keyboard.up('q');
  out.dash = await capture();

  // Space alone -> jump
  await reset();
  await p.keyboard.down('Space'); await p.waitForTimeout(250); out.jumpAirborne = await p.evaluate(()=>!window.CLASH.p1.onGround); await p.keyboard.up('Space');

  // F held -> block state
  await reset();
  await p.keyboard.down('f'); await p.waitForTimeout(80);
  out.blockF = await p.evaluate(()=>{ const C=window.CLASH; return C.p1.state===C.POSE.BLOCK; });
  await p.keyboard.up('f');

  // L no longer blocks
  await reset();
  await p.keyboard.down('l'); await p.waitForTimeout(80);
  out.blockL = await p.evaluate(()=>{ const C=window.CLASH; return C.p1.state===C.POSE.BLOCK; });
  await p.keyboard.up('l');

  // F + Space -> hop, Space + A/D -> roll (dedicated real-key coverage lives in cc-dodge.js)

  await keyUpAll();
  out.errs=errs;
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
