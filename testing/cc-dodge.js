// Cursed Clash — dodge inputs via REAL Playwright keys (clean page, no prior state)
const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false; });
  await p.waitForTimeout(1400);
  async function clean(){ await p.evaluate(()=>{ const C=window.CLASH; C.resetInput();
    const f=C.p1; f.cooldown=0;f.atk=null;f.hitStun=0;f.parryWindow=0;f.superT=0;f.vx=0;f.vy=0;f.onGround=true;
    f.rolling=false;f.rollT=0;f.hopT=0;f.tripped=false;f.getupT=0;f.staggerT=0;f.x=360; f.hp=f.maxhp;
    C.p2.x=760; C.p2.atk=null; C.p2.cooldown=0; }); await p.waitForTimeout(50); }
  const out={};

  // F + Space = hop
  await clean();
  await p.keyboard.down('f'); await p.keyboard.down('Space');
  out.hopFSpace = await p.evaluate(()=>{ const C=window.CLASH; return {hopT:+C.p1.hopT.toFixed(2), isHop:C.p1.state===C.POSE.HOP, airborne:!C.p1.onGround, vy:C.p1.vy}; });
  await p.keyboard.up('Space'); await p.keyboard.up('f');

  // Space + D = roll right
  await clean();
  await p.keyboard.down('d'); await p.keyboard.down('Space'); await p.keyboard.up('Space');
  out.rollD = await p.evaluate(()=>{ const C=window.CLASH; return {rolling:C.p1.rolling, dir:C.p1.rollDir}; });
  await p.keyboard.up('d');

  // Space + A = roll left
  await clean();
  await p.keyboard.down('a'); await p.keyboard.down('Space'); await p.keyboard.up('Space');
  out.rollA = await p.evaluate(()=>{ const C=window.CLASH; return {rolling:C.p1.rolling, dir:C.p1.rollDir}; });
  await p.keyboard.up('a');

  // bare Space still = jump (not a hop/roll)
  await clean();
  await p.keyboard.press('Space'); await p.waitForTimeout(220);
  out.bareSpace = await p.evaluate(()=>{ const C=window.CLASH; return {hopT:+C.p1.hopT.toFixed(2), rolling:C.p1.rolling, airborne:!C.p1.onGround}; });
  await p.keyboard.up('Space');

  // functional: hop dodges a sweep, roll dodges a punch
  out.funcDodge = await p.evaluate(()=>{
    const C=window.CLASH, R={};
    const sweepAtk=()=>({kind:'sweep',dmg:9,kb:150,stun:.44,reach:92,yoff:8,award:12,bypass:true});
    const punchAtk=()=>({kind:'punch',dmg:6,kb:130,stun:.22,reach:66,yoff:-70,award:8});
    function fresh(){ C.goSelect(); C.setSel(0); C.startFight(); const a=C.p1,d=C.p2; a.ai=false; d.ai=false; a.x=400; d.x=470; a.dir=1; d.dir=-1;
      a.tripped=false;a.getupT=0;a.rolling=false;a.rollT=0;a.hopT=0;a.staggerT=0;a.onGround=true; a.hp=a.maxhp; return {a,d}; }
    { const {a,d}=fresh(); a.tryHop(); a.update(1/60,d); R.hopVsSweep=a.takeHit(d, sweepAtk()); }
    { const {a,d}=fresh(); a.tryRoll(1); a.update(1/60,d); R.rollVsPunch=a.takeHit(d, punchAtk()); }
    { const {a,d}=fresh(); R.punchNoDodge=a.takeHit(d, punchAtk()); }   // control: not dodging = hit
    return R;
  });

  out.errs=errs;
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
