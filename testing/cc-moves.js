const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(500);

  // ---- each move connects + applies its effect ----
  const moveResults = await p.evaluate(()=>{
    const C=window.CLASH, KINDS=['punch','kick','upper','sweep','dash','slam'], out=[];
    for(const k of KINDS){
      C.goSelect(); C.setSel(0); C.startFight();
      const p1=C.p1, p2=C.p2;
      p1.x=400; p1.y=C.GROUND_Y(); p1.dir=1; p1.cooldown=0; p1.atk=null; p1.hitStun=0; p1.parryWindow=0;
      p2.x=470; p2.y=C.GROUND_Y(); p2.dir=-1; p2.hp=p2.maxhp; p2.invuln=0; p2.onGround=true; p2.vy=0;
      const before=p2.hp; let launched=false, hit=false, sawLunge=false;
      p1.doAttack(k);
      const startX=p1.x;
      for(let i=0;i<45;i++){ p1.update(1/60,p2); if(p2.hp<before){ hit=true; } if(!p2.onGround && p2.vy<0) launched=true;
        if(Math.abs(p1.x-startX)>25) sawLunge=true; }
      out.push({kind:k, state:p1.state, dealt:before-p2.hp, hit, launched, sawLunge});
    }
    return out;
  });

  // ---- mouse: right click = kick, left click = punch ----
  const mouse = {};
  await p.evaluate(()=>{ const C=window.CLASH; C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false; C.p2.x=760; C.p1.x=360;
    C.p1.cooldown=0; C.p1.hitStun=0; C.p1.atk=null; C.p1.parryWindow=0; });
  await p.waitForTimeout(1300);
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.cooldown=0; C.p1.hitStun=0; C.p1.atk=null; C.p2.x=760; C.p1.x=360; });
  await p.mouse.click(640,400,{button:'right'});
  await p.waitForTimeout(120);
  mouse.afterRight = await p.evaluate(()=>window.CLASH.p1.atk && window.CLASH.p1.atk.kind);
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.cooldown=0; C.p1.hitStun=0; C.p1.atk=null; });
  await p.mouse.click(640,400,{button:'left'});
  await p.waitForTimeout(120);
  mouse.afterLeft = await p.evaluate(()=>window.CLASH.p1.atk && window.CLASH.p1.atk.kind);

  // ---- keys Z X C V ----
  const keys = {};
  for(const [code,exp] of [['KeyZ','upper'],['KeyX','sweep'],['KeyC','dash'],['KeyV','slam']]){
    await p.evaluate(()=>{ const C=window.CLASH; C.p1.cooldown=0; C.p1.atk=null; C.p1.hitStun=0; });
    await p.keyboard.press(code); await p.waitForTimeout(90);
    keys[code] = await p.evaluate(()=>window.CLASH.p1.atk && window.CLASH.p1.atk.kind);
  }

  // ---- AI uses varied moves ----
  const aiKinds = await p.evaluate(()=>{
    const C=window.CLASH; C.setDiffIndex(2); C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=true;
    C.p1.x=400; C.p2.x=470;
    const seen=new Set();
    for(let i=0;i<1800;i++){ C.p1.update(1/60,C.p2); C.p2.update(1/60,C.p1);
      if(C.p2.atk) seen.add(C.p2.atk.kind);
      if(Math.abs(C.p2.x-C.p1.x)>300){ C.p2.x=C.p1.x+80; } }
    return [...seen];
  });

  // mobile buttons present & wired
  const mobileBtns = await p.evaluate(()=>{
    document.querySelectorAll('#pad .btn').forEach(b=>b.removeAttribute('style'));
    const btns=[...document.querySelectorAll('#pad .btn')].map(b=>b.dataset.k);
    return btns;
  });

  console.log(JSON.stringify({moveResults, mouse, keys, aiKinds, mobileBtns, errs},null,1));
  await b.close();
})();
