// Cursed Clash — guard meter, block damage reduction, parry cooldown
const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);

  const out = await p.evaluate(()=>{
    const C=window.CLASH, R={};
    // helper: land one blocked hit of `kind` on p2 and report hp loss + guard gain
    function blockedHit(kind, meter0){
      C.goSelect(); C.setSel(0); C.startFight();
      const p1=C.p1,p2=C.p2;
      p1.x=400; p1.y=C.GROUND_Y(); p1.dir=1; p1.cooldown=0; p1.atk=null; p1.hitStun=0; p1.parryWindow=0;
      p2.x=470; p2.y=C.GROUND_Y(); p2.dir=-1; p2.hp=p2.maxhp; p2.blockMeter=meter0||0; p2.staggerT=0; p2.maxhp=p2.maxhp;
      p1.doAttack(kind);
      const dmg=p1.atk.dmg, before=p2.hp;
      for(let i=0;i<40;i++){ p2.state=C.POSE.BLOCK; p2.onGround=true; p2.dir=-1; p2.blockStun=0; p2.staggerT=0;
        p1.update(1/60,p2); p2.blockStun=0;
        if(p2.hp<before) break; }
      return {dmg, hpDrop:+(before-p2.hp).toFixed(2), meter:+p2.blockMeter.toFixed(1)};
    }

    // 1. block = 75% damage reduction
    R.blockPunch = blockedHit('punch');
    R.blockSlam  = blockedHit('slam');
    R.blockPunch.expected = Math.max(1, Math.round(R.blockPunch.dmg*0.25));
    R.blockSlam.expected  = Math.max(1, Math.round(R.blockSlam.dmg*0.25));

    // 2. different moves tax the guard differently
    R.guardPerMove = {punch:blockedHit('punch',0).meter, kick:blockedHit('kick',0).meter,
      slam:blockedHit('slam',0).meter, super:null};
    // super tax via a synthetic blocked hit
    (()=>{ C.goSelect(); C.setSel(0); C.startFight(); const p1=C.p1,p2=C.p2;
      p1.x=400;p2.x=470;p2.dir=-1;p2.blockMeter=0;p2.hp=p2.maxhp;
      p2.state=C.POSE.BLOCK; p2.onGround=true;
      p2.takeHit(p1,{dmg:20,kb:200,stun:.3,super:true,yoff:-60});
      R.guardPerMove.super=+p2.blockMeter.toFixed(1);
    })();

    // 3. guard meter decays over time
    (()=>{ C.goSelect(); C.setSel(0); C.startFight(); const p2=C.p2; p2.ai=false; p2.blockMeter=60;
      const t0=p2.blockMeter; for(let i=0;i<60;i++) p2.update(1/60,C.p1);
      R.decay={from:t0, to:+p2.blockMeter.toFixed(1)};
    })();

    // 4. guard break -> 1.5s stagger, meter reset, can't act
    (()=>{ C.goSelect(); C.setSel(0); C.startFight(); const p1=C.p1,p2=C.p2;
      p1.x=400;p2.x=470;p2.dir=-1;p2.blockMeter=95;p2.hp=p2.maxhp;
      p2.state=C.POSE.BLOCK; p2.takeHit(p1,{dmg:18,kb:470,stun:.5,yoff:-70});
      R.breakGuard={ stagger:+p2.staggerT.toFixed(2), meter:+p2.blockMeter.toFixed(1), state:p2.state, isStagger:p2.state===C.POSE.STAGGER };
      const cd0=p2.cooldown; p2.cooldown=0; p2.doAttack&&p2.doAttack('punch');
      R.breakGuard.atkBlocked = !p2.atk;   // can't attack while staggered
      // after stagger ends, meter drain keeps working
      for(let i=0;i<100;i++) p2.update(1/60,p1);
      R.breakGuard.staggerAfter = +p2.staggerT.toFixed(2);
    })();

    // 5. parry cooldown = 20s, blocks a second parry
    (()=>{ C.goSelect(); C.setSel(0); C.startFight(); const p1=C.p1;
      p1.cooldown=0;p1.atk=null;p1.hitStun=0;p1.parryWindow=0;p1.parryCool=0;
      p1.doParry();
      const first={window:+p1.parryWindow.toFixed(2), cool:+p1.parryCool.toFixed(1)};
      p1.parryWindow=0;                       // simulate the window expiring
      p1.doParry();                           // should be refused (on cooldown)
      R.parry={cd:C.PARRY_CD, first, secondRefused: p1.parryWindow===0 && p1.parryCool<=C.PARRY_CD};
    })();

    // 6. F + LMB pressed together -> parry
    (()=>{ C.goSelect(); C.setSel(0); C.startFight(); C.resetInput(); const p1=C.p1;
      p1.cooldown=0;p1.atk=null;p1.hitStun=0;p1.parryWindow=0;p1.parryCool=0;
      C.pressInput('block'); C.pressInput('punch');   // F then LMB inside the window
      R.parryCombo={ window:+p1.parryWindow.toFixed(2), atk: p1.atk&&p1.atk.kind, pending:C.pending.kind };
      C.resetInput(); p1.parryWindow=0;p1.parryCool=0;p1.cooldown=0;p1.atk=null;
      C.pressInput('punch'); C.pressInput('block');   // LMB then F
      R.parryComboReverse={ window:+p1.parryWindow.toFixed(2) };
    })();

    return R;
  });

  out.errs=errs;
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
