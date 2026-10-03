// Cursed Clash — defensive hop (F+Space keeps guard up) vs plain hop
const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);

  // API-level: tryHop(guarding) sets hopBlocked + lower lift; still dodges a sweep
  const api = await p.evaluate(()=>{
    const C=window.CLASH, R={};
    function fresh(){ C.goSelect(); C.setSel(0); C.startFight(); const a=C.p1,d=C.p2; a.ai=false; d.ai=false; a.x=400; d.x=470; a.dir=1; d.dir=-1;
      a.tripped=false;a.getupT=0;a.rolling=false;a.rollT=0;a.hopT=0;a.hopBlocked=false;a.staggerT=0;a.onGround=true;a.cooldown=0;a.atk=null; a.hp=a.maxhp; return {a,d}; }
    const sweepAtk=()=>({kind:'sweep',dmg:9,kb:150,stun:.44,reach:92,yoff:8,award:12,bypass:true});
    const punchAtk=()=>({kind:'punch',dmg:6,kb:130,stun:.22,reach:66,yoff:-70,award:8});
    { const {a,d}=fresh(); a.tryHop(true); a.update(1/60,d);
      R.guardingHop={ hopBlocked:a.hopBlocked, hopT:+a.hopT.toFixed(2), vy:a.vy, onGround:a.onGround, state:a.state, dodgesSweep:a.takeHit(d, sweepAtk()) }; }
    { const {a,d}=fresh(); a.tryHop(false); a.update(1/60,d);
      R.plainHop={ hopBlocked:a.hopBlocked, hopT:+a.hopT.toFixed(2), vy:a.vy, dodgesSweep:a.takeHit(d, sweepAtk()) }; }
    { const {a,d}=fresh(); a.tryHop(true); a.update(1/60,d); R.guardHopVsPunch=a.takeHit(d, punchAtk()); }   // still punished by normals
    R.lift={lift:C.HOP_LIFT, liftBlock:C.HOP_LIFT_BLOCK};
    return R;
  });

  // REAL keys: hold F then Space -> hopBlocked true; bare Space -> hopBlocked false
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false; });
  await p.waitForTimeout(1400);
  async function clean(){ await p.evaluate(()=>{ const C=window.CLASH; C.resetInput(); const f=C.p1;
    f.cooldown=0;f.atk=null;f.hitStun=0;f.vx=0;f.vy=0;f.onGround=true;f.rolling=false;f.rollT=0;f.hopT=0;f.hopBlocked=false;f.tripped=false;f.getupT=0;f.staggerT=0;f.x=360;});
    await p.waitForTimeout(40); }
  await clean();
  await p.keyboard.down('f'); await p.keyboard.down('Space');
  const keysHop = await p.evaluate(()=>{ const C=window.CLASH; return {hopBlocked:C.p1.hopBlocked, hopT:+C.p1.hopT.toFixed(2), state:C.p1.state}; });
  await p.keyboard.up('Space'); await p.keyboard.up('f');
  await clean();
  await p.keyboard.press('Space'); await p.waitForTimeout(30);
  const keysPlain = await p.evaluate(()=>{ const C=window.CLASH; return {hopBlocked:C.p1.hopBlocked, hopT:+C.p1.hopT.toFixed(2)}; });
  await p.keyboard.up('Space');

  // screenshots: guard-up hop vs plain hop
  await p.evaluate(()=>{ const C=window.CLASH; C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false; C.p1.x=380; C.p2.x=680; });
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.dir=1; C.p2.dir=-1; C.p1.tryHop(true); for(let i=0;i<12;i++) C.p1.update(1/60,C.p2); });
  await p.waitForTimeout(40); await p.screenshot({path:'testing/cc-hop-block.png'});
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.hopT=0; C.p1.hopBlocked=false; C.p1.onGround=true; C.p1.y=C.GROUND_Y(); C.p1.tryHop(false); for(let i=0;i<12;i++) C.p1.update(1/60,C.p2); });
  await p.waitForTimeout(40); await p.screenshot({path:'testing/cc-hop-plain.png'});

  console.log(JSON.stringify({api, keysHop, keysPlain, errs}, null, 1));
  await b.close();
})();
